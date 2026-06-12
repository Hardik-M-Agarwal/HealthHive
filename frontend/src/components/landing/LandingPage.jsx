import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

// ─── Animated counter hook ───────────────────────────────────────────────────
const useCounter = (end, duration = 2000, start = false) => {
  const [count, setCount] = useState(0);
  useEffect(() => {
    if (!start) return;
    let startTime = null;
    const animate = (timestamp) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      setCount(Math.floor(progress * end));
      if (progress < 1) requestAnimationFrame(animate);
    };
    requestAnimationFrame(animate);
  }, [end, duration, start]);
  return count;
};

// ─── Intersection observer hook ──────────────────────────────────────────────
const useInView = (threshold = 0.1) => {
  const ref = useRef(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) { setInView(true); observer.disconnect(); }
    }, { threshold });
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [threshold]);
  return [ref, inView];
};

// ─── Feature data ─────────────────────────────────────────────────────────────
const FEATURES = [
  {
    icon: '💊',
    title: 'Medication Manager',
    desc: 'Set schedules, track doses, and get SMS reminders 30 minutes before each dose. Mark medications as taken directly from your dashboard.',
    color: 'bg-blue-50 text-blue-600',
  },
  {
    icon: '📈',
    title: 'Vitals Tracker',
    desc: 'Log blood pressure, sugar, pulse, weight and temperature. AI-powered trend analysis detects patterns and flags abnormal readings.',
    color: 'bg-violet-50 text-violet-600',
  },
  {
    icon: '📅',
    title: 'Appointment Scheduler',
    desc: 'Book and manage doctor appointments for every family member. WhatsApp reminders sent 24 hours in advance.',
    color: 'bg-emerald-50 text-emerald-600',
  },
  {
    icon: '🩻',
    title: 'Health Report Simplifier',
    desc: 'Upload any medical report — PDF or image. Our AI extracts the text, explains it in plain language, and highlights abnormal markers.',
    color: 'bg-amber-50 text-amber-600',
  },
  {
    icon: '📁',
    title: 'Document Repository',
    desc: 'Securely store prescriptions, lab reports, discharge summaries and more. Search, favourite, and view everything in one place.',
    color: 'bg-rose-50 text-rose-600',
  },
  {
    icon: '🚨',
    title: 'Emergency SOS',
    desc: 'One tap sends your live location and emergency type to every family member via SMS. Never be unreachable in a crisis.',
    color: 'bg-red-50 text-red-600',
  },
];

const HOW_IT_WORKS = [
  { step: '01', title: 'Create your family', desc: 'Sign up and generate a unique family code. Share it with your family members so they can join your group.' },
  { step: '02', title: 'Set up health profiles', desc: 'Each member completes a health profile — blood group, allergies, past diseases, and emergency contacts.' },
  { step: '03', title: 'Start managing together', desc: 'Add medications, log vitals, upload reports, schedule appointments — all from one shared family dashboard.' },
];

const TESTIMONIALS = [
  { name: 'Sarah Johnson', role: 'Mother of two', avatar: 'SJ', color: 'bg-blue-500', text: 'The medication reminders alone were worth it. My father-in-law has seven daily medications — we haven\'t missed a single dose in three months.' },
  { name: 'Dr. Michael Chen', role: 'Family Physician', avatar: 'MC', color: 'bg-emerald-500', text: 'I recommend this to all my patients with chronic conditions. Having everything documented and accessible saves us time every consultation.' },
  { name: 'Priya Sharma', role: 'Caregiver, 5-member family', avatar: 'PS', color: 'bg-violet-500', text: 'The health report simplifier is genuinely remarkable. My parents can finally understand their own lab results without calling me in a panic.' },
];

