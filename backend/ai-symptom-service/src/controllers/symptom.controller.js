const { GoogleGenerativeAI } = require('@google/generative-ai');

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const checkSymptoms = async (req, res) => {
  try {
    const { symptoms } = req.body;

    if (!symptoms || typeof symptoms !== 'string' || !symptoms.trim()) {
      return res.status(400).json({ message: 'Please provide symptoms as a non-empty string.' });
    }

    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

    const prompt = `You are a helpful medical assistant. Given a list of symptoms from a patient, respond ONLY with a JSON object in this exact format: { "suggested_specialty": "<specialty>", "urgency": "low|medium|high", "advice": "<one sentence preliminary advice>" }. Do not add any explanation outside the JSON.\n\nMy symptoms are: ${symptoms}`;

    const result = await model.generateContent(prompt);
    const response = result.response;
    const content = response.text();

    // Strip markdown code fences if present
    const jsonStr = content.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    const parsed = JSON.parse(jsonStr);

    res.json(parsed);
  } catch (err) {
    if (err instanceof SyntaxError) {
      return res.status(502).json({ message: 'Failed to parse AI response.' });
    }
    res.status(500).json({ message: 'AI service error.', error: err.message });
  }
};

module.exports = { checkSymptoms };
