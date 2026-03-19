const { GoogleGenerativeAI } = require('@google/generative-ai');

class GeminiService {
  constructor() {
    this.genAI = process.env.GEMINI_API_KEY 
      ? new GoogleGenerativeAI(process.env.GEMINI_API_KEY)
      : null;
    
    // ✅ CURRENT GEMINI MODELS
    this.models = [
      "gemini-2.5-flash",
      "gemini-2.5-flash-lite",
      "gemini-2.5-pro",
      "gemini-2.0-flash",
      "gemini-2.0-flash-lite",
    ];

    // Cache
    this.cache = new Map();
    this.cacheTTL = 7 * 24 * 60 * 60 * 1000;
  }

  /**
   * Generate content with multiple model fallbacks
   */
  async generateContent(prompt, options = {}) {
    const {
      temperature = 0.7,
      maxOutputTokens = 2048, // Increased to maximum
    } = options;

    // Try each model
    for (const modelName of this.models) {
      try {
        console.log(`🔄 Trying ${modelName}...`);
        
        const model = this.genAI.getGenerativeModel({ 
          model: modelName,
          generationConfig: {
            temperature,
            maxOutputTokens,
          }
        });
        
        // Add a timeout but keep it generous
        const timeoutPromise = new Promise((_, reject) => {
          setTimeout(() => reject(new Error('Timeout')), 30000); // 30 seconds
        });

        const resultPromise = model.generateContent(prompt);
        const result = await Promise.race([resultPromise, timeoutPromise]);
        
        const response = await result.response;
        const text = response.text();
        
        if (text && text.length > 20) {
          console.log(`✅ Success with ${modelName} (${text.length} chars)`);
          
          // Log if response seems truncated
          if (text.length < 100) {
            console.log(`⚠️ Short response (${text.length} chars) - might be incomplete`);
          }
          
          return {
            success: true,
            text: text.trim(),
            model: modelName,
            length: text.length
          };
        }
      } catch (error) {
        console.log(`❌ ${modelName} failed: ${error.message.substring(0, 100)}`);
        continue;
      }
    }

    return {
      success: false,
      text: null,
      model: null
    };
  }

  /**
   * Analyze vitals trend - SIMPLIFIED BUT DETAILED
   */
  async analyzeVitalsTrend(vitalsType, vitalsData, days) {
    const readings = vitalsData.split('\n').filter(r => r.trim());
    const readingCount = readings.length;
    
    const vitalsTypeDisplay = {
      'bp': 'Blood Pressure',
      'sugar': 'Blood Sugar',
      'weight': 'Weight',
      'pulse': 'Pulse Rate',
      'temperature': 'Temperature'
    }[vitalsType] || vitalsType;

    // Create a direct, clear prompt that asks for a complete response
    let prompt = '';
    
    if (vitalsType === 'bp') {
      prompt = `You are a helpful health assistant. A patient has shared their blood pressure readings. 

READINGS (${readingCount} total):
${vitalsData}

Please provide a complete, detailed analysis with these sections:

1. READING SUMMARY: What do the numbers show?
2. WHAT THEY MEAN: Explain systolic/diastolic and what these specific numbers indicate
3. PATTERNS: Any trends or changes noticed
4. ADVICE: Practical tips based on these readings
5. ENCOURAGEMENT: A motivating closing message

Write at least 8-10 sentences. Be warm and supportive.`;
    } else {
      prompt = `You are a helpful health assistant. A patient has shared their ${vitalsTypeDisplay} readings.

READINGS (${readingCount} total):
${vitalsData}

Please provide a complete, detailed analysis with:
1. Summary of readings
2. What they mean for their health
3. Any patterns noticed
4. Practical advice
5. Encouraging message

Write at least 8-10 sentences. Be warm and supportive.`;
    }
    
    const result = await this.generateContent(prompt, {
      temperature: 0.8,
      maxOutputTokens: 2048
    });

    if (result.success && result.text) {
      return {
        success: true,
        analysis: result.text,
        model: result.model,
        readingCount,
        length: result.length
      };
    }

    // Enhanced fallback
    return {
      success: true,
      analysis: this.getDetailedFallback(vitalsTypeDisplay, readings, readingCount),
      model: 'fallback',
      readingCount
    };
  }