// ════════════════════════════════════════════════════════════════════════════
const LandingPage = () => {
  const [scrolled, setScrolled] = useState(false);
  const [statsRef, statsInView] = useInView(0.3);
  const { isAuthenticated } = useAuth();

  const families = useCounter(10000, 2000, statsInView);
  const records = useCounter(50000, 2200, statsInView);
  const doses = useCounter(200000, 2400, statsInView);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <div className="min-h-screen bg-white font-sans">

      {/* ── Nav ─────────────────────────────────────────────────────────── */}
      <nav className={`fixed top-0 w-full z-50 transition-all duration-300 ${
        scrolled ? 'bg-white/95 backdrop-blur-md shadow-sm border-b border-slate-100' : 'bg-transparent'
      }`}>
        <div className="max-w-7xl mx-auto px-6 lg:px-8 flex items-center justify-between h-18 py-4">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 bg-blue-600 rounded-xl flex items-center justify-center shadow-sm">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
            </div>
            <span className="text-lg font-bold text-slate-900">FamilyHealth</span>
          </div>

          <div className="hidden md:flex items-center gap-8">
            {['Features', 'How it works', 'Testimonials'].map(item => (
              <a key={item} href={`#${item.toLowerCase().replace(/\s+/g, '-')}`}
                className="text-sm font-medium text-slate-600 hover:text-blue-600 transition-colors">
                {item}
              </a>
            ))}
          </div>

          <div className="flex items-center gap-3">
            {!isAuthenticated ? (
              <>
                <Link to="/login" className="text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors px-3 py-2">
                  Log in
                </Link>
                <Link to="/signup" className="text-sm font-semibold bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors shadow-sm">
                  Get started free
                </Link>
              </>
            ) : (
              <Link to="/dashboard" className="text-sm font-semibold bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors">
                Go to Dashboard →
              </Link>
            )}
          </div>
        </div>
      </nav>

      {/* ── Hero ────────────────────────────────────────────────────────── */}
      <section className="relative pt-28 pb-20 overflow-hidden">
        {/* Background */}
        <div className="absolute inset-0 bg-gradient-to-b from-blue-50/60 via-white to-white pointer-events-none" />
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-gradient-to-bl from-blue-100/40 to-transparent rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-20 left-0 w-[400px] h-[400px] bg-gradient-to-br from-violet-100/30 to-transparent rounded-full blur-3xl pointer-events-none" />

        <div className="relative max-w-7xl mx-auto px-6 lg:px-8">
          <div className="max-w-3xl mx-auto text-center">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 bg-blue-50 border border-blue-100 text-blue-700 text-xs font-semibold px-3.5 py-1.5 rounded-full mb-8">
              <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span>
              Your family's health, always within reach
            </div>

            <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-slate-900 leading-[1.08] tracking-tight mb-6">
              One portal for{' '}
              <span className="relative inline-block">
                <span className="text-blue-600">every health</span>
                <svg className="absolute -bottom-1 left-0 w-full" height="6" viewBox="0 0 300 6" fill="none" preserveAspectRatio="none">
                  <path d="M0 5 Q75 1 150 3 Q225 5 300 2" stroke="#3b82f6" strokeWidth="2.5" strokeLinecap="round" fill="none" opacity="0.5"/>
                </svg>
              </span>{' '}
              need your family has
            </h1>

            <p className="text-lg md:text-xl text-slate-500 leading-relaxed mb-10 max-w-2xl mx-auto">
              Medications, appointments, vitals, reports, and emergency alerts — 
              all connected, all shared, all in one place. Built for families managing health together.
            </p>

            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link to="/signup"
                className="inline-flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold px-7 py-3.5 rounded-xl transition-all duration-200 shadow-lg shadow-blue-600/20 hover:shadow-xl hover:shadow-blue-600/30 hover:-translate-y-0.5">
                Start for free
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </Link>
              <a href="#features"
                className="inline-flex items-center justify-center gap-2 bg-white hover:bg-slate-50 text-slate-700 font-semibold px-7 py-3.5 rounded-xl border border-slate-200 transition-all duration-200 hover:-translate-y-0.5">
                See features
              </a>
            </div>

            <p className="text-xs text-slate-400 mt-4">No credit card required · Free forever for small families</p>
          </div>

          {/* Dashboard mockup */}
          <div className="mt-16 relative max-w-5xl mx-auto">
            <div className="absolute -inset-4 bg-gradient-to-r from-blue-600/10 via-violet-600/10 to-cyan-600/10 rounded-3xl blur-2xl"></div>
            <div className="relative bg-white rounded-2xl border border-slate-200 shadow-2xl overflow-hidden">
              {/* Browser bar */}
              <div className="flex items-center gap-2 px-4 py-3 bg-slate-50 border-b border-slate-200">
                <div className="w-3 h-3 rounded-full bg-red-400"></div>
                <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
                <div className="w-3 h-3 rounded-full bg-green-400"></div>
                <div className="flex-1 mx-4 bg-white rounded-md px-3 py-1 text-xs text-slate-400 border border-slate-200">
                  familyhealth.app/dashboard
                </div>
              </div>
              {/* Mock dashboard */}
              <div className="p-6 bg-slate-50 min-h-[320px]">
                <div className="grid grid-cols-4 gap-4 mb-6">
                  {[
                    { label: 'Meds Today', value: '3/5', color: 'bg-blue-100 text-blue-700' },
                    { label: 'Next Appointment', value: 'Tomorrow', color: 'bg-green-100 text-green-700' },
                    { label: 'Abnormal Vitals', value: '0', color: 'bg-emerald-100 text-emerald-700' },
                    { label: 'Family Members', value: '4', color: 'bg-violet-100 text-violet-700' },
                  ].map((card, i) => (
                    <div key={i} className="bg-white rounded-xl p-4 border border-slate-100 shadow-sm">
                      <p className="text-xs text-slate-400 mb-1">{card.label}</p>
                      <p className={`text-xl font-bold px-2 py-0.5 rounded-lg inline-block ${card.color}`}>{card.value}</p>
                    </div>
                  ))}
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div className="col-span-2 bg-white rounded-xl p-4 border border-slate-100 shadow-sm">
                    <p className="text-sm font-semibold text-slate-700 mb-3">Today's Medication Schedule</p>
                    {[
                      { time: '🌅 Morning', med: 'Metformin 500mg', done: true },
                      { time: '☀️ Afternoon', med: 'Vitamin D3', done: false },
                      { time: '🌙 Night', med: 'Atorvastatin 10mg', done: false },
                    ].map((row, i) => (
                      <div key={i} className={`flex items-center justify-between py-2 px-3 rounded-lg mb-1.5 ${row.done ? 'bg-green-50' : 'bg-slate-50'}`}>
                        <span className="text-xs text-slate-500">{row.time}</span>
                        <span className="text-xs font-medium text-slate-700">{row.med}</span>
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${row.done ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'}`}>
                          {row.done ? '✓ Taken' : 'Pending'}
                        </span>
                      </div>
                    ))}
                  </div>
                  <div className="bg-white rounded-xl p-4 border border-slate-100 shadow-sm">
                    <p className="text-sm font-semibold text-slate-700 mb-3">Family Vitals</p>
                    {[
                      { name: 'Hardik', vital: 'BP 118/78', ok: true },
                      { name: 'Priya', vital: 'Sugar 95', ok: true },
                      { name: 'Raj', vital: 'BP 148/92', ok: false },
                    ].map((row, i) => (
                      <div key={i} className="flex items-center justify-between py-1.5">
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center text-white text-xs font-bold">{row.name[0]}</div>
                          <span className="text-xs text-slate-600">{row.vital}</span>
                        </div>
                        <span className={`w-2 h-2 rounded-full ${row.ok ? 'bg-green-500' : 'bg-red-500'}`}></span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Stats ───────────────────────────────────────────────────────── */}
      <section ref={statsRef} className="py-16 border-y border-slate-100 bg-white">
        <div className="max-w-5xl mx-auto px-6 grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
          {[
            { value: families, suffix: '+', label: 'Families using FamilyHealth', prefix: '' },
            { value: records, suffix: '+', label: 'Health records stored securely', prefix: '' },
            { value: doses, suffix: '+', label: 'Medication doses tracked', prefix: '' },
          ].map((stat, i) => (
            <div key={i}>
              <p className="text-4xl font-bold text-slate-900 tabular-nums">
                {stat.value.toLocaleString()}{stat.suffix}
              </p>
              <p className="text-sm text-slate-500 mt-1">{stat.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Features ────────────────────────────────────────────────────── */}
      <section id="features" className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="text-center mb-16">
            <p className="text-sm font-semibold text-blue-600 uppercase tracking-widest mb-3">What's inside</p>
            <h2 className="text-4xl md:text-5xl font-bold text-slate-900 mb-4">
              Everything a family needs<br />to stay on top of health
            </h2>
            <p className="text-lg text-slate-500 max-w-2xl mx-auto">
              Not just a record keeper — a complete health management system built around how families actually work.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {FEATURES.map((f, i) => (
              <div key={i} className="group p-6 bg-white rounded-2xl border border-slate-100 hover:border-slate-200 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                <div className={`w-12 h-12 ${f.color} rounded-xl flex items-center justify-center text-2xl mb-4`}>
                  {f.icon}
                </div>
                <h3 className="text-lg font-semibold text-slate-900 mb-2">{f.title}</h3>
                <p className="text-sm text-slate-500 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── How it works ────────────────────────────────────────────────── */}
      <section id="how-it-works" className="py-24 bg-slate-50">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="text-center mb-16">
            <p className="text-sm font-semibold text-blue-600 uppercase tracking-widest mb-3">Getting started</p>
            <h2 className="text-4xl md:text-5xl font-bold text-slate-900 mb-4">Up and running in minutes</h2>
            <p className="text-lg text-slate-500 max-w-xl mx-auto">No complicated setup. Your whole family can be onboarded in under ten minutes.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 relative">
            {/* connector */}
            <div className="hidden md:block absolute top-10 left-[calc(16.67%+2rem)] right-[calc(16.67%+2rem)] h-px bg-gradient-to-r from-blue-200 via-blue-400 to-blue-200"></div>

            {HOW_IT_WORKS.map((item, i) => (
              <div key={i} className="relative bg-white rounded-2xl p-8 border border-slate-100 shadow-sm hover:shadow-lg transition-shadow duration-300">
                <div className="w-12 h-12 bg-blue-600 text-white font-bold text-lg rounded-xl flex items-center justify-center mb-5 shadow-md shadow-blue-600/20">
                  {item.step}
                </div>
                <h3 className="text-xl font-semibold text-slate-900 mb-2">{item.title}</h3>
                <p className="text-slate-500 text-sm leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── What makes it different ──────────────────────────────────────── */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <p className="text-sm font-semibold text-blue-600 uppercase tracking-widest mb-3">Why FamilyHealth</p>
              <h2 className="text-4xl font-bold text-slate-900 mb-6 leading-tight">
                Built for families,<br />not just individuals
              </h2>
              <div className="space-y-5">
                {[
                  { icon: '👨‍👩‍👧', title: 'Everyone connected', desc: 'One family code, one shared dashboard. Every member\'s health is visible to those who need to know.' },
                  { icon: '🤖', title: 'AI that actually helps', desc: 'Gemini-powered analysis simplifies complex medical reports and explains vitals trends in plain language.' },
                  { icon: '📱', title: 'Notifications that matter', desc: 'SMS and WhatsApp reminders via Twilio and Circuit Digest. Your family gets notified, not just the app.' },
                  { icon: '🔐', title: 'Secure by design', desc: 'JWT authentication, bcrypt passwords, and role-based access. Your medical data stays yours.' },
                ].map((item, i) => (
                  <div key={i} className="flex gap-4">
                    <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center text-xl flex-shrink-0 mt-0.5">
                      {item.icon}
                    </div>
                    <div>
                      <h4 className="font-semibold text-slate-900 mb-1">{item.title}</h4>
                      <p className="text-sm text-slate-500 leading-relaxed">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Visual */}
            <div className="relative">
              <div className="absolute -inset-4 bg-gradient-to-r from-blue-50 to-violet-50 rounded-3xl"></div>
              <div className="relative space-y-4 p-6">
                {/* Emergency card */}
                <div className="bg-white rounded-2xl border border-red-100 p-5 shadow-sm">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 bg-red-600 rounded-full flex items-center justify-center">
                      <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                      </svg>
                    </div>
                    <div>
                      <p className="font-semibold text-slate-900 text-sm">Emergency SOS sent</p>
                      <p className="text-xs text-slate-400">3 family members notified</p>
                    </div>
                    <span className="ml-auto text-xs bg-red-100 text-red-600 px-2 py-0.5 rounded-full font-medium">Live</span>
                  </div>
                  <div className="text-xs text-slate-500 bg-slate-50 rounded-lg p-2">
                    📍 Location shared · Medical · "Chest pain, need help"
                  </div>
                </div>

                {/* Vitals alert */}
                <div className="bg-white rounded-2xl border border-amber-100 p-5 shadow-sm">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">⚠️</span>
                    <div>
                      <p className="font-semibold text-slate-900 text-sm">Raj's BP is above normal</p>
                      <p className="text-xs text-slate-400">148/92 mmHg — last reading 2 hours ago</p>
                    </div>
                  </div>
                </div>

                {/* Report simplified */}
                <div className="bg-white rounded-2xl border border-blue-100 p-5 shadow-sm">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-lg">🩺</span>
                    <p className="font-semibold text-slate-900 text-sm">Report simplified by AI</p>
                  </div>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    "Your HbA1c is 6.2%, which is at the border of pre-diabetic range. Your LDL cholesterol is slightly elevated at 142 mg/dL..."
                  </p>
                  <div className="mt-2 flex gap-1.5">
                    <span className="text-xs bg-red-50 text-red-600 px-2 py-0.5 rounded-full">HbA1c ↑</span>
                    <span className="text-xs bg-red-50 text-red-600 px-2 py-0.5 rounded-full">LDL ↑</span>
                    <span className="text-xs bg-green-50 text-green-600 px-2 py-0.5 rounded-full">RBC ✓</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Testimonials ─────────────────────────────────────────────────── */}
      <section id="testimonials" className="py-24 bg-slate-50">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="text-center mb-16">
            <p className="text-sm font-semibold text-blue-600 uppercase tracking-widest mb-3">Real families</p>
            <h2 className="text-4xl md:text-5xl font-bold text-slate-900 mb-4">
              What families are saying
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {TESTIMONIALS.map((t, i) => (
              <div key={i} className="bg-white rounded-2xl p-7 border border-slate-100 shadow-sm hover:shadow-lg transition-shadow duration-300">
                <div className="flex mb-4">
                  {[...Array(5)].map((_, j) => (
                    <svg key={j} className="w-4 h-4 text-amber-400 fill-current" viewBox="0 0 20 20">
                      <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z"/>
                    </svg>
                  ))}
                </div>
                <p className="text-slate-600 text-sm leading-relaxed mb-6">"{t.text}"</p>
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 ${t.color} rounded-full flex items-center justify-center text-white text-sm font-bold`}>
                    {t.avatar}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-900">{t.name}</p>
                    <p className="text-xs text-slate-400">{t.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ──────────────────────────────────────────────────────────── */}
      <section className="py-24 bg-blue-600 relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/40 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-blue-700/40 rounded-full blur-3xl"></div>
        </div>
        <div className="relative max-w-3xl mx-auto text-center px-6">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-5 leading-tight">
            Your family's health deserves better than scattered notes and forgotten appointments
          </h2>
          <p className="text-blue-100 text-lg mb-10 leading-relaxed">
            Join thousands of families who manage medications, vitals, reports and emergencies together — all in one place.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link to="/signup"
              className="inline-flex items-center justify-center gap-2 bg-white text-blue-600 font-semibold px-8 py-4 rounded-xl hover:bg-blue-50 transition-all duration-200 shadow-lg hover:shadow-xl hover:-translate-y-0.5">
              Get started — it's free
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </Link>
          </div>
          <p className="text-blue-200 text-xs mt-5">No credit card required · Takes 2 minutes to set up</p>
        </div>
      </section>

      {/* ── Footer ───────────────────────────────────────────────────────── */}
      <footer className="bg-slate-900 text-white py-14">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-10 mb-12">
            <div>
              <div className="flex items-center gap-2.5 mb-4">
                <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                  <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                  </svg>
                </div>
                <span className="font-bold">FamilyHealth</span>
              </div>
              <p className="text-slate-400 text-sm leading-relaxed">
                Making family health management simple, connected, and stress-free.
              </p>
            </div>
            {[
              { title: 'Product', links: ['Features', 'Security', 'Updates'] },
              { title: 'Company', links: ['About', 'Blog', 'Contact'] },
              { title: 'Legal', links: ['Privacy', 'Terms', 'Cookies'] },
            ].map((col, i) => (
              <div key={i}>
                <h4 className="text-sm font-semibold text-white mb-4">{col.title}</h4>
                <ul className="space-y-2.5">
                  {col.links.map((link, j) => (
                    <li key={j}>
                      <a href="#" className="text-slate-400 hover:text-white text-sm transition-colors">{link}</a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <div className="border-t border-slate-800 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-slate-500 text-sm">© 2025 FamilyHealth Portal. All rights reserved.</p>
            <p className="text-slate-500 text-sm">Built with ❤️ for families everywhere</p>
          </div>
        </div>
      </footer>

    </div>
  );
};

export default LandingPage;