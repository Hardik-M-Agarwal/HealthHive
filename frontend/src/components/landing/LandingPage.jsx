import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const LandingPage = () => {
  const [scrolled, setScrolled] = useState(false);
  const [activeFeature, setActiveFeature] = useState(0);
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Auto-rotate features
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveFeature((prev) => (prev + 1) % 3);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const features = [
    {
      title: "Centralized Health Records",
      description: "Store and access all family health records in one secure place. From prescriptions to vaccination history, everything at your fingertips.",
      icon: (
        <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
        </svg>
      ),
      color: "from-blue-500 to-cyan-500"
    },
    {
      title: "Medication Management",
      description: "Never miss a dose with smart medication reminders. Track prescriptions, set schedules, and get notifications for refills.",
      icon: (
        <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      color: "from-purple-500 to-pink-500"
    },
    {
      title: "Emergency Ready",
      description: "Critical health information accessible instantly. Emergency contacts, allergies, and medical conditions available when it matters most.",
      icon: (
        <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
        </svg>
      ),
      color: "from-green-500 to-emerald-500"
    }
  ];

  const stats = [
    { value: "10K+", label: "Active Families" },
    { value: "50K+", label: "Health Records" },
    { value: "24/7", label: "Emergency Access" },
    { value: "99.9%", label: "Uptime" }
  ];

  const testimonials = [
    {
      name: "Sarah Johnson",
      role: "Mother of two",
      content: "This portal has transformed how we manage our family's health. Having everything in one place during emergencies is invaluable.",
      avatar: "SJ",
      color: "bg-blue-500"
    },
    {
      name: "Dr. Michael Chen",
      role: "Family Physician",
      content: "I recommend this to all my patients. It helps families stay organized and provides crucial information when I need it most.",
      avatar: "MC",
      color: "bg-green-500"
    },
    {
      name: "The Williams Family",
      role: "5 family members",
      content: "From grandparents to kids, everyone's health info is accessible. The medication reminders are a lifesaver!",
      avatar: "WF",
      color: "bg-purple-500"
    }
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation - Enhanced */}
      <nav className={`fixed top-0 w-full z-50 transition-all duration-500 ${
        scrolled ? 'bg-white/95 backdrop-blur-xl shadow-xl border-b border-gray-100' : 'bg-transparent'
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            {/* Logo - Enhanced */}
            <div className="flex items-center space-x-3 group cursor-pointer">
              <div className="relative">
                <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-cyan-500 rounded-xl flex items-center justify-center transform group-hover:rotate-12 transition-all duration-500 shadow-lg">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                  </svg>
                </div>
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full animate-pulse ring-2 ring-white"></div>
              </div>
              <div>
                <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
                  FamilyHealth
                </span>
                <span className="block text-xs text-gray-500">Portal</span>
              </div>
            </div>

            {/* Desktop Navigation - Enhanced */}
            <div className="hidden md:flex items-center space-x-8">
              {['Features', 'How It Works', 'Testimonials', 'Pricing'].map((item) => (
                <a
                  key={item}
                  href={`#${item.toLowerCase().replace(/\s+/g, '-')}`}
                  className="text-gray-600 hover:text-blue-600 transition-all duration-300 font-medium relative group"
                >
                  {item}
                  <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-blue-600 to-cyan-500 group-hover:w-full transition-all duration-300"></span>
                </a>
              ))}
            </div>

            {/* Auth Buttons - Enhanced */}
            <div className="flex items-center space-x-4">
              {!isAuthenticated ? (
                <>
                  <Link
                    to="/login"
                    className="px-5 py-2 text-gray-700 hover:text-blue-600 font-medium transition-all duration-300 relative group"
                  >
                    Login
                    <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-blue-600 to-cyan-500 group-hover:w-full transition-all duration-300"></span>
                  </Link>
                  <Link
                    to="/signup"
                    className="px-6 py-2.5 bg-gradient-to-r from-blue-600 to-cyan-500 text-white font-medium rounded-xl hover:shadow-xl hover:shadow-blue-500/30 transform hover:scale-105 transition-all duration-300 relative overflow-hidden group"
                  >
                    <span className="relative z-10">Sign Up Free</span>
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-700 to-cyan-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  </Link>
                </>
              ) : (
                <Link
                  to="/dashboard"
                  className="px-6 py-2.5 bg-gradient-to-r from-blue-600 to-cyan-500 text-white font-medium rounded-xl hover:shadow-xl hover:shadow-blue-500/30 transform hover:scale-105 transition-all duration-300"
                >
                  Go to Dashboard
                </Link>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section - Enhanced */}
      <section className="relative pt-32 pb-20 overflow-hidden">
        {/* Background Elements - Enhanced */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-white to-cyan-50"></div>
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden">
          <div className="absolute -top-40 -right-40 w-96 h-96 bg-blue-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob"></div>
          <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-cyan-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-purple-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-4000"></div>
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            {/* Badge - Enhanced */}
            <div className="inline-flex items-center px-4 py-2 bg-blue-100 rounded-full mb-8 animate-fade-in hover:bg-blue-200 transition-all duration-300 cursor-default">
              <span className="relative flex h-3 w-3 mr-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
              </span>
              <span className="text-sm font-medium text-blue-800">Trusted by 10,000+ families</span>
            </div>

            {/* Main Heading - Enhanced */}
            <h1 className="text-5xl md:text-7xl font-bold text-gray-900 mb-6 animate-slide-up">
              Your Family's Health,
              <span className="block mt-2 relative">
                <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-cyan-500 bg-clip-text text-transparent animate-gradient">
                  All in One Place
                </span>
                <svg className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-32 h-8" viewBox="0 0 200 20">
                  <path d="M0,10 Q50,0 100,10 T200,10" stroke="url(#gradient)" fill="none" strokeWidth="2"/>
                  <defs>
                    <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="#3b82f6"/>
                      <stop offset="100%" stopColor="#06b6d4"/>
                    </linearGradient>
                  </defs>
                </svg>
              </span>
            </h1>

            {/* Description - Enhanced */}
            <p className="max-w-2xl mx-auto text-xl text-gray-600 mb-10 animate-slide-up animation-delay-200 leading-relaxed">
              The smartest way to manage your family's health records, medications, and emergencies. 
              Secure, accessible, and designed for modern families.
            </p>

            {/* CTA Buttons - Enhanced */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16 animate-slide-up animation-delay-400">
              <Link
                to="/signup"
                className="group px-8 py-4 bg-gradient-to-r from-blue-600 to-cyan-500 text-white font-semibold rounded-xl hover:shadow-2xl hover:shadow-blue-500/40 transform hover:scale-105 transition-all duration-300 relative overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-blue-700 to-cyan-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <span className="relative flex items-center justify-center">
                  Start Your Free Trial
                  <svg className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </span>
              </Link>
              <a
                href="#features"
                className="px-8 py-4 bg-white/80 backdrop-blur-sm text-gray-700 font-semibold rounded-xl border-2 border-gray-200 hover:border-blue-500 hover:text-blue-600 hover:bg-white transform hover:scale-105 transition-all duration-300"
              >
                Watch Demo
              </a>
            </div>

            {/* Stats - Enhanced */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-3xl mx-auto animate-fade-in animation-delay-600">
              {stats.map((stat, index) => (
                <div key={index} className="text-center group">
                  <div className="text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent group-hover:scale-110 transition-transform duration-300">
                    {stat.value}
                  </div>
                  <div className="text-sm text-gray-500 mt-1 group-hover:text-gray-700 transition-colors">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Dashboard Preview - Enhanced */}
          <div className="mt-20 relative animate-float">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-cyan-500 rounded-3xl blur-2xl opacity-30 animate-pulse"></div>
            <div className="relative bg-white/10 backdrop-blur-sm rounded-2xl shadow-2xl overflow-hidden border border-white/20">
              <img 
                src="https://placehold.co/1200x600/3b82f6/ffffff?text=Family+Health+Dashboard+Preview" 
                alt="Dashboard Preview"
                className="w-full h-auto transform hover:scale-105 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-white/20 via-transparent to-transparent"></div>
            </div>
            
            {/* Floating Elements - Enhanced */}
            <div className="absolute -top-4 -right-4 w-20 h-20 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full flex items-center justify-center animate-bounce shadow-xl">
              <span className="text-white font-bold text-2xl">24/7</span>
            </div>
            <div className="absolute -bottom-4 -left-4 w-16 h-16 bg-gradient-to-r from-purple-400 to-pink-500 rounded-full flex items-center justify-center animate-pulse shadow-xl">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section - Enhanced */}
      <section id="features" className="py-24 bg-gradient-to-b from-gray-50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Everything You Need to
              <span className="block bg-gradient-to-r from-blue-600 to-cyan-500 bg-clip-text text-transparent mt-2">
                Manage Family Health
              </span>
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Powerful features that make health management simple, secure, and stress-free for your entire family.
            </p>
          </div>

          {/* Feature Showcase - Enhanced */}
          <div className="grid lg:grid-cols-2 gap-12 items-center mb-20">
            <div className="space-y-8">
              {features.map((feature, index) => (
                <div
                  key={index}
                  className={`p-6 rounded-2xl transition-all duration-500 cursor-pointer ${
                    activeFeature === index 
                      ? 'bg-white shadow-2xl scale-105 border border-blue-100' 
                      : 'hover:bg-white/80 hover:shadow-lg'
                  }`}
                  onMouseEnter={() => setActiveFeature(index)}
                >
                  <div className="flex items-start space-x-4">
                    <div className={`w-16 h-16 bg-gradient-to-r ${feature.color} rounded-xl flex items-center justify-center text-white flex-shrink-0 shadow-lg group-hover:scale-110 transition-transform`}>
                      {feature.icon}
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold text-gray-900 mb-2">{feature.title}</h3>
                      <p className="text-gray-600">{feature.description}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Feature Preview - Enhanced */}
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-cyan-500 rounded-3xl blur-2xl opacity-20 animate-pulse"></div>
              <div className="relative bg-white p-8 rounded-2xl shadow-2xl border border-gray-100">
                <div className="aspect-w-16 aspect-h-9 bg-gradient-to-br from-gray-900 to-gray-800 rounded-xl overflow-hidden">
                  <div className="p-6 text-white">
                    <div className="flex items-center space-x-2 mb-4">
                      <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
                      <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                      <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                    </div>
                    {activeFeature === 0 && (
                      <div className="space-y-4 animate-fade-in">
                        <div className="h-4 w-3/4 bg-gradient-to-r from-blue-400 to-cyan-400 rounded"></div>
                        <div className="h-4 w-1/2 bg-gradient-to-r from-blue-400 to-cyan-400 rounded"></div>
                        <div className="grid grid-cols-2 gap-4 mt-6">
                          <div className="p-3 bg-white/10 rounded-lg backdrop-blur-sm">
                            <div className="h-3 w-20 bg-white/20 rounded mb-2"></div>
                            <div className="h-6 w-24 bg-gradient-to-r from-blue-400 to-cyan-400 rounded"></div>
                          </div>
                          <div className="p-3 bg-white/10 rounded-lg backdrop-blur-sm">
                            <div className="h-3 w-20 bg-white/20 rounded mb-2"></div>
                            <div className="h-6 w-24 bg-gradient-to-r from-green-400 to-emerald-400 rounded"></div>
                          </div>
                        </div>
                      </div>
                    )}
                    {activeFeature === 1 && (
                      <div className="space-y-4 animate-fade-in">
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full animate-pulse"></div>
                          <div>
                            <div className="h-4 w-32 bg-white/20 rounded mb-2"></div>
                            <div className="h-3 w-24 bg-white/10 rounded"></div>
                          </div>
                        </div>
                        <div className="pl-11">
                          <div className="h-2 w-full bg-gradient-to-r from-green-400 to-emerald-400 rounded-full mb-2"></div>
                          <div className="text-sm text-white/70">Next dose in 2 hours</div>
                        </div>
                      </div>
                    )}
                    {activeFeature === 2 && (
                      <div className="space-y-4 animate-fade-in">
                        <div className="p-4 bg-red-500/20 rounded-lg border border-red-500/30 backdrop-blur-sm">
                          <div className="flex items-center space-x-3">
                            <svg className="w-6 h-6 text-red-400 animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                            </svg>
                            <span className="font-medium">Critical Information Available</span>
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          <div className="p-2 bg-white/10 rounded backdrop-blur-sm hover:bg-white/20 transition">Emergency Contacts</div>
                          <div className="p-2 bg-white/10 rounded backdrop-blur-sm hover:bg-white/20 transition">Allergies</div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Feature Grid - Enhanced */}
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                title: "Smart Reminders",
                description: "Never miss medications or appointments with intelligent notifications.",
                icon: "🔔",
                gradient: "from-yellow-500 to-orange-500"
              },
              {
                title: "Secure Sharing",
                description: "Share records safely with doctors and family members.",
                icon: "🔒",
                gradient: "from-blue-500 to-indigo-500"
              },
              {
                title: "Health Insights",
                description: "Get AI-powered insights about your family's health trends.",
                icon: "📊",
                gradient: "from-purple-500 to-pink-500"
              },
              {
                title: "Vaccination Tracker",
                description: "Keep track of everyone's vaccination schedule.",
                icon: "💉",
                gradient: "from-green-500 to-emerald-500"
              },
              {
                title: "Document Storage",
                description: "Store all medical documents securely in one place.",
                icon: "📄",
                gradient: "from-red-500 to-pink-500"
              },
              {
                title: "Multi-language Support",
                description: "Available in 12 languages for diverse families.",
                icon: "🌍",
                gradient: "from-cyan-500 to-blue-500"
              }
            ].map((feature, index) => (
              <div key={index} className="group p-6 bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 border border-gray-100">
                <div className={`w-16 h-16 bg-gradient-to-r ${feature.gradient} rounded-2xl flex items-center justify-center text-3xl mb-4 group-hover:scale-110 transition-transform duration-300 shadow-lg`}>
                  {feature.icon}
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2 group-hover:text-transparent group-hover:bg-gradient-to-r group-hover:from-blue-600 group-hover:to-cyan-500 group-hover:bg-clip-text transition-all">
                  {feature.title}
                </h3>
                <p className="text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works - Enhanced */}
      <section id="how-it-works" className="py-24 bg-gradient-to-b from-white to-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Get Started in
              <span className="bg-gradient-to-r from-blue-600 to-cyan-500 bg-clip-text text-transparent"> 3 Simple Steps</span>
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Join thousands of families who already simplified their health management.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 relative">
            {/* Connector Line - Enhanced */}
            <div className="hidden md:block absolute top-1/3 left-1/4 right-1/4 h-0.5 bg-gradient-to-r from-blue-200 via-blue-400 to-cyan-200"></div>
            
            {[
              {
                step: "01",
                title: "Create Account",
                description: "Sign up in under 2 minutes with your email. No credit card required.",
                icon: "📝",
                gradient: "from-blue-500 to-cyan-500"
              },
              {
                step: "02",
                title: "Add Family Members",
                description: "Invite family members and set up their health profiles.",
                icon: "👨‍👩‍👧‍👦",
                gradient: "from-purple-500 to-pink-500"
              },
              {
                step: "03",
                title: "Start Managing",
                description: "Begin tracking health records, medications, and appointments.",
                icon: "🚀",
                gradient: "from-green-500 to-emerald-500"
              }
            ].map((item, index) => (
              <div key={index} className="relative group">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-cyan-500 rounded-2xl blur-2xl opacity-0 group-hover:opacity-30 transition-opacity duration-500"></div>
                <div className="relative bg-white p-8 rounded-2xl shadow-xl border border-gray-100 group-hover:border-blue-200 transition-all duration-500 hover:-translate-y-2">
                  <div className={`w-16 h-16 bg-gradient-to-r ${item.gradient} rounded-xl flex items-center justify-center text-white text-2xl font-bold mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg`}>
                    {item.step}
                  </div>
                  <div className="text-5xl mb-4 group-hover:scale-110 transition-transform inline-block">{item.icon}</div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">{item.title}</h3>
                  <p className="text-gray-600">{item.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials - Enhanced */}
      <section id="testimonials" className="py-24 bg-gradient-to-b from-gray-50 to-white overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Loved by
              <span className="bg-gradient-to-r from-blue-600 to-cyan-500 bg-clip-text text-transparent"> Families Everywhere</span>
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              See what our users have to say about their experience.
            </p>
          </div>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200"></div>
            </div>
            <div className="relative flex overflow-x-hidden">
              <div className="animate-scroll flex space-x-8">
                {[...testimonials, ...testimonials].map((testimonial, index) => (
                  <div
                    key={index}
                    className="flex-shrink-0 w-80 bg-white rounded-2xl shadow-xl p-6 mx-4 hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 border border-gray-100"
                  >
                    <div className="flex items-center mb-4">
                      <div className={`w-12 h-12 ${testimonial.color} rounded-xl flex items-center justify-center text-white font-bold text-lg shadow-lg`}>
                        {testimonial.avatar}
                      </div>
                      <div className="ml-4">
                        <h4 className="font-semibold text-gray-900">{testimonial.name}</h4>
                        <p className="text-sm text-gray-600">{testimonial.role}</p>
                      </div>
                    </div>
                    <p className="text-gray-700 italic leading-relaxed">"{testimonial.content}"</p>
                    <div className="flex mt-4">
                      {[...Array(5)].map((_, i) => (
                        <svg key={i} className="w-5 h-5 text-yellow-400 fill-current" viewBox="0 0 20 20">
                          <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z"/>
                        </svg>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section - Enhanced */}
      <section id="pricing" className="py-24 bg-gradient-to-b from-white to-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Simple, Transparent
              <span className="bg-gradient-to-r from-blue-600 to-cyan-500 bg-clip-text text-transparent"> Pricing</span>
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Choose the plan that works best for your family.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {[
              {
                name: "Basic",
                price: "Free",
                description: "Perfect for getting started",
                features: ["Up to 3 family members", "Basic health records", "Email support"],
                popular: false,
                gradient: "from-gray-500 to-gray-600"
              },
              {
                name: "Family",
                price: "$9.99",
                period: "/month",
                description: "Most popular for families",
                features: ["Up to 8 family members", "Advanced health tracking", "Medication reminders", "Priority support", "Emergency access"],
                popular: true,
                gradient: "from-blue-600 to-cyan-500"
              },
              {
                name: "Premium",
                price: "$19.99",
                period: "/month",
                description: "For extended families",
                features: ["Unlimited members", "AI health insights", "Telemedicine integration", "24/7 phone support", "Custom reports"],
                popular: false,
                gradient: "from-purple-600 to-pink-500"
              }
            ].map((plan, index) => (
              <div
                key={index}
                className={`relative rounded-2xl ${
                  plan.popular 
                    ? 'bg-gradient-to-b from-blue-600 to-cyan-600 text-white shadow-2xl scale-105' 
                    : 'bg-white text-gray-900 shadow-xl'
                } p-8 hover:scale-105 transition-all duration-500`}
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <span className="bg-gradient-to-r from-yellow-400 to-orange-500 text-gray-900 text-sm font-bold px-4 py-1 rounded-full shadow-lg">
                      MOST POPULAR
                    </span>
                  </div>
                )}
                <div className="text-center mb-6">
                  <h3 className="text-2xl font-bold mb-2">{plan.name}</h3>
                  <div className="flex items-center justify-center">
                    <span className="text-5xl font-bold">{plan.price}</span>
                    {plan.period && <span className={`${plan.popular ? 'text-blue-100' : 'text-gray-500'} ml-1`}>{plan.period}</span>}
                  </div>
                  <p className={`${plan.popular ? 'text-blue-100' : 'text-gray-500'} mt-2`}>{plan.description}</p>
                </div>
                <ul className="space-y-3 mb-8">
                  {plan.features.map((feature, i) => (
                    <li key={i} className="flex items-center">
                      <svg className={`w-5 h-5 mr-2 ${plan.popular ? 'text-white' : 'text-green-500'} flex-shrink-0`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <span className={plan.popular ? 'text-blue-50' : 'text-gray-700'}>{feature}</span>
                    </li>
                  ))}
                </ul>
                <Link
                  to="/signup"
                  className={`block text-center py-3 px-6 rounded-xl font-semibold transition-all duration-300 ${
                    plan.popular
                      ? 'bg-white text-blue-600 hover:bg-gray-100 hover:shadow-xl'
                      : `bg-gradient-to-r ${plan.gradient} text-white hover:shadow-xl`
                  }`}
                >
                  Get Started
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section - Enhanced */}
      <section className="py-24 bg-gradient-to-r from-blue-600 via-purple-600 to-cyan-600 relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-white rounded-full mix-blend-overlay filter blur-3xl opacity-20 animate-pulse"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-white rounded-full mix-blend-overlay filter blur-3xl opacity-20 animate-pulse animation-delay-2000"></div>
        </div>
        
        <div className="relative max-w-4xl mx-auto text-center px-4">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Ready to Transform Your Family's Health Management?
          </h2>
          <p className="text-xl text-blue-100 mb-10 max-w-2xl mx-auto">
            Join thousands of families who already trust us with their health records. 
            Start your free 30-day trial today.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/signup"
              className="group px-8 py-4 bg-white text-blue-600 font-semibold rounded-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-300 relative overflow-hidden"
            >
              <span className="relative z-10 flex items-center justify-center">
                Start Free Trial
                <svg className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </span>
              <div className="absolute inset-0 bg-gradient-to-r from-blue-50 to-cyan-50 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            </Link>
            <a
              href="#features"
              className="px-8 py-4 bg-white/20 backdrop-blur-sm text-white font-semibold rounded-xl border-2 border-white/30 hover:bg-white/30 transform hover:scale-105 transition-all duration-300"
            >
              Learn More
            </a>
          </div>
          <p className="text-blue-100 mt-6 text-sm">
            No credit card required. Cancel anytime.
          </p>
        </div>
      </section>

      {/* Footer - Enhanced */}
      <footer className="bg-gray-900 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-cyan-500 rounded-xl flex items-center justify-center">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                  </svg>
                </div>
                <span className="text-xl font-bold">FamilyHealth</span>
              </div>
              <p className="text-gray-400 text-sm leading-relaxed">
                Making family health management simple, secure, and stress-free.
              </p>
            </div>
            
            {[
              {
                title: "Product",
                links: ["Features", "Pricing", "Security", "Updates"]
              },
              {
                title: "Company",
                links: ["About", "Blog", "Careers", "Contact"]
              },
              {
                title: "Legal",
                links: ["Privacy", "Terms", "Cookie Policy", "Licenses"]
              }
            ].map((section, index) => (
              <div key={index}>
                <h4 className="font-semibold mb-4 text-white">{section.title}</h4>
                <ul className="space-y-2">
                  {section.links.map((link, i) => (
                    <li key={i}>
                      <a href="#" className="text-gray-400 hover:text-white transition-colors duration-300">
                        {link}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          
          <div className="border-t border-gray-800 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-400 text-sm">
              © 2024 FamilyHealth Portal. All rights reserved.
            </p>
            <div className="flex space-x-4 mt-4 md:mt-0">
              {['facebook', 'twitter', 'linkedin', 'instagram'].map((social) => (
                <a
                  key={social}
                  href="#"
                  className="w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center hover:bg-gray-700 transition-all duration-300 hover:scale-110"
                >
                  <span className="sr-only">{social}</span>
                  <svg className="w-5 h-5 text-gray-400 hover:text-white transition-colors" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2C6.477 2 2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.879V14.89h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.989C18.343 21.129 22 16.99 22 12c0-5.523-4.477-10-10-10z"/>
                  </svg>
                </a>
              ))}
            </div>
          </div>
        </div>
      </footer>

      <style jsx>{`
        @keyframes blob {
          0% { transform: translate(0px, 0px) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
          100% { transform: translate(0px, 0px) scale(1); }
        }
        .animate-blob {
          animation: blob 7s infinite;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .animation-delay-4000 {
          animation-delay: 4s;
        }
        @keyframes slide-up {
          0% { opacity: 0; transform: translateY(20px); }
          100% { opacity: 1; transform: translateY(0); }
        }
        .animate-slide-up {
          animation: slide-up 0.6s ease-out forwards;
        }
        @keyframes fade-in {
          0% { opacity: 0; }
          100% { opacity: 1; }
        }
        .animate-fade-in {
          animation: fade-in 0.8s ease-out forwards;
        }
        @keyframes float {
          0% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
          100% { transform: translateY(0px); }
        }
        .animate-float {
          animation: float 3s ease-in-out infinite;
        }
        @keyframes scroll {
          0% { transform: translateX(0); }
          100% { transform: translateX(-100%); }
        }
        .animate-scroll {
          animation: scroll 30s linear infinite;
        }
        @keyframes gradient {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        .animate-gradient {
          background-size: 200% auto;
          animation: gradient 3s linear infinite;
        }
        .animation-delay-200 {
          animation-delay: 0.2s;
          opacity: 0;
        }
        .animation-delay-400 {
          animation-delay: 0.4s;
          opacity: 0;
        }
        .animation-delay-600 {
          animation-delay: 0.6s;
          opacity: 0;
        }
      `}</style>
    </div>
  );
};

export default LandingPage;