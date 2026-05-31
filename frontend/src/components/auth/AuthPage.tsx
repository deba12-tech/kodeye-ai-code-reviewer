import React, { useState } from 'react';
import { LoginPage } from '../ui/animated-characters-login-page';

interface AuthPageProps {
  onAuthSuccess: () => void;
  onBackToLanding: () => void;
  initialMode?: 'login' | 'signup';
  oauthError?: string;
}

export const AuthPage: React.FC<AuthPageProps> = ({
  onAuthSuccess,
  onBackToLanding,
  initialMode = 'login',
  oauthError,
}) => {
  const [mode, setMode] = useState<'login' | 'signup'>(initialMode);

  return (
    <LoginPage
      mode={mode}
      onAuthSuccess={onAuthSuccess}
      onBackToLanding={onBackToLanding}
      onToggleSignup={() => setMode(mode === 'login' ? 'signup' : 'login')}
      oauthError={oauthError}
    />
  );
};

export default AuthPage;
