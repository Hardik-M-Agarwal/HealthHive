const geminiService = require('../services/geminiService');

// @desc    Explain medicine using Gemini API with fallbacks
// @route   POST /api/gemini/explain
// @access  Private
const explainMedicine = async (req, res) => {
  try {
    const { medicineName } = req.body;

    if (!medicineName) {
      return res.status(400).json({ 
        success: false, 
        message: 'Medicine name is required' 
      });
    }

    console.log(`📝 Explaining medicine: ${medicineName}`);

    const result = await geminiService.explainMedicine(medicineName);

    res.json(result);

  } catch (error) {
    console.error('❌ Gemini controller error:', error);
    
    res.status(500).json({ 
      success: false, 
      message: 'Failed to get medicine explanation',
      fallback: geminiService.getFallbackResponse(req.body.medicineName).explanation
    });
  }
};

// @desc    Explain multiple medicines
// @route   POST /api/gemini/explain-many
// @access  Private
const explainMedicines = async (req, res) => {
  try {
    const { medicineNames } = req.body;

    if (!medicineNames || !Array.isArray(medicineNames)) {
      return res.status(400).json({ 
        success: false, 
        message: 'Medicine names array is required' 
      });
    }

    const results = await geminiService.explainMedicines(medicineNames);
    res.json(results);

  } catch (error) {
    console.error('❌ Batch explain error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to process batch explanation' 
    });
  }
};

module.exports = {
  explainMedicine,
  explainMedicines
};