  /**
   * Detailed fallback analysis
   */
  getDetailedFallback(vitalsType, readings, readingCount) {
    let analysis = '';
    
    if (vitalsType === 'Blood Pressure') {
      // Parse BP readings
      const bpValues = [];
      readings.forEach(r => {
        const match = r.match(/(\d+)\/(\d+)/);
        if (match) {
          bpValues.push({
            sys: parseInt(match[1]),
            dia: parseInt(match[2]),
            full: r
          });
        }
      });
      
      if (bpValues.length === 1) {
        const bp = bpValues[0];
        analysis = `📊 **Your Blood Pressure Analysis**

Based on your single reading of ${bp.full}, here's what this means for your health:

**What the numbers tell us:**
• Systolic (top number) ${bp.sys}: The pressure in your arteries when your heart beats
• Diastolic (bottom number) ${bp.dia}: The pressure in your arteries between heartbeats

**Category:**
`;

        if (bp.sys < 120 && bp.dia < 80) {
          analysis += `✅ **Normal Range** - This is excellent! Blood pressure below 120/80 is considered optimal.
          
**Why this is good:** Your heart is working efficiently without excessive strain on your arteries.

**Recommendations:**
• Maintain your healthy habits
• Continue monitoring weekly
• Keep up with regular exercise and a balanced diet`;
        } else if (bp.sys < 130 && bp.dia < 80) {
          analysis += `⚠️ **Elevated** - Your systolic is slightly above ideal.
          
**What this means:** While not yet hypertension, this is a signal to pay attention.

**Recommendations:**
• Monitor more frequently (2-3 times per week)
• Reduce sodium intake
• Add more physical activity
• Practice stress management`;
        } else if (bp.sys < 140 || bp.dia < 90) {
          analysis += `🔸 **Stage 1 Hypertension** - Your reading indicates early high blood pressure.
          
**What this means:** Your heart is working harder than ideal to pump blood.

**Recommendations:**
• Consult with your healthcare provider
• Take readings at the same time daily
• Consider lifestyle changes (diet, exercise, stress)
• Limit alcohol and caffeine`;
        } else {
          analysis += `🔴 **Stage 2 Hypertension** - This reading is in the high range.
          
**What this means:** This level of blood pressure puts extra strain on your heart and blood vessels.

**Recommendations:**
• Schedule an appointment with your doctor soon
• Take daily readings at consistent times
• Follow a heart-healthy diet (DASH diet recommended)
• Avoid smoking and limit sodium severely`;
        }
        
      } else if (bpValues.length >= 2) {
        // Calculate stats
        const avgSys = Math.round(bpValues.reduce((sum, bp) => sum + bp.sys, 0) / bpValues.length);
        const avgDia = Math.round(bpValues.reduce((sum, bp) => sum + bp.dia, 0) / bpValues.length);
        
        const first = bpValues[0];
        const last = bpValues[bpValues.length - 1];
        const sysChange = last.sys - first.sys;
        const diaChange = last.dia - first.dia;
        
        analysis = `📊 **Your Blood Pressure Analysis**

You have ${bpValues.length} readings with an average of ${avgSys}/${avgDia}.

**Your readings:**
${bpValues.map((bp, i) => `• Reading ${i+1}: ${bp.full}`).join('\n')}

**Trend Analysis:**
`;
        if (Math.abs(sysChange) < 3 && Math.abs(diaChange) < 3) {
          analysis += `Your readings are **stable** with minimal variation. This consistency is good for tracking patterns.\n\n`;
        } else if (sysChange > 0 || diaChange > 0) {
          analysis += `There's a slight **upward trend** in your readings. This is worth monitoring closely.\n\n`;
        } else {
          analysis += `There's a slight **downward trend** in your readings, which is positive if you're working on lowering your BP.\n\n`;
        }
        
        analysis += `**Category based on average:**\n`;
        
        if (avgSys < 120 && avgDia < 80) {
          analysis += `✅ **Normal Range** - Your average is in the optimal range.\n\n`;
        } else if (avgSys < 130 && avgDia < 80) {
          analysis += `⚠️ **Elevated** - Your average systolic is slightly elevated.\n\n`;
        } else if (avgSys < 140 || avgDia < 90) {
          analysis += `🔸 **Stage 1 Hypertension** - Your average indicates early hypertension.\n\n`;
        } else {
          analysis += `🔴 **Stage 2 Hypertension** - Your average is in the high range.\n\n`;
        }
        
        analysis += `**Recommendations:**

• Take readings at the same time each day (morning and evening)
• Wait 5 minutes sitting quietly before measuring
• Keep a log with notes about diet, stress, and activity
• Share this data with your healthcare provider
• Aim for 7+ readings to see clearer patterns`;
      }
      
    } else {
      // Generic vitals fallback
      analysis = `📊 **Your ${vitalsType} Analysis**

You have ${readingCount} reading${readingCount !== 1 ? 's' : ''} recorded.

**Your data:**
${readings.map(r => `• ${r}`).join('\n')}

**What this means:**

Tracking your ${vitalsType.toLowerCase()} is an excellent way to understand your health patterns. `;

      if (readingCount === 1) {
        analysis += `With one reading, you've taken the first step. Continue monitoring to establish a baseline and see how your levels change over time.`;
      } else if (readingCount === 2) {
        analysis += `With two readings, you can start to compare values. Look for consistency or changes between measurements taken at similar times.`;
      } else {
        analysis += `With ${readingCount} readings, you're building a valuable health record. Look for patterns - do certain times of day or activities affect your readings?`;
      }
      
      analysis += `

**Tips for better tracking:**
• Take measurements at the same time each day
• Record notes about meals, exercise, and stress
• Use the same device for consistency
• Share trends with your healthcare provider`;
    }
    
    analysis += `\n\n🌟 **Keep up the excellent work!** Every reading is a step toward better health awareness.`;
    
    return analysis;
  }

