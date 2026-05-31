import React from 'react';
import { Routes, Route, useNavigate, useSearchParams } from 'react-router-dom';
import { NavHeader } from './components/layout/NavHeader';
import { HeroSection } from './components/sections/HeroSection';
import { BentoGridSection } from './components/sections/landing/BentoGridSection';
import { HowItWorksSection } from './components/sections/landing/HowItWorksSection';
import { CodeScannerSection } from './components/sections/landing/CodeScannerSection';
import { SecuritySection } from './components/sections/landing/SecuritySection';
import { WorkflowSection } from './components/sections/landing/WorkflowSection';
import { DeveloperTrustSection } from './components/sections/landing/DeveloperTrustSection';
import { FinalCTASection } from './components/sections/landing/FinalCTASection';
import { Footer } from './components/sections/landing/Footer';
import { DashboardPage } from './components/dashboard/DashboardPage';
import { AuthPage } from './components/auth/AuthPage';
import { AuroraBackground } from './components/ui/aurora-background';
import { FeaturesPage } from './components/sections/landing/FeaturesPage';
import { ProtectedRoute } from './components/ProtectedRoute';
import { ForgotPasswordPage } from './components/auth/ForgotPasswordPage';
import { ResetPasswordPage } from './components/auth/ResetPasswordPage';
import { VerifyEmailPage } from './components/auth/VerifyEmailPage';
import { OAuthCallbackPage } from './components/auth/OAuthCallbackPage';

const AuthRoute: React.FC<{ onAuthSuccess: () => void; onBackToLanding: () => void }> = ({
  onAuthSuccess,
  onBackToLanding,
}) => {
  const [searchParams] = useSearchParams();
  const oauthError = searchParams.get("error") === "oauth_failed"
    ? "OAuth login failed. Please try again."
    : undefined;

  return (
    <AuthPage
      onAuthSuccess={onAuthSuccess}
      onBackToLanding={onBackToLanding}
      oauthError={oauthError}
    />
  );
};

export const App: React.FC = () => {
  const navigate = useNavigate();

  return (
    <Routes>
      <Route path="/" element={
        <AuroraBackground className="min-h-screen h-auto !bg-background text-white font-sans overflow-x-hidden flex flex-col relative select-none w-full justify-start py-0">
          <NavHeader onStartReview={() => navigate('/auth')} />
          <HeroSection onStartReview={() => navigate('/auth')} />
          <BentoGridSection />
          <HowItWorksSection />
          <CodeScannerSection />
          <SecuritySection />
          <WorkflowSection />
          <DeveloperTrustSection />
          <FinalCTASection onStartReview={() => navigate('/auth')} />
          <Footer />
        </AuroraBackground>
      } />

      <Route path="/features" element={
        <FeaturesPage
          onStartReview={() => navigate('/auth')}
          onNavigate={(r) => navigate(r === 'landing' ? '/' : `/${r}`)}
        />
      } />

      <Route path="/auth" element={
        <AuthRoute
          onAuthSuccess={() => navigate('/dashboard')}
          onBackToLanding={() => navigate('/')}
        />
      } />

      <Route path="/forgot-password" element={<ForgotPasswordPage />} />
      <Route path="/reset-password" element={<ResetPasswordPage />} />
      <Route path="/verify-email" element={<VerifyEmailPage />} />

      <Route path="/auth/callback" element={<OAuthCallbackPage />} />
      <Route path="/oauth-callback" element={<OAuthCallbackPage />} />

      <Route path="/dashboard" element={
        <ProtectedRoute>
          <DashboardPage onExit={() => navigate('/')} />
        </ProtectedRoute>
      } />

      <Route path="/new-review" element={
        <ProtectedRoute>
          <DashboardPage onExit={() => navigate('/')} />
        </ProtectedRoute>
      } />

      <Route path="/reviews/:id" element={
        <ProtectedRoute>
          <DashboardPage onExit={() => navigate('/')} />
        </ProtectedRoute>
      } />

      <Route path="/issues" element={
        <ProtectedRoute>
          <DashboardPage onExit={() => navigate('/')} />
        </ProtectedRoute>
      } />

      <Route path="/history" element={
        <ProtectedRoute>
          <DashboardPage onExit={() => navigate('/')} />
        </ProtectedRoute>
      } />

      <Route path="/settings" element={
        <ProtectedRoute>
          <DashboardPage onExit={() => navigate('/')} />
        </ProtectedRoute>
      } />

      <Route path="/sessions" element={
        <ProtectedRoute>
          <DashboardPage onExit={() => navigate('/')} />
        </ProtectedRoute>
      } />
    </Routes>
  );
};

export default App;
