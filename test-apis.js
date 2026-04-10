// test-apis.js — Sequential API tests for MediCare microservices
// Usage: node test-apis.js
// Requires Node 18+ (built-in fetch)

// All requests go through the API Gateway
const GATEWAY = 'http://localhost:3000';

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

let passed = 0;
let failed = 0;
let savedToken = null;

function pass(testNum, label) {
  console.log(`✅ PASS - Test ${testNum}: ${label}`);
  passed++;
}

function fail(testNum, label, reason) {
  console.log(`❌ FAIL - Test ${testNum}: ${label} → ${reason}`);
  failed++;
}

async function request(url, options = {}) {
  const { headers: customHeaders, ...rest } = options;
  const res = await fetch(url, {
    ...rest,
    headers: { 'Content-Type': 'application/json', ...(customHeaders || {}) },
  });
  let body = null;
  try { body = await res.json(); } catch { body = null; }
  return { status: res.status, body };
}

async function runTests() {
  console.log('='.repeat(55));
  console.log('  MediCare API Test Suite (via Gateway)');
  console.log('='.repeat(55));

  // ── GATEWAY HEALTH CHECK ─────────────────────────────────
  console.log('\n--- API GATEWAY ---');

  // Test 0: Gateway health
  await delay(500);
  try {
    const { status, body } = await request(`${GATEWAY}/health`, { method: 'GET' });
    if (status === 200 && body?.status === 'ok' && body?.routes) {
      pass(0, `Gateway health (routes: ${body.routes.join(', ')})`);
    } else {
      fail(0, 'Gateway health', `Expected status 200 with routes, got ${status}`);
    }
  } catch (err) { fail(0, 'Gateway health', `Request failed: ${err.message}`); }

  // ── AUTH SERVICE (via Gateway) ───────────────────────────
  console.log('\n--- AUTH SERVICE ---');

  // Test 1: Register patient
  await delay(500);
  try {
    const { status, body } = await request(`${GATEWAY}/auth/register`, {
      method: 'POST',
      body: JSON.stringify({ name: 'Test Patient', email: 'patient@test.com', password: '123456', role: 'patient' }),
    });
    if (status === 201 && body?.token) {
      pass(1, 'Register patient');
    } else if (status === 409) {
      pass(1, 'Register patient (already exists — re-run safe)');
    } else {
      fail(1, 'Register patient', `Expected status 201 with token, got ${status}: ${JSON.stringify(body)}`);
    }
  } catch (err) { fail(1, 'Register patient', `Request failed: ${err.message}`); }

  // Test 2: Register doctor
  await delay(500);
  try {
    const { status, body } = await request(`${GATEWAY}/auth/register`, {
      method: 'POST',
      body: JSON.stringify({ name: 'Dr. Silva', email: 'doctor@test.com', password: '123456', role: 'doctor' }),
    });
    if (status === 201 && body?.token) {
      pass(2, 'Register doctor');
    } else if (status === 409) {
      pass(2, 'Register doctor (already exists — re-run safe)');
    } else {
      fail(2, 'Register doctor', `Expected status 201 with token, got ${status}: ${JSON.stringify(body)}`);
    }
  } catch (err) { fail(2, 'Register doctor', `Request failed: ${err.message}`); }

  // Test 3: Login patient
  await delay(500);
  try {
    const { status, body } = await request(`${GATEWAY}/auth/login`, {
      method: 'POST',
      body: JSON.stringify({ email: 'patient@test.com', password: '123456' }),
    });
    if (status === 200 && body?.token) {
      savedToken = body.token;
      pass(3, 'Login patient');
    } else {
      fail(3, 'Login patient', `Expected status 200 with token, got ${status}: ${JSON.stringify(body)}`);
    }
  } catch (err) { fail(3, 'Login patient', `Request failed: ${err.message}`); }

  // Test 4: Validate token (with valid token)
  await delay(500);
  try {
    if (!savedToken) {
      fail(4, 'Validate token (with token)', 'Skipped — no token available from Test 3');
    } else {
      const { status, body } = await request(`${GATEWAY}/auth/validate`, {
        method: 'GET',
        headers: { Authorization: `Bearer ${savedToken}` },
      });
      if (status === 200 && body?.id && body?.role) {
        pass(4, 'Validate token (with token)');
      } else {
        fail(4, 'Validate token (with token)', `Expected status 200 with id and role, got ${status}: ${JSON.stringify(body)}`);
      }
    }
  } catch (err) { fail(4, 'Validate token (with token)', `Request failed: ${err.message}`); }

  // Test 5: Validate token (no token — expect 401)
  await delay(500);
  try {
    const { status } = await request(`${GATEWAY}/auth/validate`, { method: 'GET' });
    if (status === 401) {
      pass(5, 'Validate token (no token → 401)');
    } else {
      fail(5, 'Validate token (no token → 401)', `Expected status 401, got ${status}`);
    }
  } catch (err) { fail(5, 'Validate token (no token → 401)', `Request failed: ${err.message}`); }

  // ── AI SYMPTOM SERVICE (via Gateway, JWT protected) ─────
  console.log('\n--- AI SYMPTOM SERVICE ---');

  // Test 6: Check symptoms WITHOUT token (expect 401)
  await delay(500);
  try {
    const { status } = await request(`${GATEWAY}/ai/check-symptoms`, {
      method: 'POST',
      body: JSON.stringify({ symptoms: 'chest pain' }),
    });
    if (status === 401) {
      pass(6, 'Check symptoms without token → 401');
    } else {
      fail(6, 'Check symptoms without token → 401', `Expected 401, got ${status}`);
    }
  } catch (err) { fail(6, 'Check symptoms without token', `Request failed: ${err.message}`); }

  // Test 7: Chest pain symptoms WITH token
  await delay(500);
  try {
    const { status, body } = await request(`${GATEWAY}/ai/check-symptoms`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${savedToken}` },
      body: JSON.stringify({ symptoms: 'chest pain, shortness of breath, dizziness' }),
    });
    if (status === 200 && body?.suggested_specialty && body?.urgency && body?.advice) {
      pass(7, 'Check symptoms with token (chest pain)');
      console.log(`   → specialty: ${body.suggested_specialty}, urgency: ${body.urgency}`);
    } else {
      fail(7, 'Check symptoms with token (chest pain)', `Expected status 200 with suggested_specialty/urgency/advice, got ${status}: ${JSON.stringify(body)}`);
    }
  } catch (err) { fail(7, 'Check symptoms with token (chest pain)', `Request failed: ${err.message}`); }

  // Test 8: Headache/fever symptoms WITH token
  await delay(500);
  try {
    const { status, body } = await request(`${GATEWAY}/ai/check-symptoms`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${savedToken}` },
      body: JSON.stringify({ symptoms: 'headache, fever, sore throat' }),
    });
    if (status === 200 && typeof body === 'object' && body !== null) {
      pass(8, 'Check symptoms with token (headache/fever)');
      console.log(`   → specialty: ${body.suggested_specialty}, urgency: ${body.urgency}`);
    } else {
      fail(8, 'Check symptoms with token (headache/fever)', `Expected status 200 with valid JSON, got ${status}: ${JSON.stringify(body)}`);
    }
  } catch (err) { fail(8, 'Check symptoms with token (headache/fever)', `Request failed: ${err.message}`); }

  // Test 9: Empty body WITH token — expect 400
  await delay(500);
  try {
    const { status } = await request(`${GATEWAY}/ai/check-symptoms`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${savedToken}` },
      body: JSON.stringify({}),
    });
    if (status === 400) {
      pass(9, 'Check symptoms (empty body → 400)');
    } else {
      fail(9, 'Check symptoms (empty body → 400)', `Expected status 400, got ${status}`);
    }
  } catch (err) { fail(9, 'Check symptoms (empty body → 400)', `Request failed: ${err.message}`); }

  // ── SUMMARY ──────────────────────────────────────────────
  const total = passed + failed;
  console.log('\n' + '='.repeat(55));
  console.log(`  Summary: ${passed}/${total} tests passed`);
  if (failed === 0) console.log('  All tests passed! Gateway + Auth + AI working.');
  console.log('='.repeat(55));

  process.exit(failed > 0 ? 1 : 0);
}

runTests().catch((err) => {
  console.error('Unexpected error:', err);
  process.exit(1);
});
