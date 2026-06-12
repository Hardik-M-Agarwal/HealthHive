from flask import Flask, request, jsonify
from flask_cors import CORS
import joblib
import numpy as np
import json
import os
from pdf_generator import generate_weekly_report_pdf
from datetime import datetime

app = Flask(__name__)
CORS(app)

# ─── Load all models on startup ──────────────────────────────────────────────
BASE = os.path.dirname(os.path.abspath(__file__))

print("Loading models...")

diabetes_model  = joblib.load(os.path.join(BASE, 'models/diabetes/diabetes_model.pkl'))
diabetes_scaler = joblib.load(os.path.join(BASE, 'models/diabetes/diabetes_scaler.pkl'))
diabetes_le     = joblib.load(os.path.join(BASE, 'models/diabetes/diabetes_label_encoder.pkl'))

hyp_model       = joblib.load(os.path.join(BASE, 'models/hypertension/hypertension_model.pkl'))
hyp_scaler      = joblib.load(os.path.join(BASE, 'models/hypertension/hypertension_scaler.pkl'))
hyp_le          = joblib.load(os.path.join(BASE, 'models/hypertension/hypertension_label_encoder.pkl'))

hs_model        = joblib.load(os.path.join(BASE, 'models/health_score/health_score_model.pkl'))
hs_scaler       = joblib.load(os.path.join(BASE, 'models/health_score/health_score_scaler.pkl'))

print("✅ All models loaded successfully!")

# ─── Feature lists ────────────────────────────────────────────────────────────
DIABETES_FEATURES = [
    'age', 'bmi', 'avg_glucose', 'sugar_variability',
    'avg_systolic', 'avg_diastolic', 'bp_variability',
    'avg_pulse', 'adherence_rate', 'missed_doses',
    'has_chronic_condition', 'allergies_count',
    'physical_activity_score', 'diet_quality_score',
    'stress_score', 'sleep_score'
]

HYPERTENSION_FEATURES = [
    'age', 'bmi', 'avg_systolic', 'avg_diastolic',
    'bp_variability', 'avg_glucose', 'sugar_variability',
    'avg_pulse', 'adherence_rate', 'missed_doses',
    'has_chronic_condition', 'physical_activity_score',
    'diet_quality_score', 'stress_score', 'sleep_score'
]

HEALTH_SCORE_FEATURES = [
    'age', 'bmi',
    'avg_systolic', 'avg_diastolic', 'bp_variability',
    'avg_glucose', 'sugar_variability',
    'avg_pulse', 'adherence_rate', 'missed_doses',
    'has_chronic_condition', 'allergies_count',
    'physical_activity_score', 'diet_quality_score',
    'stress_score', 'sleep_score'
]

# ─── Helpers ──────────────────────────────────────────────────────────────────
def get_health_grade(score):
    if score >= 85: return 'A'
    if score >= 70: return 'B'
    if score >= 55: return 'C'
    if score >= 40: return 'D'
    return 'F'

