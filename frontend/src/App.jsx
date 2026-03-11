import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';
import LandingPage from './components/landing/LandingPage';
import Login from './components/auth/Login';
import Signup from './components/auth/Signup';
import FamilyChoice from './components/auth/FamilyChoice';
import OnboardingWizard from './components/onboarding/OnboardingWizard';
import Dashboard from './pages/Dashboard';

// Protected Route Component - FIXED
const ProtectedRoute = ({ children, requireOnboarding = true, requireFamily = true }) => {
  const { isAuthenticated, user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/" />;
  }

  // Check family FIRST (before onboarding)
  if (requireFamily && !user.familyId) {
    console.log('ProtectedRoute: No family, redirecting to family-choice');
    return <Navigate to="/family-choice" />;
  }

  // Then check onboarding
  if (requireOnboarding && !user.onboardingCompleted) {
    console.log('ProtectedRoute: Onboarding not complete, redirecting to onboarding');
    return <Navigate to="/onboarding" />;
  }

  return children;
};

// Public Route Component - FIXED
const PublicRoute = ({ children }) => {
  const { isAuthenticated, user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (isAuthenticated) {
    // Check family FIRST
    if (!user.familyId) {
      console.log('PublicRoute: Authenticated but no family, redirecting to family-choice');
      return <Navigate to="/family-choice" />;
    }
    // Then check onboarding
    if (!user.onboardingCompleted) {
      console.log('PublicRoute: Authenticated but onboarding not complete, redirecting to onboarding');
      return <Navigate to="/onboarding" />;
    }
    console.log('PublicRoute: Fully authenticated, redirecting to dashboard');
    return <Navigate to="/dashboard" />;
  }

  return children;
};

function AppContent() {
  return (
    <Routes>
      {/* Landing Page */}
      <Route path="/" element={<LandingPage />} />
      
      {/* Auth Routes */}
      <Route path="/login" element={
        <PublicRoute>
          <Login />
        </PublicRoute>
      } />
      <Route path="/signup" element={
        <PublicRoute>
          <Signup />
        </PublicRoute>
      } />

      {/* Protected Routes */}
      <Route path="/family-choice" element={
        <ProtectedRoute requireOnboarding={false} requireFamily={false}>
          <FamilyChoice />
        </ProtectedRoute>
      } />
      
      <Route path="/onboarding" element={
        <ProtectedRoute requireOnboarding={false} requireFamily={true}>
          <OnboardingWizard />
        </ProtectedRoute>
      } />
      
      <Route path="/dashboard" element={
        <ProtectedRoute requireOnboarding={true} requireFamily={true}>
          <Dashboard />
        </ProtectedRoute>
      } />

      {/* Catch all - redirect to home */}
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
}

function App() {
  return (
    <Router>
      <AuthProvider>
        <Toaster 
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: '#363636',
              color: '#fff',
            },
          }}
        />
        <AppContent />
      </AuthProvider>
    </Router>
  );
}

export default App;