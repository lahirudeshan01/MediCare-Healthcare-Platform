const OpenAI = require('openai');

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const checkSymptoms = async (req, res) => {
  try {
    const { symptoms } = req.body;

    if (!symptoms || typeof symptoms !== 'string' || !symptoms.trim()) {
      return res.status(400).json({ message: 'Please provide symptoms as a non-empty string.' });
    }

    const completion = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        {
          role: 'system',
          content:
            'You are a helpful medical assistant. Given a list of symptoms from a patient, respond ONLY with a JSON object in this exact format: { "suggested_specialty": "<specialty>", "urgency": "low|medium|high", "advice": "<one sentence preliminary advice>" }. Do not add any explanation outside the JSON.',
        },
        {
          role: 'user',
          content: `My symptoms are: ${symptoms}`,
        },
      ],
      temperature: 0.3,
    });

    const content = completion.choices[0].message.content;
    const parsed = JSON.parse(content);

    res.json(parsed);
  } catch (err) {
    if (err instanceof SyntaxError) {
      return res.status(502).json({ message: 'Failed to parse AI response.' });
    }
    res.status(500).json({ message: 'AI service error.', error: err.message });
  }
};

module.exports = { checkSymptoms };
