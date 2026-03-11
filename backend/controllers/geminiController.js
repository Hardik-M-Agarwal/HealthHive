const axios = require('axios');

// @desc    Explain medicine using Gemini API
// @route   POST /api/gemini/explain
// @access  Private
const explainMedicine = async (req, res) => {
  try {
    const { medicineName } = req.body;

    if (!medicineName) {
      return res.status(400).json({ message: 'Medicine name is required' });
    }

    console.log(`Explaining medicine: ${medicineName}`);

    // Construct the prompt
    const prompt = `Explain ${medicineName} in simple language in 2 lines. Keep it very simple and easy to understand.`;

    // Using gemini-2.0-flash from your available models list
    const response = await axios.post(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        contents: [
          {
            parts: [
              {
                text: prompt
              }
            ]
          }
        ]
      },
      {
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );

    // Extract the explanation from Gemini response
    const explanation = response.data.candidates[0]?.content?.parts[0]?.text;

    if (!explanation) {
      return res.status(500).json({ message: 'No explanation received from Gemini' });
    }

    res.json({
      success: true,
      medicineName,
      explanation
    });

  } catch (error) {
    console.error('Gemini API error:', error.response?.data || error.message);
    
    const errorMessage = error.response?.data?.error?.message || error.message;
    res.status(500).json({ 
      success: false, 
      message: `Gemini API error: ${errorMessage}` 
    });
  }
};

module.exports = {
  explainMedicine
};