  /**
   * Explain a medicine
   */
  async explainMedicine(medicineName) {
    const cached = this.getFromCache(medicineName);
    if (cached) {
      return {
        success: true,
        medicineName,
        explanation: cached,
        model: 'cache',
        cached: true
      };
    }

    const prompt = `Explain ${medicineName} medication in detail for a patient. Include:
- What it's used for
- How it works (simple terms)
- Common side effects
- Important precautions
- When to call a doctor

Write 6-8 sentences in a clear, helpful tone.`;
    
    const result = await this.generateContent(prompt, {
      temperature: 0.5,
      maxOutputTokens: 800
    });

    if (result.success && result.text) {
      this.addToCache(medicineName, result.text);
      return {
        success: true,
        medicineName,
        explanation: result.text,
        model: result.model,
        cached: false
      };
    }

    return {
      success: true,
      medicineName,
      explanation: `${medicineName} is a medication. For detailed information, please consult your pharmacist or healthcare provider.`,
      model: 'fallback',
      cached: false
    };
  }

  // Cache management
  getFromCache(medicineName) {
    const cached = this.cache.get(medicineName.toLowerCase());
    if (cached && Date.now() - cached.timestamp < this.cacheTTL) {
      return cached.explanation;
    }
    return null;
  }

  addToCache(medicineName, explanation) {
    this.cache.set(medicineName.toLowerCase(), {
      explanation,
      timestamp: Date.now()
    });
  }
}

// Export singleton instance
module.exports = new GeminiService();