def get_contributing_factors(data, diabetes_risk, hyp_risk):
    factors  = []
    positives = []

    # BP
    if data['avg_systolic'] > 140:
        factors.append(f"High systolic BP ({data['avg_systolic']:.0f} mmHg — normal <120)")
    elif data['avg_systolic'] > 130:
        factors.append(f"Elevated systolic BP ({data['avg_systolic']:.0f} mmHg)")
    else:
        positives.append(f"Systolic BP in healthy range ({data['avg_systolic']:.0f} mmHg)")

    if data['avg_diastolic'] > 90:
        factors.append(f"High diastolic BP ({data['avg_diastolic']:.0f} mmHg — normal <80)")
    elif data['avg_diastolic'] <= 80:
        positives.append(f"Diastolic BP normal ({data['avg_diastolic']:.0f} mmHg)")

    # Blood sugar
    if data['avg_glucose'] > 140:
        factors.append(f"High blood sugar ({data['avg_glucose']:.0f} mg/dL — normal 70-100)")
    elif data['avg_glucose'] > 100:
        factors.append(f"Slightly elevated blood sugar ({data['avg_glucose']:.0f} mg/dL)")
    else:
        positives.append(f"Blood sugar in normal range ({data['avg_glucose']:.0f} mg/dL)")

    # BP variability
    if data['bp_variability'] > 15:
        factors.append(f"High BP variability (readings fluctuating ±{data['bp_variability']:.0f} mmHg)")
    elif data['bp_variability'] <= 8:
        positives.append("Stable BP readings throughout the week")

    # Sugar variability
    if data['sugar_variability'] > 25:
        factors.append(f"Unstable blood sugar levels (variability: {data['sugar_variability']:.0f})")

    # Medication adherence
    if data['adherence_rate'] < 0.7:
        factors.append(f"Low medication adherence ({data['adherence_rate']*100:.0f}% — target >80%)")
    elif data['adherence_rate'] < 0.8:
        factors.append(f"Medication adherence below target ({data['adherence_rate']*100:.0f}%)")
    else:
        positives.append(f"Good medication adherence ({data['adherence_rate']*100:.0f}%)")

    # Missed doses
    if data['missed_doses'] > 5:
        factors.append(f"{data['missed_doses']} doses missed this week")

    # BMI
    if data['bmi'] > 30:
        factors.append(f"BMI indicates obesity ({data['bmi']:.1f} — healthy: 18.5-24.9)")
    elif data['bmi'] > 25:
        factors.append(f"BMI indicates overweight ({data['bmi']:.1f})")
    elif 18.5 <= data['bmi'] <= 24.9:
        positives.append(f"Healthy BMI ({data['bmi']:.1f})")

    # Lifestyle
    if data['physical_activity_score'] < 3:
        factors.append("Low physical activity score")
    elif data['physical_activity_score'] >= 7:
        positives.append("Good physical activity level")

    if data['stress_score'] > 7:
        factors.append(f"High stress score ({data['stress_score']:.1f}/10)")

    if data['sleep_score'] < 5:
        factors.append(f"Poor sleep score ({data['sleep_score']:.1f}/10)")
    elif data['sleep_score'] >= 7:
        positives.append(f"Good sleep pattern ({data['sleep_score']:.1f}/10)")

    # Pulse
    if 60 <= data['avg_pulse'] <= 100:
        positives.append(f"Pulse rate normal ({data['avg_pulse']:.0f} bpm)")
    else:
        factors.append(f"Abnormal pulse rate ({data['avg_pulse']:.0f} bpm — normal 60-100)")

    return factors[:6], positives[:4]

# ─── Routes ───────────────────────────────────────────────────────────────────
@app.route('/health', methods=['GET'])
def health():
    return jsonify({"status": "ok", "message": "ML service running"}), 200


