const HealthReport = require('../models/HealthReport');
const User = require('../models/User');
const fs = require('fs').promises;
const path = require('path');
const pdf = require('pdf-parse');
const Tesseract = require('tesseract.js');
const axios = require('axios');

// @desc    Upload and process health report
// @route   POST /api/health-reports/upload
// @access  Private
const uploadHealthReport = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    const userId = req.user.id;
    const familyId = req.user.familyId;
    const filePath = req.file.path;
    const fileName = req.file.originalname;
    const fileType = req.file.mimetype.includes('pdf') ? 'pdf' : 'image';

    console.log(`Processing ${fileType} file: ${fileName}`);

    // Extract text from file
    let extractedText = '';
    
    if (fileType === 'pdf') {
      // Extract text from PDF
      const dataBuffer = await fs.readFile(filePath);
      const pdfData = await pdf(dataBuffer);
      extractedText = pdfData.text;
    } else {
      // Extract text from image using OCR
      const { data: { text } } = await Tesseract.recognize(
        filePath,
        'eng',
        {
          logger: m => console.log(m) // Optional: log progress
        }
      );
      extractedText = text;
    }

    // Clean up extracted text
    extractedText = extractedText.replace(/\s+/g, ' ').trim();

    if (!extractedText || extractedText.length < 10) {
      return res.status(400).json({ 
        message: 'Could not extract enough text from the file. Please ensure the file is clear and contains text.' 
      });
    }

    console.log('Text extracted successfully, length:', extractedText.length);

    // Send to Gemini for analysis
    const geminiResponse = await analyzeWithGemini(extractedText, fileName);

    // Create file URL (you might want to upload to cloud storage in production)
    const fileUrl = `/uploads/${path.basename(filePath)}`;

    // Save to database
    const healthReport = await HealthReport.create({
      userId,
      familyId,
      fileName,
      fileType,
      fileUrl,
      originalText: extractedText.substring(0, 5000), // Store first 5000 chars
      simplifiedExplanation: geminiResponse.explanation,
      abnormalMarkers: geminiResponse.abnormalMarkers || [],
      testType: detectTestType(extractedText, fileName)
    });

    res.status(201).json({
      success: true,
      report: {
        id: healthReport._id,
        fileName: healthReport.fileName,
        simplifiedExplanation: healthReport.simplifiedExplanation,
        abnormalMarkers: healthReport.abnormalMarkers,
        reportDate: healthReport.reportDate
      }
    });

  } catch (error) {
    console.error('Error processing health report:', error);
    res.status(500).json({ 
      message: 'Failed to process health report',
      error: error.message 
    });
  }
};

// @desc    Get user's health reports
// @route   GET /api/health-reports
// @access  Private
const getHealthReports = async (req, res) => {
  try {
    const userId = req.user.id;
    const { limit = 20, archived } = req.query;

    const query = { userId };
    if (archived === 'true') {
      query.isArchived = true;
    } else {
      query.isArchived = false;
    }

    const reports = await HealthReport.find(query)
      .sort({ reportDate: -1 })
      .limit(parseInt(limit));

    res.json({
      success: true,
      reports
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get single health report
// @route   GET /api/health-reports/:id
// @access  Private
const getHealthReportById = async (req, res) => {
  try {
    const report = await HealthReport.findById(req.params.id);

    if (!report) {
      return res.status(404).json({ message: 'Report not found' });
    }

    // Check if user owns this report
    if (report.userId.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    res.json({
      success: true,
      report
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Archive/unarchive report
// @route   PUT /api/health-reports/:id/archive
// @access  Private
const toggleArchive = async (req, res) => {
  try {
    const report = await HealthReport.findById(req.params.id);

    if (!report) {
      return res.status(404).json({ message: 'Report not found' });
    }

    if (report.userId.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    report.isArchived = !report.isArchived;
    await report.save();

    res.json({
      success: true,
      isArchived: report.isArchived
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Delete report
// @route   DELETE /api/health-reports/:id
// @access  Private
const deleteReport = async (req, res) => {
  try {
    const report = await HealthReport.findById(req.params.id);

    if (!report) {
      return res.status(404).json({ message: 'Report not found' });
    }

    if (report.userId.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    // Delete file from filesystem
    try {
      const filePath = path.join(__dirname, '..', report.fileUrl);
      await fs.unlink(filePath);
    } catch (err) {
      console.warn('Could not delete file:', err);
    }

    await report.deleteOne();

    res.json({
      success: true,
      message: 'Report deleted successfully'
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Helper function to analyze with Gemini
async function analyzeWithGemini(text, fileName) {
  try {
    const prompt = `You are a medical report analyzer. Analyze this medical report and provide:
1. A simple, easy-to-understand explanation of what the report means (max 200 words)
2. A list of abnormal markers found in the report. For each abnormal marker, provide:
   - The marker name
   - Its value
   - The normal range
   - A simple interpretation of what this abnormal value means

Format your response as JSON with the following structure:
{
  "explanation": "simple explanation here",
  "abnormalMarkers": [
    {
      "marker": "Hemoglobin",
      "value": "12.5",
      "normalRange": "13.5-17.5",
      "interpretation": "Slightly low hemoglobin indicates mild anemia"
    }
  ]
}

If no abnormal markers are found, return an empty array for abnormalMarkers.

Report file name: ${fileName}
Report text: ${text.substring(0, 3000)}`; // Limit text to 3000 chars

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

    const analysisText = response.data.candidates[0]?.content?.parts[0]?.text;
    
    if (!analysisText) {
      throw new Error('No analysis received from Gemini');
    }

    // Extract JSON from response (Gemini might wrap in markdown)
    const jsonMatch = analysisText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('Could not parse Gemini response');
    }

    const analysis = JSON.parse(jsonMatch[0]);
    
    return {
      explanation: analysis.explanation || 'Could not generate explanation',
      abnormalMarkers: analysis.abnormalMarkers || []
    };

  } catch (error) {
    console.error('Gemini analysis error:', error);
    
    // Fallback response
    return {
      explanation: 'We could not analyze this report automatically. Please consult with your healthcare provider for interpretation.',
      abnormalMarkers: []
    };
  }
}

// Helper to detect test type
function detectTestType(text, fileName) {
  const lowerText = text.toLowerCase();
  const lowerFileName = fileName.toLowerCase();

  if (lowerText.includes('blood') || lowerText.includes('hemoglobin') || lowerText.includes('wbc') || 
      lowerText.includes('rbc') || lowerText.includes('platelet') || lowerFileName.includes('blood')) {
    return 'blood';
  } else if (lowerText.includes('urine') || lowerText.includes('urinalysis') || lowerFileName.includes('urine')) {
    return 'urine';
  } else if (lowerText.includes('x-ray') || lowerText.includes('mri') || lowerText.includes('ct scan') || 
             lowerText.includes('ultrasound') || lowerFileName.includes('xray') || lowerFileName.includes('mri')) {
    return 'imaging';
  } else if (lowerText.includes('biopsy') || lowerText.includes('pathology') || lowerFileName.includes('pathology')) {
    return 'pathology';
  } else {
    return 'other';
  }
}

module.exports = {
  uploadHealthReport,
  getHealthReports,
  getHealthReportById,
  toggleArchive,
  deleteReport
};