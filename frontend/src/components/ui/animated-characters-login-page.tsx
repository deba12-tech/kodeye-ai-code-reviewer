import React, { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Eye, EyeOff, Sparkles, ArrowLeft, ShieldAlert, Check } from "lucide-react";
import { Logo } from "./Logo";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { authService } from "../../services/authService";

const GoogleIcon: React.FC = () => (
  <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24" fill="currentColor">
    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05"/>
    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" fill="#EA4335"/>
  </svg>
);

const GithubIcon: React.FC<{ className?: string }> = ({ className = "w-4 h-4 mr-2" }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12"/>
  </svg>
);

interface PupilProps {
  size?: number;
  maxDistance?: number;
  pupilColor?: string;
  forceLookX?: number;
  forceLookY?: number;
}

const Pupil = ({ 
  size = 12, 
  maxDistance = 5,
  pupilColor = "black",
  forceLookX,
  forceLookY
}: PupilProps) => {
  const [mouseX, setMouseX] = useState<number>(0);
  const [mouseY, setMouseY] = useState<number>(0);
  const pupilRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMouseX(e.clientX);
      setMouseY(e.clientY);
    };

    window.addEventListener("mousemove", handleMouseMove);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
    };
  }, []);

  const calculatePupilPosition = () => {
    if (!pupilRef.current) return { x: 0, y: 0 };

    if (forceLookX !== undefined && forceLookY !== undefined) {
      return { x: forceLookX, y: forceLookY };
    }

    const pupil = pupilRef.current.getBoundingClientRect();
    const pupilCenterX = pupil.left + pupil.width / 2;
    const pupilCenterY = pupil.top + pupil.height / 2;

    const deltaX = mouseX - pupilCenterX;
    const deltaY = mouseY - pupilCenterY;
    const distance = Math.min(Math.sqrt(deltaX ** 2 + deltaY ** 2), maxDistance);

    const angle = Math.atan2(deltaY, deltaX);
    const x = Math.cos(angle) * distance;
    const y = Math.sin(angle) * distance;

    return { x, y };
  };

  const pupilPosition = calculatePupilPosition();

  return (
    <div
      ref={pupilRef}
      className="rounded-full"
      style={{
        width: `${size}px`,
        height: `${size}px`,
        backgroundColor: pupilColor,
        transform: `translate(${pupilPosition.x}px, ${pupilPosition.y}px)`,
        transition: 'transform 0.1s ease-out',
      }}
    />
  );
};

interface EyeBallProps {
  size?: number;
  pupilSize?: number;
  maxDistance?: number;
  eyeColor?: string;
  pupilColor?: string;
  isBlinking?: boolean;
  forceLookX?: number;
  forceLookY?: number;
}

const EyeBall = ({ 
  size = 48, 
  pupilSize = 16, 
  maxDistance = 10,
  eyeColor = "white",
  pupilColor = "black",
  isBlinking = false,
  forceLookX,
  forceLookY
}: EyeBallProps) => {
  const [mouseX, setMouseX] = useState<number>(0);
  const [mouseY, setMouseY] = useState<number>(0);
  const eyeRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMouseX(e.clientX);
      setMouseY(e.clientY);
    };

    window.addEventListener("mousemove", handleMouseMove);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
    };
  }, []);

  const calculatePupilPosition = () => {
    if (!eyeRef.current) return { x: 0, y: 0 };

    if (forceLookX !== undefined && forceLookY !== undefined) {
      return { x: forceLookX, y: forceLookY };
    }

    const eye = eyeRef.current.getBoundingClientRect();
    const eyeCenterX = eye.left + eye.width / 2;
    const eyeCenterY = eye.top + eye.height / 2;

    const deltaX = mouseX - eyeCenterX;
    const deltaY = mouseY - eyeCenterY;
    const distance = Math.min(Math.sqrt(deltaX ** 2 + deltaY ** 2), maxDistance);

    const angle = Math.atan2(deltaY, deltaX);
    const x = Math.cos(angle) * distance;
    const y = Math.sin(angle) * distance;

    return { x, y };
  };

  const pupilPosition = calculatePupilPosition();

  return (
    <div
      ref={eyeRef}
      className="rounded-full flex items-center justify-center transition-all duration-150"
      style={{
        width: `${size}px`,
        height: isBlinking ? '2px' : `${size}px`,
        backgroundColor: eyeColor,
        overflow: 'hidden',
      }}
    >
      {!isBlinking && (
        <div
          className="rounded-full"
          style={{
            width: `${pupilSize}px`,
            height: `${pupilSize}px`,
            backgroundColor: pupilColor,
            transform: `translate(${pupilPosition.x}px, ${pupilPosition.y}px)`,
            transition: 'transform 0.1s ease-out',
          }}
        />
      )}
    </div>
  );
};

