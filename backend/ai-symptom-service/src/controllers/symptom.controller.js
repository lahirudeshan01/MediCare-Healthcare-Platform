const { GoogleGenerativeAI } = require('@google/generative-ai');

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const checkSymptoms = async (req, res) => {
  try {
    const { symptoms } = req.body;

    if (!symptoms || typeof symptoms !== 'string' || !symptoms.trim()) {
      return res.status(400).json({ message: 'Please provide symptoms as a non-empty string.' });
    }

    const model = genAI.getGenerativeModel({
      model: 'gemini-2.5-flash',
    });

    const prompt = `You are an experienced medical triage assistant. A patient reports: "${symptoms}".

IMPORTANT RULES:
- You MUST respond with ONLY a valid JSON object, no markdown, no code fences, no extra text.
- You MUST NOT ask any follow-up questions.
- You MUST NOT request more information.
- You MUST give a thorough, detailed assessment based solely on the symptoms provided.

Return this exact JSON structure:
{
  "suggested_specialty": "<most relevant medical specialty>",
  "urgency": "<low, medium, or high>",
  "overview": "<2-3 sentences explaining what these symptoms may indicate and why>",
  "possible_conditions": ["<condition 1>", "<condition 2>", "<condition 3>"],
  "recommendations": ["<specific actionable step 1>", "<specific actionable step 2>", "<specific actionable step 3>", "<specific actionable step 4>"],
  "warning_signs": "<describe specific symptoms that would require immediate emergency care>",
  "advice": "<one clear summary sentence of the most important thing the patient should do now>"
}`;

    const result = await model.generateContent(prompt);
    const content = result.response.text();
    const cleanContent = content.replace(/```json\s*/g, '').replace(/```\s*/g, '').trim();
    const parsed = JSON.parse(cleanContent);

    // Validate required fields
    if (!parsed.suggested_specialty || !parsed.urgency || !parsed.advice) {
      return res.status(502).json({ message: 'AI returned an incomplete response. Please try again.' });
    }
    const validUrgency = ['low', 'medium', 'high'];
    if (!validUrgency.includes(parsed.urgency)) {
      parsed.urgency = 'medium';
    }
    // Ensure arrays exist
    if (!Array.isArray(parsed.possible_conditions)) parsed.possible_conditions = [];
    if (!Array.isArray(parsed.recommendations)) parsed.recommendations = [];

    res.json(parsed);
  } catch (err) {
    if (err instanceof SyntaxError) {
      return res.status(502).json({ message: 'Failed to parse AI response.' });
    }
    if (err.message && err.message.includes('503')) {
      return res.status(503).json({ message: 'The AI model is temporarily busy. Please try again in a few seconds.' });
    }
    if (err.message && (err.message.includes('429') || err.message.includes('quota'))) {
      return res.status(429).json({ message: 'AI service quota exceeded. Please try again later.' });
    }
    res.status(500).json({ message: 'AI service error.', error: err.message });
  }
};

module.exports = { checkSymptoms };