@app.route('/predict', methods=['POST'])
def predict():
    try:
        data = request.get_json()
        if not data:
            return jsonify({"error": "No data provided"}), 400

        # Defaults for missing fields
        defaults = {
            'age': 40,
            'bmi': 25.0,
            'avg_systolic': 120.0,
            'avg_diastolic': 80.0,
            'bp_variability': 8.0,
            'avg_glucose': 95.0,
            'sugar_variability': 10.0,
            'avg_pulse': 75.0,
            'adherence_rate': 0.85,
            'missed_doses': 2,
            'has_chronic_condition': 0,
            'allergies_count': 0,
            'physical_activity_score': 5.0,
            'diet_quality_score': 5.0,
            'stress_score': 5.0,
            'sleep_score': 6.0
        }
        for key, val in defaults.items():
            if key not in data or data[key] is None:
                data[key] = val

        # ── Diabetes prediction ──────────────────────────────────────────────
        d_features = np.array([[data[f] for f in DIABETES_FEATURES]])
        d_scaled   = diabetes_scaler.transform(d_features)
        d_pred     = diabetes_model.predict(d_scaled)[0]
        d_proba    = diabetes_model.predict_proba(d_scaled)[0]
        d_risk     = diabetes_le.inverse_transform([d_pred])[0]
        d_score    = float(max(d_proba))

        # ── Hypertension prediction ──────────────────────────────────────────
        h_features = np.array([[data[f] for f in HYPERTENSION_FEATURES]])
        h_scaled   = hyp_scaler.transform(h_features)
        h_pred     = hyp_model.predict(h_scaled)[0]
        h_proba    = hyp_model.predict_proba(h_scaled)[0]
        h_risk     = hyp_le.inverse_transform([h_pred])[0]
        h_score    = float(max(h_proba))

        # ── Health score prediction ──────────────────────────────────────────
        hs_features = np.array([[data[f] for f in HEALTH_SCORE_FEATURES]])
        hs_scaled   = hs_scaler.transform(hs_features)
        health_score = float(hs_model.predict(hs_scaled)[0])
        health_score = round(max(10, min(100, health_score)), 1)
        health_grade = get_health_grade(health_score)

        # ── Contributing factors ─────────────────────────────────────────────
        contributing, positives = get_contributing_factors(data, d_risk, h_risk)

        # ── Cardiovascular risk (derived) ────────────────────────────────────
        cvd_score = (
            (1 if data['avg_systolic'] > 130 else 0) * 0.3 +
            (1 if data['avg_glucose'] > 100 else 0) * 0.2 +
            (1 if data['bmi'] > 25 else 0) * 0.2 +
            (1 if data['adherence_rate'] < 0.8 else 0) * 0.15 +
            (1 if data['stress_score'] > 6 else 0) * 0.15
        )
        cvd_risk = 'high' if cvd_score >= 0.6 else ('medium' if cvd_score >= 0.3 else 'low')

        return jsonify({
            "success": True,
            "member_id":   data.get('member_id', ''),
            "member_name": data.get('member_name', ''),
            "health_score": health_score,
            "health_grade": health_grade,
            "risk_assessment": {
                "diabetes": {
                    "risk_level": d_risk,
                    "confidence": round(d_score, 3),
                    "key_driver": contributing[0] if contributing else "No major risk factors"
                },
                "hypertension": {
                    "risk_level": h_risk,
                    "confidence": round(h_score, 3),
                    "key_driver": contributing[1] if len(contributing) > 1 else "No major risk factors"
                },
                "cardiovascular": {
                    "risk_level": cvd_risk,
                    "confidence": round(cvd_score, 3),
                    "key_driver": "Derived from BP, glucose, BMI and adherence"
                }
            },
            "weekly_stats": {
                "avg_systolic":    data['avg_systolic'],
                "avg_diastolic":   data['avg_diastolic'],
                "avg_glucose":     data['avg_glucose'],
                "avg_pulse":       data['avg_pulse'],
                "avg_weight":      round(data['bmi'] * ((data.get('height', 170) / 100) ** 2), 1),
                "bp_variability":  data['bp_variability'],
                "sugar_variability": data['sugar_variability'],
                "adherence_rate":  data['adherence_rate'],
                "doses_taken":     int(data.get('doses_total', 21) - data['missed_doses']),
                "doses_missed":    int(data['missed_doses']),
                "doses_total":     int(data.get('doses_total', 21))
            },
            "contributing_factors": contributing,
            "positive_factors":     positives
        }), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route('/generate-pdf', methods=['POST'])
def generate_pdf():
    try:
        data = request.get_json()
        if not data:
            return jsonify({"error": "No data provided"}), 400

        if 'generated_at' not in data:
            data['generated_at'] = datetime.now().strftime("%b %d, %Y %I:%M %p")

        pdf_b64 = generate_weekly_report_pdf(data)

        week_start = data.get('week_start', '').replace(' ', '_').replace(',', '')
        return jsonify({
            "success":    True,
            "pdf_base64": pdf_b64,
            "filename":   f"health_report_{week_start}.pdf"
        }), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500


if __name__ == '__main__':
    print("🚀 Starting ML service on port 5002...")
    app.run(host='0.0.0.0', port=5002, debug=False)