interface LoginPageProps {
  onAuthSuccess: () => void;
  onBackToLanding: () => void;
  onToggleSignup: () => void;
  mode?: "login" | "signup";
  oauthError?: string;
}

export const LoginPage: React.FC<LoginPageProps> = ({
  onAuthSuccess,
  onBackToLanding,
  onToggleSignup,
  mode = "login",
  oauthError,
}) => {
  const { login, register } = useAuth();
  const navigate = useNavigate();

  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(oauthError || "");
  const [isLoading, setIsLoading] = useState(false);


  const [fullName, setFullName] = useState("");
  const [signupEmail, setSignupEmail] = useState("");
  const [signupPassword, setSignupPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const activePassword = mode === "login" ? password : signupPassword;

  const [passwordStrength, setPasswordStrength] = useState({
    score: 0,
    label: "Too Short",
    color: "bg-critical",
    textClass: "text-critical"
  });

  useEffect(() => {
    if (!signupPassword) {
      setPasswordStrength({ score: 0, label: "Too Short", color: "bg-surface-border", textClass: "text-text-muted" });
      return;
    }

    let score = 0;
    if (signupPassword.length >= 8) score += 1;
    if (/[A-Z]/.test(signupPassword)) score += 1;
    if (/[0-9]/.test(signupPassword)) score += 1;
    if (/[^A-Za-z0-9]/.test(signupPassword)) score += 1;

    let label = "Weak";
    let color = "bg-critical";
    let textClass = "text-critical font-bold";

    if (score === 2) {
      label = "Medium";
      color = "bg-medium";
      textClass = "text-medium font-bold";
    } else if (score === 3) {
      label = "Good";
      color = "bg-low";
      textClass = "text-low font-bold";
    } else if (score === 4) {
      label = "Strong";
      color = "bg-success";
      textClass = "text-success font-bold";
    }

    setPasswordStrength({ score, label, color, textClass });
  }, [signupPassword]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const [mouseX, setMouseX] = useState<number>(0);
  const [mouseY, setMouseY] = useState<number>(0);
  const [isPurpleBlinking, setIsPurpleBlinking] = useState(false);
  const [isBlackBlinking, setIsBlackBlinking] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [isLookingAtEachOther, setIsLookingAtEachOther] = useState(false);
  const [isPurplePeeking, setIsPurplePeeking] = useState(false);
  
  const purpleRef = useRef<HTMLDivElement>(null);
  const blackRef = useRef<HTMLDivElement>(null);
  const yellowRef = useRef<HTMLDivElement>(null);
  const orangeRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMouseX(e.clientX);
      setMouseY(e.clientY);
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  useEffect(() => {
    const getRandomBlinkInterval = () => Math.random() * 4000 + 3000;

    const scheduleBlink = () => {
      const blinkTimeout = setTimeout(() => {
        setIsPurpleBlinking(true);
        setTimeout(() => {
          setIsPurpleBlinking(false);
          scheduleBlink();
        }, 150);
      }, getRandomBlinkInterval());

      return blinkTimeout;
    };

    const timeout = scheduleBlink();
    return () => clearTimeout(timeout);
  }, []);

  useEffect(() => {
    const getRandomBlinkInterval = () => Math.random() * 4000 + 3000;

    const scheduleBlink = () => {
      const blinkTimeout = setTimeout(() => {
        setIsBlackBlinking(true);
        setTimeout(() => {
          setIsBlackBlinking(false);
          scheduleBlink();
        }, 150);
      }, getRandomBlinkInterval());

      return blinkTimeout;
    };

    const timeout = scheduleBlink();
    return () => clearTimeout(timeout);
  }, []);

  useEffect(() => {
    if (isTyping) {
      setIsLookingAtEachOther(true);
      const timer = setTimeout(() => {
        setIsLookingAtEachOther(false);
      }, 800);
      return () => clearTimeout(timer);
    } else {
      setIsLookingAtEachOther(false);
    }
  }, [isTyping]);

  useEffect(() => {
    if (activePassword.length > 0 && showPassword) {
      const schedulePeek = () => {
        const peekInterval = setTimeout(() => {
          setIsPurplePeeking(true);
          setTimeout(() => {
            setIsPurplePeeking(false);
          }, 800);
        }, Math.random() * 3000 + 2000);
        return peekInterval;
      };

      const firstPeek = schedulePeek();
      return () => clearTimeout(firstPeek);
    } else {
      setIsPurplePeeking(false);
    }
  }, [activePassword, showPassword, isPurplePeeking]);

  const calculatePosition = (ref: React.RefObject<HTMLDivElement | null>) => {
    if (!ref.current) return { faceX: 0, faceY: 0, bodySkew: 0 };

    const rect = ref.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 3;

    const deltaX = mouseX - centerX;
    const deltaY = mouseY - centerY;

    const faceX = Math.max(-15, Math.min(15, deltaX / 20));
    const faceY = Math.max(-10, Math.min(10, deltaY / 30));

    const bodySkew = Math.max(-6, Math.min(6, -deltaX / 120));

    return { faceX, faceY, bodySkew };
  };

  const purplePos = calculatePosition(purpleRef);
  const blackPos = calculatePosition(blackRef);
  const yellowPos = calculatePosition(yellowRef);
  const orangePos = calculatePosition(orangeRef);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      await login(email, password);
      showToast("Access authorized! Initializing telemetry...");
      setTimeout(() => {
        onAuthSuccess();
      }, 800);
    } catch (err: any) {
      setError(err.response?.data?.detail || "Invalid email or password. Please try again.");
      console.error("Login failed", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignupSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim() || !signupEmail.trim() || !signupPassword || !confirmPassword) {
      setError("Please fill in all configuration parameters.");
      return;
    }
    if (signupPassword !== confirmPassword) {
      setError("Passwords mismatch. Signature comparison failed.");
      return;
    }
    if (passwordStrength.score < 2) {
      setError("Password strength is too vulnerable to attacks.");
      return;
    }
    
    setError("");
    setIsLoading(true);
    
    try {
      await register(fullName, signupEmail, signupPassword);
      showToast("Developer account registered successfully!");
      setTimeout(() => {
        onAuthSuccess();
      }, 1000);
    } catch (err: any) {
      setError(err.response?.data?.detail || "Registration failed. Try again.");
      console.error("Registration failed", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDemoBypass = () => {
    if (import.meta.env.VITE_DEMO_MODE !== "true") {
      return;
    }
    setIsLoading(true);
    localStorage.setItem("kodeye_access_token", "mock_bypass_token_123");
    localStorage.setItem("kodeye_refresh_token", "mock_bypass_refresh_token_123");
    showToast("Sandbox bypass loaded!");
    setTimeout(() => {
      setIsLoading(false);
      window.location.reload(); // Reload triggers AuthContext refresh
    }, 600);
  };


  return (
    <div className="min-h-screen grid lg:grid-cols-2 bg-background select-none relative overflow-hidden">
      <AnimatePresence>
        {toastMessage && (
          <motion.div 
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            className="fixed top-6 right-6 z-50 bg-surface border border-surface-border text-primary px-4 py-2.5 rounded-xl shadow-2xl flex items-center gap-2 font-mono text-[10px] uppercase font-bold"
          >
            <Check className="w-3.5 h-3.5" />
            {toastMessage}
          </motion.div>
        )}
      </AnimatePresence>

      <div className="relative hidden lg:flex flex-col justify-between bg-gradient-to-br from-primary/30 via-primary/10 to-[#070708] border-r border-surface-border p-12 text-text-primary overflow-hidden">
        
        <div className="absolute top-6 left-6 z-30">
          <button
            onClick={onBackToLanding}
            className="px-3.5 py-1.5 rounded-xl border border-surface-border bg-surface/40 backdrop-blur-md text-text-secondary hover:text-text-primary hover:border-primary/20 transition-all duration-300 text-xs font-semibold font-mono uppercase tracking-wide cursor-pointer flex items-center gap-1.5"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Landing
          </button>
        </div>

        <div className="relative z-20 self-end">
          <div className="flex items-center gap-2 text-lg font-semibold">
            <Logo showText={true} />
          </div>
        </div>

        <div className="relative z-20 flex items-end justify-center h-[500px]">
          <div className="relative" style={{ width: '550px', height: '400px' }}>
            <div 
              ref={purpleRef}
              className="absolute bottom-0 transition-all duration-700 ease-in-out"
              style={{
                left: '70px',
                width: '180px',
                height: (isTyping || (activePassword.length > 0 && !showPassword)) ? '440px' : '400px',
                backgroundColor: '#6C3FF5',
                borderRadius: '10px 10px 0 0',
                zIndex: 1,
                transform: (activePassword.length > 0 && showPassword)
                  ? `skewX(0deg)`
                  : (isTyping || (activePassword.length > 0 && !showPassword))
                    ? `skewX(${(purplePos.bodySkew || 0) - 12}deg) translateX(40px)` 
                    : `skewX(${purplePos.bodySkew || 0}deg)`,
                transformOrigin: 'bottom center',
              }}
            >
              <div 
                className="absolute flex gap-8 transition-all duration-700 ease-in-out"
                style={{
                  left: (activePassword.length > 0 && showPassword) ? `${20}px` : isLookingAtEachOther ? `${55}px` : `${45 + purplePos.faceX}px`,
                  top: (activePassword.length > 0 && showPassword) ? `${35}px` : isLookingAtEachOther ? `${65}px` : `${40 + purplePos.faceY}px`,
                }}
              >
                <EyeBall 
                  size={18} 
                  pupilSize={7} 
                  maxDistance={5} 
                  eyeColor="white" 
                  pupilColor="#2D2D2D" 
                  isBlinking={isPurpleBlinking}
                  forceLookX={(activePassword.length > 0 && showPassword) ? (isPurplePeeking ? 4 : -4) : isLookingAtEachOther ? 3 : undefined}
                  forceLookY={(activePassword.length > 0 && showPassword) ? (isPurplePeeking ? 5 : -4) : isLookingAtEachOther ? 4 : undefined}
                />
                <EyeBall 
                  size={18} 
                  pupilSize={7} 
                  maxDistance={5} 
                  eyeColor="white" 
                  pupilColor="#2D2D2D" 
                  isBlinking={isPurpleBlinking}
                  forceLookX={(activePassword.length > 0 && showPassword) ? (isPurplePeeking ? 4 : -4) : isLookingAtEachOther ? 3 : undefined}
                  forceLookY={(activePassword.length > 0 && showPassword) ? (isPurplePeeking ? 5 : -4) : isLookingAtEachOther ? 4 : undefined}
                />
              </div>
            </div>

            <div 
              ref={blackRef}
              className="absolute bottom-0 transition-all duration-700 ease-in-out"
              style={{
                left: '240px',
                width: '120px',
                height: '310px',
                backgroundColor: '#2D2D2D',
                borderRadius: '8px 8px 0 0',
                zIndex: 2,
                transform: (activePassword.length > 0 && showPassword)
                  ? `skewX(0deg)`
                  : isLookingAtEachOther
                    ? `skewX(${(blackPos.bodySkew || 0) * 1.5 + 10}deg) translateX(20px)`
                    : (isTyping || (activePassword.length > 0 && !showPassword))
                      ? `skewX(${(blackPos.bodySkew || 0) * 1.5}deg)` 
                      : `skewX(${blackPos.bodySkew || 0}deg)`,
                transformOrigin: 'bottom center',
              }}
            >
              <div 
                className="absolute flex gap-6 transition-all duration-700 ease-in-out"
                style={{
                  left: (activePassword.length > 0 && showPassword) ? `${10}px` : isLookingAtEachOther ? `${32}px` : `${26 + blackPos.faceX}px`,
                  top: (activePassword.length > 0 && showPassword) ? `${28}px` : isLookingAtEachOther ? `${12}px` : `${32 + blackPos.faceY}px`,
                }}
              >
                <EyeBall 
                  size={16} 
                  pupilSize={6} 
                  maxDistance={4} 
                  eyeColor="white" 
                  pupilColor="#2D2D2D" 
                  isBlinking={isBlackBlinking}
                  forceLookX={(activePassword.length > 0 && showPassword) ? -4 : isLookingAtEachOther ? 0 : undefined}
                  forceLookY={(activePassword.length > 0 && showPassword) ? -4 : isLookingAtEachOther ? -4 : undefined}
                />
                <EyeBall 
                  size={16} 
                  pupilSize={6} 
                  maxDistance={4} 
                  eyeColor="white" 
                  pupilColor="#2D2D2D" 
                  isBlinking={isBlackBlinking}
                  forceLookX={(activePassword.length > 0 && showPassword) ? -4 : isLookingAtEachOther ? 0 : undefined}
                  forceLookY={(activePassword.length > 0 && showPassword) ? -4 : isLookingAtEachOther ? -4 : undefined}
                />
              </div>
            </div>

            <div 
              ref={orangeRef}
              className="absolute bottom-0 transition-all duration-700 ease-in-out"
              style={{
                left: '0px',
                width: '240px',
                height: '200px',
                zIndex: 3,
                backgroundColor: '#FF9B6B',
                borderRadius: '120px 120px 0 0',
                transform: (activePassword.length > 0 && showPassword) ? `skewX(0deg)` : `skewX(${orangePos.bodySkew || 0}deg)`,
                transformOrigin: 'bottom center',
              }}
            >
              <div 
                className="absolute flex gap-8 transition-all duration-200 ease-out"
                style={{
                  left: (activePassword.length > 0 && showPassword) ? `${50}px` : `${82 + (orangePos.faceX || 0)}px`,
                  top: (activePassword.length > 0 && showPassword) ? `${85}px` : `${90 + (orangePos.faceY || 0)}px`,
                }}
              >
                <Pupil size={12} maxDistance={5} pupilColor="#2D2D2D" forceLookX={(activePassword.length > 0 && showPassword) ? -5 : undefined} forceLookY={(activePassword.length > 0 && showPassword) ? -4 : undefined} />
                <Pupil size={12} maxDistance={5} pupilColor="#2D2D2D" forceLookX={(activePassword.length > 0 && showPassword) ? -5 : undefined} forceLookY={(activePassword.length > 0 && showPassword) ? -4 : undefined} />
              </div>
            </div>

            <div 
              ref={yellowRef}
              className="absolute bottom-0 transition-all duration-700 ease-in-out"
              style={{
                left: '310px',
                width: '140px',
                height: '230px',
                backgroundColor: '#E8D754',
                borderRadius: '70px 70px 0 0',
                zIndex: 4,
                transform: (activePassword.length > 0 && showPassword) ? `skewX(0deg)` : `skewX(${yellowPos.bodySkew || 0}deg)`,
                transformOrigin: 'bottom center',
              }}
            >
              <div 
                className="absolute flex gap-6 transition-all duration-200 ease-out"
                style={{
                  left: (activePassword.length > 0 && showPassword) ? `${20}px` : `${52 + (yellowPos.faceX || 0)}px`,
                  top: (activePassword.length > 0 && showPassword) ? `${35}px` : `${40 + (yellowPos.faceY || 0)}px`,
                }}
              >
                <Pupil size={12} maxDistance={5} pupilColor="#2D2D2D" forceLookX={(activePassword.length > 0 && showPassword) ? -5 : undefined} forceLookY={(activePassword.length > 0 && showPassword) ? -4 : undefined} />
                <Pupil size={12} maxDistance={5} pupilColor="#2D2D2D" forceLookX={(activePassword.length > 0 && showPassword) ? -5 : undefined} forceLookY={(activePassword.length > 0 && showPassword) ? -4 : undefined} />
              </div>
              <div 
                className="absolute w-20 h-[4px] bg-[#2D2D2D] rounded-full transition-all duration-200 ease-out"
                style={{
                  left: (activePassword.length > 0 && showPassword) ? `${10}px` : `${40 + (yellowPos.faceX || 0)}px`,
                  top: (activePassword.length > 0 && showPassword) ? `${88}px` : `${88 + (yellowPos.faceY || 0)}px`,
                }}
              />
            </div>
          </div>
        </div>

        <div className="relative z-20 flex items-center gap-8 text-xs text-text-muted">
          <span className="hover:text-text-secondary cursor-pointer transition-colors">Privacy Policy</span>
          <span className="hover:text-text-secondary cursor-pointer transition-colors">Terms of Service</span>
          <span className="hover:text-text-secondary cursor-pointer transition-colors">Contact</span>
        </div>

        <div className="absolute inset-0 bg-grid-white/[0.02] bg-[size:20px_20px]" />
        <div className="absolute top-1/4 right-1/4 size-64 bg-primary/5 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-1/4 left-1/4 size-96 bg-primary/5 rounded-full blur-3xl pointer-events-none" />
      </div>

      <div className="flex items-center justify-center p-8 bg-background border-l border-surface-border relative overflow-y-auto">
        <div className="w-full max-w-[400px] text-left py-8">
          <div className="lg:hidden flex items-center justify-center gap-2 text-lg font-semibold mb-10">
            <Logo showText={true} />
          </div>

          {mode === "login" ? (
            <>
              <div className="text-center mb-8">
                <h1 className="text-2xl font-bold tracking-tight text-text-primary mb-2">Welcome back!</h1>
                <p className="text-text-secondary text-xs">Enter your details to access your dashboard</p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5">
                {error && (
                  <div className="p-3 text-xs text-critical bg-critical/10 border border-critical/20 rounded-xl flex items-center gap-2">
                    <ShieldAlert className="w-4 h-4 text-critical shrink-0" />
                    <span>{error}</span>
                  </div>
                )}

                <div className="space-y-1.5">
                  <Label htmlFor="email" className="text-xs font-semibold text-text-primary">Email Address</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="anna@gmail.com"
                    value={email}
                    autoComplete="off"
                    onChange={(e) => setEmail(e.target.value)}
                    onFocus={() => setIsTyping(true)}
                    onBlur={() => setIsTyping(false)}
                    required
                    className="h-11 bg-surface border-surface-border text-xs focus:border-primary placeholder-text-muted"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="password" className="text-xs font-semibold text-text-primary">Password</Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      onFocus={() => setIsTyping(true)}
                      onBlur={() => setIsTyping(false)}
                      required
                      className="h-11 pr-10 bg-surface border-surface-border text-xs focus:border-primary placeholder-text-muted"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-primary transition-colors"
                    >
                      {showPassword ? (
                        <EyeOff className="size-4" />
                      ) : (
                        <Eye className="size-4" />
                      )}
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs pt-1">
                  <div className="flex items-center space-x-2">
                    <Checkbox id="remember" />
                    <Label
                      htmlFor="remember"
                      className="text-xs font-normal text-text-secondary cursor-pointer"
                    >
                      Remember for 30 days
                    </Label>
                  </div>
                  <button
                    type="button"
                    onClick={() => navigate("/forgot-password")}
                    className="text-xs text-primary hover:underline font-semibold bg-transparent border-0 cursor-pointer"
                  >
                    Forgot password?
                  </button>
                </div>

                <Button 
                  type="submit" 
                  className="w-full h-11 text-xs font-bold font-mono uppercase tracking-wider bg-primary text-black hover:opacity-90 active:scale-[0.99] transition-all duration-300"
                  size="lg" 
                  disabled={isLoading}
                >
                  {isLoading ? "Signing in..." : "Log in"}
                </Button>
              </form>

              <div className="mt-5 space-y-4">
                <div className="relative flex py-2 items-center">
                  <div className="flex-grow border-t border-surface-border"></div>
                  <span className="flex-shrink mx-4 text-[9px] font-mono text-text-muted uppercase tracking-widest">Or continue with</span>
                  <div className="flex-grow border-t border-surface-border"></div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <Button 
                    variant="outline" 
                    className="h-10 bg-surface border-surface-border text-xs hover:bg-surface-card hover:border-primary/20 text-white font-mono uppercase font-bold flex items-center justify-center cursor-pointer"
                    type="button"
                    onClick={() => authService.loginWithGoogle()}
                  >
                    <GoogleIcon />
                    Google
                  </Button>
                  <Button 
                    variant="outline" 
                    className="h-10 bg-surface border-surface-border text-xs hover:bg-surface-card hover:border-primary/20 text-white font-mono uppercase font-bold flex items-center justify-center cursor-pointer"
                    type="button"
                    onClick={() => authService.loginWithGitHub()}
                  >
                    <GithubIcon className="mr-2 size-4 text-white fill-white" />
                    GitHub
                  </Button>
                </div>

                {import.meta.env.VITE_DEMO_MODE === "true" && (
                  <Button 
                    variant="outline" 
                    className="w-full h-10 bg-surface border-surface-border text-xs hover:bg-surface-card hover:border-primary/20 text-primary hover:text-white font-mono uppercase font-bold"
                    type="button"
                    onClick={handleDemoBypass}
                  >
                    <Sparkles className="mr-2 size-4 text-primary" />
                    Demo Sandbox Access
                  </Button>
                )}
              </div>

              <div className="text-center text-xs text-text-secondary mt-8">
                Don't have an account?{" "}
                <button 
                  onClick={onToggleSignup}
                  className="text-primary font-bold hover:underline bg-transparent border-0 cursor-pointer"
                >
                  Sign Up
                </button>
              </div>
            </>
          ) : (
            <>
              <div className="text-center mb-8">
                <h1 className="text-2xl font-bold tracking-tight text-text-primary mb-2">Create Developer Key</h1>
                <p className="text-text-secondary text-xs">Join Kodeye and establish secure code reviews.</p>
              </div>

              <form onSubmit={handleSignupSubmit} className="space-y-4">
                {error && (
                  <div className="p-3 text-xs text-critical bg-critical/10 border border-critical/20 rounded-xl flex items-center gap-2">
                    <ShieldAlert className="w-4 h-4 text-critical shrink-0" />
                    <span>{error}</span>
                  </div>
                )}

                <div className="space-y-1.5">
                  <Label htmlFor="signup-fullName" className="text-xs font-semibold text-text-primary">Full Name</Label>
                  <Input
                    id="signup-fullName"
                    type="text"
                    placeholder="Dan Miller"
                    value={fullName}
                    autoComplete="off"
                    onChange={(e) => setFullName(e.target.value)}
                    onFocus={() => setIsTyping(true)}
                    onBlur={() => setIsTyping(false)}
                    required
                    className="h-11 bg-surface border-surface-border text-xs focus:border-primary placeholder-text-muted"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="signup-email" className="text-xs font-semibold text-text-primary">Email Address</Label>
                  <Input
                    id="signup-email"
                    type="email"
                    placeholder="dev@kodeye.io"
                    value={signupEmail}
                    autoComplete="off"
                    onChange={(e) => setSignupEmail(e.target.value)}
                    onFocus={() => setIsTyping(true)}
                    onBlur={() => setIsTyping(false)}
                    required
                    className="h-11 bg-surface border-surface-border text-xs focus:border-primary placeholder-text-muted"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="signup-password" className="text-xs font-semibold text-text-primary">Password</Label>
                  <div className="relative">
                    <Input
                      id="signup-password"
                      type={showPassword ? "text" : "password"}
                      placeholder="••••••••"
                      value={signupPassword}
                      onChange={(e) => setSignupPassword(e.target.value)}
                      onFocus={() => setIsTyping(true)}
                      onBlur={() => setIsTyping(false)}
                      required
                      className="h-11 pr-10 bg-surface border-surface-border text-xs focus:border-primary placeholder-text-muted"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-primary transition-colors"
                    >
                      {showPassword ? (
                        <EyeOff className="size-4" />
                      ) : (
                        <Eye className="size-4" />
                      )}
                    </button>
                  </div>

                  {signupPassword && (
                    <div className="space-y-1.5 pt-1.5 text-left">
                      <div className="flex justify-between items-center text-[8px] font-mono">
                        <span className="text-text-muted uppercase">Entropy Strength:</span>
                        <span className={passwordStrength.textClass}>{passwordStrength.label}</span>
                      </div>
                      
                      <div className="h-1 w-full bg-surface border border-surface-border rounded-full overflow-hidden flex gap-0.5">
                        {Array.from({ length: 4 }).map((_, i) => (
                          <div 
                            key={i} 
                            className={`h-full flex-1 transition-colors duration-500 ${
                              i < passwordStrength.score ? passwordStrength.color : 'bg-surface-border'
                            }`}
                          />
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="signup-confirmPassword" className="text-xs font-semibold text-text-primary">Confirm Password</Label>
                  <div className="relative">
                    <Input
                      id="signup-confirmPassword"
                      type={showConfirmPassword ? "text" : "password"}
                      placeholder="••••••••"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      onFocus={() => setIsTyping(true)}
                      onBlur={() => setIsTyping(false)}
                      required
                      className="h-11 pr-10 bg-surface border-surface-border text-xs focus:border-primary placeholder-text-muted"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-primary transition-colors"
                    >
                      {showConfirmPassword ? (
                        <EyeOff className="size-4" />
                      ) : (
                        <Eye className="size-4" />
                      )}
                    </button>
                  </div>
                </div>

                <Button 
                  type="submit" 
                  className="w-full h-11 text-xs font-bold font-mono uppercase tracking-wider bg-primary text-black hover:opacity-90 active:scale-[0.99] transition-all duration-300 mt-2"
                  size="lg" 
                  disabled={isLoading}
                >
                  {isLoading ? "Establishing Account..." : "Establish Account"}
                </Button>
              </form>

              <div className="mt-5 space-y-4">
                <div className="relative flex py-2 items-center">
                  <div className="flex-grow border-t border-surface-border"></div>
                  <span className="flex-shrink mx-4 text-[9px] font-mono text-text-muted uppercase tracking-widest">Or sign up with</span>
                  <div className="flex-grow border-t border-surface-border"></div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <Button 
                    variant="outline" 
                    className="h-10 bg-surface border-surface-border text-xs hover:bg-surface-card hover:border-primary/20 text-white font-mono uppercase font-bold flex items-center justify-center cursor-pointer"
                    type="button"
                    onClick={() => authService.loginWithGoogle()}
                  >
                    <GoogleIcon />
                    Google
                  </Button>
                  <Button 
                    variant="outline" 
                    className="h-10 bg-surface border-surface-border text-xs hover:bg-surface-card hover:border-primary/20 text-white font-mono uppercase font-bold flex items-center justify-center cursor-pointer"
                    type="button"
                    onClick={() => authService.loginWithGitHub()}
                  >
                    <GithubIcon className="mr-2 size-4 text-white fill-white" />
                    GitHub
                  </Button>
                </div>
              </div>

              <div className="text-center text-xs text-text-secondary mt-8">
                Already registered?{" "}
                <button 
                  onClick={onToggleSignup}
                  className="text-primary font-bold hover:underline bg-transparent border-0 cursor-pointer"
                >
                  Log In
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
