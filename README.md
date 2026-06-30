# 🏥 Health Hive

> A full-stack family health management platform that combines secure multi-user health tracking with automated, ML-driven weekly health intelligence — delivered straight to your inbox, no manual effort required.

---

## 📖 Project Overview

Health Hive is a full-stack web application built to help families manage health collaboratively rather than in isolation. Most healthcare apps are designed around a single patient; Health Hive is designed around the **family unit** — multiple members sharing a household, each with their own vitals, medications, appointments, and medical history, but visible and manageable together under one secure account structure.

**The problem it solves:** Health tracking for families is fragmented. Parents juggle medication schedules for children and elderly relatives, appointment reminders get missed, prescriptions pile up unread, and nobody has a simple way to see "how is my family doing this week" without manually checking multiple records. Health Hive consolidates this into one platform and goes a step further — it uses trained machine learning models to proactively flag health risks based on real vitals and medication adherence data, then automatically compiles and emails a personalized report every week without anyone having to ask for it.

**Why it was built:** As a self-project, Health Hive was built to explore the intersection of full-stack engineering, applied machine learning, and workflow automation — not as three separate exercises, but as a single working system where each part depends on the others. The result is a platform that demonstrates production-style architecture: a REST API backend, a trained ML inference service, an LLM-powered narrative layer, and a no-code automation pipeline that ties them all together on a schedule.

**Target users:** Families who want a shared, organized view of everyone's health — particularly households managing chronic conditions, multiple medications, or elderly/young dependents who can't track their own health independently.

**What makes it different:** Most healthcare apps stop at data entry and display. Health Hive adds a predictive layer (XGBoost models trained on 470K+ health records) and an automation layer (a 16-node n8n pipeline) that together turn raw logged data into a proactive, AI-narrated weekly report — emailed automatically, with zero manual report generation.

---

## ✨ Key Features

### 🔐 Authentication & Security
- JWT-based authentication with secure password hashing (bcrypt)
- Role-based access control (admin / member) scoped to family units
- Family-based data isolation — users only access their own family's data
- Internal service-to-service authentication via scoped API keys, separate from user-facing JWT auth

### 👨‍👩‍👧‍👦 Family & Profile Management
- Create or join a family using a unique family code
- Individual health profiles per member: blood group, height, weight, allergies, chronic conditions, past diseases, emergency contacts
- Auto-calculated derived fields (age from date of birth, BMI from height/weight)

### 💊 Medication Management
- Smart Medication Manager with scheduling and dose logging
- Automated medication reminders via WhatsApp/SMS (Twilio)
- Adherence tracking — doses taken vs. missed, calculated adherence rate
- AI-powered medicine explanations (what it's for, side effects, precautions) via Gemini

### 📅 Appointments & Emergency
- Appointment scheduling with automated reminder notifications
- Emergency Alert System with secure, token-based access for real-time location sharing with family members

### 📁 Medical Document Management
- Upload and store medical documents and images (Cloudinary for images, server storage for PDFs)
- OCR-based text extraction from uploaded documents (Tesseract.js)
- AI-assisted document interpretation via Gemini
- Categorized retrieval and secure, authenticated document access

### 📊 Vitals & Health Tracking
- Log vitals: blood pressure, blood sugar, weight, pulse, temperature
- Per-member and family-wide vitals views with trend charts
- AI-generated trend analysis and explanations for logged vitals

### 🤖 AI-Powered Weekly Health Reports (Core Differentiator)
- **3 independently trained XGBoost models** predicting diabetes risk, hypertension risk, and a continuous 0–100 health score from real vitals and medication adherence data
- **Gemini-powered narrative summaries** that translate ML risk scores into warm, non-alarming, human-readable weekly summaries
- **Fully automated n8n pipeline** (16 nodes) that runs every Sunday: fetches every family's data, runs ML inference per member, generates AI summaries, compiles a multi-section PDF report, and emails it to every family member — with no manual trigger required

### 📈 Dashboard & Analytics
- Consolidated family dashboard combining vitals, medication adherence, and upcoming appointments
- Per-member health summaries

---

## 🚀 Unique Selling Points (USPs)

**End-to-end ML pipeline, not a bolt-on feature.** Most student/portfolio projects that mention "AI" wrap a single LLM call around static UI text. Health Hive trains and deploys three independent XGBoost models from raw, multi-source datasets (Kaggle clinical data + synthetic, behaviorally-derived data) as a standalone Flask microservice — a genuinely separate inference service, not an inline function call.

**Decoupled, scoped service authentication.** Rather than reusing user JWTs for backend automation, Health Hive implements a separate internal API-key layer (`x-internal-key` header) specifically for service-to-service calls from the automation pipeline. This keeps system-level access cleanly isolated from end-user session security — a deliberate architectural decision, not an oversight.

**Real workflow orchestration, not a cron job.** The weekly report system isn't a single scheduled script — it's a 16-node n8n workflow that loops over families, loops over members within each family, fans out parallel HTTP calls to three different services (backend API, ML microservice, Gemini), reassembles per-member results back into a single family-level report, and only then triggers PDF generation and email delivery. This mirrors real-world workflow automation patterns used in production data pipelines.

**Behaviorally-informed ML features, not just clinical vitals.** The ML models don't just use textbook features like glucose and blood pressure — they incorporate portal-specific behavioral signals (medication adherence rate, missed doses, BP/glucose variability) and derive proxy lifestyle scores (estimated physical activity, stress, sleep quality) from actual logged user behavior rather than static defaults, making predictions more reflective of real engagement with the platform.

**Multi-service production deployment.** The platform isn't a single deployable unit — it's three independently deployed services (React frontend on Vercel, Node.js API on Render, Flask ML microservice on Render) communicating over properly configured CORS, with environment-based origin allowlisting rather than wildcard access.

---

## 🛠️ Tech Stack

### Frontend
| Technology | Purpose |
|---|---|
| React.js | Core UI framework |
| Vite | Build tool and dev server |
| Tailwind CSS | Utility-first styling |
| Axios | HTTP client with interceptors for auth |
| React Context API | Global auth/user state management |
| React Hot Toast | Notification UI |

### Backend
| Technology | Purpose |
|---|---|
| Node.js | Runtime environment |
| Express.js | REST API framework |
| MongoDB Atlas | Primary database |
| Mongoose | ODM for MongoDB |
| JSON Web Tokens (JWT) | Authentication |
| bcryptjs | Password hashing |
| express-validator | Request validation |
| node-cron | Scheduled reminder jobs |
| Multer + Cloudinary | File/image upload and storage |
| Tesseract.js | OCR text extraction |
| pdf-parse | PDF text extraction |
| Twilio | WhatsApp/SMS notifications |
| Google Generative AI SDK | Gemini integration |

### Machine Learning Service
| Technology | Purpose |
|---|---|
| Python 3.13 | ML service runtime |
| Flask | Lightweight inference API |
| XGBoost | Gradient-boosted models (classification + regression) |
| scikit-learn | Preprocessing, scaling, evaluation |
| pandas / NumPy | Data processing |
| joblib | Model serialization |
| ReportLab | Programmatic PDF report generation |

### Automation
| Technology | Purpose |
|---|---|
| n8n (self-hosted) | Workflow orchestration for the weekly report pipeline |
| Gmail API (OAuth2) | Automated email delivery |

### Deployment
| Service | Platform |
|---|---|
| Frontend | Vercel |
| Backend API | Render |
| ML Microservice | Render |
| Automation | Self-hosted n8n |
| Database | MongoDB Atlas |

---

## 🏗️ System Architecture

### High-Level Architecture

```mermaid
flowchart TB
    subgraph Client
        FE[React Frontend - Vercel]
    end

    subgraph Backend
        API[Node.js / Express API - Render]
        DB[(MongoDB Atlas)]
    end

    subgraph MLService [ML Microservice]
        Flask[Flask API - Render]
        Models[(XGBoost Models)]
        PDF[ReportLab PDF Generator]
    end

    subgraph Automation
        N8N[n8n Workflow Engine]
        Gemini[Gemini AI]
        Gmail[Gmail API]
    end

    FE -- JWT Auth + REST --> API
    API <--> DB
    API -- Internal API Key --> N8N

    N8N -- Fetch family/vitals/meds data --> API
    N8N -- POST /predict --> Flask
    Flask --> Models
    N8N -- Health summary prompt --> API
    API -- Gemini call --> Gemini
    N8N -- POST /generate-pdf --> Flask
    Flask --> PDF
    N8N -- Send email + PDF --> Gmail

    style FE fill:#3b82f6,color:#fff
    style API fill:#1e293b,color:#fff
    style Flask fill:#16a34a,color:#fff
    style N8N fill:#7c3aed,color:#fff
```

### Weekly Automated Report — Sequence Flow

```mermaid
sequenceDiagram
    participant Cron as n8n Schedule Trigger
    participant N8N as n8n Workflow
    participant API as Backend API
    participant ML as Flask ML Service
    participant Gemini as Gemini API
    participant Gmail as Gmail

    Cron->>N8N: Trigger every Sunday 8:00 AM
    N8N->>API: GET /api/internal/families
    API-->>N8N: All families + members

    loop For each family
        loop For each member
            N8N->>API: GET vitals / medications / profile
            API-->>N8N: Weekly summaries
            N8N->>ML: POST /predict (merged data)
            ML-->>N8N: Risk scores + health score
            N8N->>API: POST /api/internal/health-summary
            API->>Gemini: Generate narrative summary
            Gemini-->>API: Summary, tip, motivation
            API-->>N8N: AI-generated text
        end
        N8N->>ML: POST /generate-pdf (all members)
        ML-->>N8N: Base64 PDF
        N8N->>Gmail: Send email with PDF attached
    end
```

### Authentication Flow

```mermaid
sequenceDiagram
    participant U as User
    participant FE as Frontend
    participant API as Backend API
    participant DB as MongoDB

    U->>FE: Submit login credentials
    FE->>API: POST /api/auth/login
    API->>DB: Find user, compare hashed password
    DB-->>API: User document
    API->>API: Generate JWT (jsonwebtoken)
    API-->>FE: { token, user }
    FE->>FE: Store token in localStorage
    FE->>API: Subsequent requests with Authorization: Bearer <token>
    API->>API: Verify JWT via protect middleware
    API-->>FE: Authorized response
```

> **Note:** Internal automation routes (`/api/internal/*`) use a separate `x-internal-key` header-based authentication scheme instead of JWT, since they are called by n8n (a non-browser, server-side client) rather than an authenticated user session.

---

## 📂 Project Structure

```
HealthHive/
├── frontend/                      # React + Vite client application
│   ├── src/
│   │   ├── components/            # Reusable UI components
│   │   │   ├── members/           # Family member management UI
│   │   │   └── documents/         # Document upload/viewer components
│   │   ├── context/                # AuthContext — global auth state
│   │   ├── services/                # Axios API service layer
│   │   │   └── authService.js      # Centralized API client + interceptors
│   │   ├── pages/                  # Route-level page components
│   │   └── App.jsx
│   └── package.json
│
├── backend/                       # Node.js + Express REST API
│   ├── config/
│   │   └── db.js                   # MongoDB connection setup
│   ├── controllers/                # Business logic per resource
│   │   ├── authController.js       # Signup, login, JWT generation
│   │   ├── familyController.js
│   │   ├── vitalsController.js
│   │   ├── medicationController.js
│   │   ├── documentController.js
│   │   ├── healthReportController.js
│   │   └── internalController.js   # n8n-facing internal endpoints
│   ├── models/                     # Mongoose schemas
│   │   ├── User.js
│   │   ├── Family.js
│   │   ├── Vitals.js
│   │   ├── Medication.js
│   │   ├── MedicationLog.js
│   │   ├── HealthProfile.js
│   │   ├── Appointment.js
│   │   ├── HealthReport.js
│   │   ├── MedicalDocument.js
│   │   ├── Emergency.js
│   │   └── ReminderLog.js
│   ├── routes/                     # Express route definitions
│   │   ├── authRoutes.js
│   │   ├── familyRoutes.js
│   │   ├── vitalsRoutes.js
│   │   ├── medicationRoutes.js
│   │   ├── internalRoutes.js       # Internal API-key protected routes
│   │   └── ...
│   ├── middleware/
│   │   └── authMiddleware.js       # JWT verification (protect)
│   ├── services/
│   │   ├── geminiService.js        # Gemini API wrapper with model fallback
│   │   ├── reminderService.js      # Cron-based medication reminders
│   │   └── appointmentReminderService.js
│   ├── server.js                   # App entry point
│   └── package.json
│
├── ml-service/                    # Python Flask ML microservice
│   ├── data/
│   │   ├── raw/                    # Source Kaggle datasets
│   │   ├── processed/              # Cleaned, merged feature sets
│   │   └── synthetic/              # Generated synthetic training data
│   ├── notebooks/                  # Jupyter notebooks (data prep + training)
│   │   ├── 01_generate_synthetic.ipynb
│   │   ├── 02_preprocess_diabetes.ipynb
│   │   ├── 03_preprocess_hypertension.ipynb
│   │   ├── 04_preprocess_health_score.ipynb
│   │   ├── 05_train_diabetes.ipynb
│   │   ├── 06_train_hypertension.ipynb
│   │   └── 07_train_health_score.ipynb
│   ├── models/                     # Serialized trained models
│   │   ├── diabetes/
│   │   ├── hypertension/
│   │   └── health_score/
│   ├── app.py                       # Flask API — /predict, /generate-pdf
│   ├── pdf_generator.py             # ReportLab-based PDF builder
│   └── requirements.txt
│
└── README.md
```

---

## ⚙️ Installation

### Prerequisites
- Node.js (v18+ recommended)
- Python 3.13+
- MongoDB Atlas account (or local MongoDB instance)
- npm or yarn

### 1. Clone the Repository
```bash
git clone https://github.com/Hardik-M-Agarwal/HealthHive.git
cd HealthHive
```

### 2. Backend Setup
```bash
cd backend
npm install
```
Create a `.env` file in `backend/` (see [Environment Variables](#-environment-variables) below).

```bash
npm run dev      # development (nodemon)
npm start        # production
```

### 3. Frontend Setup
```bash
cd frontend
npm install
```
Create a `.env` file in `frontend/`:
```env
VITE_API_URL=http://localhost:5000/api
```

```bash
npm run dev       # development server
npm run build     # production build
```

### 4. ML Service Setup
```bash
cd ml-service
python -m venv venv

# Windows
venv\Scripts\activate
# macOS/Linux
source venv/bin/activate

pip install -r requirements.txt
python app.py
```
The ML service runs on `http://localhost:5002` by default (or the port specified by the `PORT` environment variable in production).

### 5. n8n Automation Setup (Optional)
```bash
npm install -g n8n
n8n start
```
Import the workflow and configure credentials for:
- HTTP Request nodes (internal API key header)
- Gmail OAuth2 (for automated email delivery)

---

## 🔑 Environment Variables

### Backend (`backend/.env`)

| Variable | Purpose | Required | Example |
|---|---|---|---|
| `PORT` | Server port | No (defaults to 5000) | `5000` |
| `MONGODB_URI` | MongoDB Atlas connection string | Yes | `mongodb+srv://user:pass@cluster.mongodb.net/dbname` |
| `JWT_SECRET` | Secret key for signing JWTs | Yes | `your-secret-key` |
| `JWT_EXPIRE` | JWT expiry duration | Yes | `30d` |
| `GEMINI_API_KEY` | Google Gemini API key | Yes | `AIza...` |
| `INTERNAL_API_KEY` | Shared secret for n8n → backend internal routes | Yes | `your-internal-key` |
| `FRONTEND_URL` | Deployed frontend origin(s) for CORS | Yes (production) | `https://your-app.vercel.app` |
| `TWILIO_ACCOUNT_SID` | Twilio account SID | Yes (for SMS/WhatsApp) | `AC...` |
| `TWILIO_AUTH_TOKEN` | Twilio auth token | Yes (for SMS/WhatsApp) | `your-token` |
| `TWILIO_WHATSAPP_FROM` | Twilio WhatsApp sender number | Yes (for WhatsApp) | `whatsapp:+14155238886` |
| `CLOUDINARY_CLOUD_NAME` | Cloudinary account name | Yes (for image upload) | `your-cloud-name` |
| `CLOUDINARY_API_KEY` | Cloudinary API key | Yes | `123456789` |
| `CLOUDINARY_API_SECRET` | Cloudinary API secret | Yes | `your-secret` |

### Frontend (`frontend/.env`)

| Variable | Purpose | Required | Example |
|---|---|---|---|
| `VITE_API_URL` | Backend API base URL | Yes | `https://your-backend.onrender.com/api` |

### ML Service (Render environment variables)

| Variable | Purpose | Required | Example |
|---|---|---|---|
| `PORT` | Provided automatically by Render | No | `10000` |
| `PYTHON_VERSION` | Pin Python runtime version | Recommended | `3.13.13` |
| `FRONTEND_URL` | Allowed CORS origin (optional, defaults permissively) | No | `https://your-app.vercel.app` |
| `BACKEND_URL` | Allowed CORS origin for backend calls (optional) | No | `https://your-backend.onrender.com` |

> ⚠️ Never commit `.env` files. Use `.env.example` templates and platform-specific environment variable dashboards (Render/Vercel) for production secrets.

---

## 📡 API Documentation

### Authentication

| Method | Endpoint | Purpose | Auth Required | Request Body | Response |
|---|---|---|---|---|---|
| POST | `/api/auth/signup` | Register a new user | No | `{ name, email, password, phoneNumber }` | `{ success, token, user }` |
| POST | `/api/auth/login` | Authenticate user | No | `{ email, password }` | `{ success, token, user }` |
| GET | `/api/auth/me` | Get current authenticated user | Yes (JWT) | — | `{ success, user }` |

### Family

| Method | Endpoint | Purpose | Auth Required |
|---|---|---|---|
| POST | `/api/family/create` | Create a new family | Yes |
| POST | `/api/family/join` | Join family via code | Yes |
| GET | `/api/family/members` | Get all members of the user's family | Yes |
| GET | `/api/family/:familyId` | Get family details | Yes |

### Onboarding / Health Profile

| Method | Endpoint | Purpose | Auth Required |
|---|---|---|---|
| POST | `/api/onboarding/complete` | Submit initial health profile | Yes |
| GET | `/api/onboarding/profile` | Get health profile | Yes |
| PUT | `/api/onboarding/profile` | Update health profile | Yes |
| GET | `/api/onboarding/status` | Check onboarding completion status | Yes |

### Vitals

| Method | Endpoint | Purpose | Auth Required |
|---|---|---|---|
| POST | `/api/vitals` | Log a new vitals reading | Yes |
| GET | `/api/vitals/my-vitals` | Get current user's vitals | Yes |
| GET | `/api/vitals/my-chart` | Get chart-ready vitals data | Yes |
| GET | `/api/vitals/family` | Get vitals for entire family | Yes |
| POST | `/api/vitals/analyze-my-trend` | AI-generated trend analysis | Yes |

### Internal Automation Routes (used by n8n)

| Method | Endpoint | Purpose | Auth Required |
|---|---|---|---|
| GET | `/api/internal/families` | Get all families with members | `x-internal-key` header |
| GET | `/api/internal/vitals/:userId` | Get weekly vitals summary for a member | `x-internal-key` header |
| GET | `/api/internal/medications/:userId` | Get weekly medication adherence summary | `x-internal-key` header |
| GET | `/api/internal/profile/:userId` | Get health profile with derived age/BMI | `x-internal-key` header |
| POST | `/api/internal/health-summary` | Generate AI narrative health summary | `x-internal-key` header |

### ML Microservice

| Method | Endpoint | Purpose | Request Body | Response |
|---|---|---|---|---|
| GET | `/health` | Service health check | — | `{ status, message }` |
| POST | `/predict` | Run ML risk prediction for a member | Member health/vitals features (16 fields) | `{ health_score, health_grade, risk_assessment, contributing_factors, positive_factors }` |
| POST | `/generate-pdf` | Generate weekly family PDF report | Family + members report data | `{ success, pdf_base64, filename }` |

> Full route listings for medications, appointments, emergency, health reports, documents, and dashboard follow the same authenticated REST conventions and are organized by resource in `backend/routes/`.

---

## 🗄️ Database Design

Health Hive uses **MongoDB** with **Mongoose** schemas. Key collections:

| Collection | Purpose | Key Fields |
|---|---|---|
| `users` | User accounts | `name`, `email`, `password` (hashed), `familyId`, `role`, `onboardingCompleted` |
| `families` | Family groupings | `familyName`, `familyCode`, `createdBy` |
| `healthprofiles` | Per-user health data | `dateOfBirth`, `bloodGroup`, `height`, `weight`, `allergies`, `chronicConditions`, `emergencyContacts` |
| `vitals` | Logged vitals readings | `userId`, `familyId`, `vitalsType`, `value`, `unit`, `abnormalFlag`, `timestamp` |
| `medications` | Prescribed medications | `userId`, `name`, `dosage`, `frequency`, `schedule` |
| `medicationlogs` | Dose-taken/missed records | `userId`, `medicationId`, `status`, `scheduledDate` |
| `appointments` | Scheduled appointments | `userId`, `doctorName`, `date`, `reminderSent` |
| `medicaldocuments` | Uploaded documents/images | `userId`, `fileUrl`, `fileType`, `category` |
| `healthreports` | Generated reports | `familyId`, `members`, `generatedAt` |
| `emergencies` | Emergency alert records | `userId`, `token`, `location`, `status` |

**Relationships:** Most collections reference `userId` and/or `familyId` via Mongoose `ObjectId` refs, enabling both per-user queries and family-wide aggregation (e.g., the internal `/families` endpoint performs a nested lookup of all members per family).

**Indexing:** Vitals are indexed on `{ userId: 1, vitalsType: 1, timestamp: -1 }` to optimize the most common query pattern — fetching a user's recent readings of a specific type in descending chronological order.

---

## 🔐 Authentication & Authorization

- **Password security:** Passwords are hashed using `bcryptjs` with salt generation before storage; plaintext passwords are never persisted.
- **JWT-based sessions:** On successful login/signup, a JWT is issued containing the user's ID, signed with `JWT_SECRET`, and set to expire per `JWT_EXPIRE`.
- **Token storage & transport:** The frontend stores the token in `localStorage` and attaches it via an Axios request interceptor as `Authorization: Bearer <token>` on every authenticated request.
- **Protected routes:** A `protect` middleware verifies the JWT on incoming requests and attaches the decoded user to `req.user` before allowing access to protected controllers.
- **Role-based access:** Users hold a `role` of `admin` or `member` scoped to their family, controlling permissions for family-level actions (e.g., only the creating admin can manage certain family settings).
- **Internal service authentication:** Automation routes consumed by n8n are **not** protected by JWT (since n8n is not a logged-in user session). Instead, they use a dedicated `x-internal-key` header checked against `INTERNAL_API_KEY`, cleanly separating system-to-system trust from user authentication.
- **Auto-logout on 401:** An Axios response interceptor detects `401 Unauthorized` responses, clears stored credentials, and redirects to the login page automatically.

---

## 🔄 Application Workflow

1. **Signup/Login** — User creates an account or logs in, receiving a JWT.
2. **Family Setup** — New users either create a family (becoming admin) or join an existing one via a family code.
3. **Onboarding** — User completes a health profile (DOB, blood group, height/weight, allergies, chronic conditions, emergency contacts).
4. **Daily Use** — Users log vitals, track medications, upload documents, and schedule appointments through the dashboard.
5. **Reminders** — Background cron jobs check medication and appointment schedules and trigger WhatsApp/SMS reminders via Twilio at configured times.
6. **AI Assistance** — Users can request AI-generated explanations of medicines, simplified summaries of medical reports, and trend analysis of their vitals — all powered by Gemini.
7. **Weekly Automated Report** *(the platform's signature workflow)*:
   - Every Sunday at 8:00 AM, an n8n workflow triggers automatically.
   - It fetches every registered family and loops through each member.
   - For each member, it pulls 7-day vitals, medication adherence, and profile data from the backend.
   - This data is sent to the Flask ML service, which returns diabetes, hypertension, and cardiovascular risk predictions along with an overall health score.
   - The risk data is passed to Gemini (via the backend) to generate a warm, personalized narrative summary.
   - Once all family members are processed, the combined data is sent to the PDF generation endpoint, producing a multi-section report.
   - The report is emailed to every family member automatically — no manual step required.

---

## ⚡ Performance Optimizations

- **Pre-loaded ML models:** All three XGBoost models, scalers, and label encoders are loaded once into memory at Flask service startup (not per-request), eliminating repeated disk I/O during inference.
- **Lean Mongoose queries:** Internal API endpoints use `.lean()` on read-heavy queries (e.g., fetching families and members) to skip Mongoose document hydration overhead and return plain JS objects faster.
- **Server-side aggregation:** Weekly vitals and medication summaries (averages, adherence rate, variability) are computed on the backend before being sent to the ML service, avoiding redundant computation across services.
- **In-memory PDF generation:** PDF reports are built entirely in memory using a `BytesIO` buffer and returned as base64 — no intermediate file writes to disk during the request lifecycle.
- **Batched workflow automation:** The n8n pipeline processes families sequentially with controlled batching, and includes a deliberate rate-limit buffer (Wait node) before AI summary calls to avoid throttling from upstream AI providers.
- **Compression middleware:** The backend uses `compression` to reduce response payload sizes.

---

## 🛡️ Security Features

- Password hashing via `bcryptjs` (salted)
- JWT-based stateless authentication with configurable expiry
- Helmet middleware for secure HTTP headers
- Express rate limiting (`express-rate-limit`) to mitigate brute-force and abuse
- Input validation via `express-validator` on write-heavy endpoints (signup, family creation, vitals)
- CORS configured with an explicit origin allowlist (`FRONTEND_URL`) in production rather than a wildcard, while still permitting legitimate non-browser server-to-server calls
- Separate internal API-key authentication for automation routes, isolated from user JWT scope
- Environment-based secrets management — no credentials committed to source control
- Authenticated, token-gated document retrieval endpoints (no public file access)

---

## 🧩 Challenges Faced

**Decoupling automation from user authentication.** Initially, the plan was to have n8n call existing user-protected routes, but those require a JWT tied to a logged-in session — something an automation tool has no natural way of holding. This was solved by designing a parallel set of internal routes (`/api/internal/*`) protected by a static, server-side API key, cleanly separating "a user is acting" from "the system is acting on a schedule."

**Cross-origin network access from a local automation tool.** Self-hosted n8n running on Windows could not reliably reach `localhost`-bound services for inter-service calls during development; this was resolved by binding services to `0.0.0.0` and routing through the host machine's local network IP during development, and through public deployed URLs in production.

**Reassembling per-member data into a per-family report.** The automation pipeline processes data per individual family member (parallel HTTP calls per member), but the final PDF report needs to be a single document per family containing all members. This required careful aggregation logic in n8n's code nodes to collect indexed results from prior pipeline steps and recombine them by family before triggering PDF generation.

**Avoiding upstream AI rate limits during batch processing.** Generating AI summaries for multiple family members in quick succession occasionally triggered provider-side rate limiting. This was addressed by introducing a controlled wait/delay step in the automation pipeline between AI calls.

**Bridging synthetic and real clinical data for model training.** Public clinical datasets (Kaggle) don't include behavioral fields like medication adherence or logging variability that are core to this platform. This was addressed by generating a structured synthetic dataset with realistic clinical correlations to augment the real datasets, allowing the models to learn from both established clinical patterns and platform-specific behavioral signals.

---

## 🚧 Future Enhancements

- Migrate the self-hosted n8n automation to a persistently running cloud instance for guaranteed weekly execution independent of local machine uptime
- Expand the ML feature set with real (non-synthetic) longitudinal adherence and lifestyle data as the user base grows, improving model generalization
- Add a notification preference center allowing families to customize report frequency and delivery channel (email/WhatsApp)
- Introduce model versioning and a retraining pipeline to periodically update ML models as more real usage data is collected
- Add doctor/caregiver-facing read-only views for shared care coordination
- Implement audit logging for sensitive actions (document access, profile changes) to strengthen the security posture

---

## 📚 Lessons Learned

Building Health Hive involved working across the full stack of a real product — not just CRUD operations, but the harder, less commonly practiced parts: training and serving machine learning models as an independent service, designing authentication schemes for non-human clients, orchestrating multi-service workflows with a dedicated automation tool, and deploying a multi-service architecture across separate hosting platforms with correctly scoped CORS policies. It reinforced that "AI integration" done well is an architectural decision (where does inference run, how is it secured, how does it fail gracefully) rather than a single API call, and that automation pipelines require the same rigor around data flow and error handling as traditional backend code.

---

<p align="center">Built with ❤️ for families who deserve a smarter way to stay healthy, together.</p>
