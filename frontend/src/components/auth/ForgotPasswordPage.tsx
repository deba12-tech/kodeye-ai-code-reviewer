import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { ArrowLeft, Send, CheckCircle2, ShieldAlert } from "lucide-react";
import { Logo } from "../ui/Logo";
import { GridBackground } from "../ui/grid-background";
import { authService } from "../../services/authService";

export const ForgotPasswordPage: React.FC = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [isSent, setIsSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    setError("");
    setIsLoading(true);
    try {
      await authService.forgotPassword(email);
      setIsSent(true);
    } catch (err: any) {
      setError(err.response?.data?.detail || "An error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <GridBackground className="h-screen w-screen flex items-center justify-center bg-background text-white select-none p-4 overflow-hidden">
      <div className="absolute top-6 left-6 z-30">
        <button
          onClick={() => navigate("/auth")}
          className="px-3.5 py-1.5 rounded-xl border border-surface-border bg-surface/40 backdrop-blur-md text-text-secondary hover:text-text-primary hover:border-primary/20 transition-all duration-300 text-xs font-semibold font-mono uppercase tracking-wide cursor-pointer flex items-center gap-1.5"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Back to Login
        </button>
      </div>

      <div className="w-full max-w-[420px] bg-[#0A0A0B]/85 backdrop-blur-2xl rounded-2xl border border-border p-8 shadow-2xl relative overflow-hidden text-left z-10">
        <div className="flex justify-center mb-8">
          <Logo showText={true} />
        </div>

        {isSent ? (
          <div className="space-y-6 text-center">
            <div className="w-12 h-12 rounded-full bg-success/10 border border-success/20 flex items-center justify-center text-success mx-auto shadow-[0_0_15px_rgba(0,230,118,0.15)]">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <div className="space-y-2">
              <h2 className="text-base font-bold text-white tracking-tight">Recovery Dispatch Set</h2>
              <p className="text-xs text-text-secondary leading-relaxed font-semibold">
                If the email <span className="text-primary font-mono">{email}</span> exists in our directory, a secure recovery key link has been dispatched to it.
              </p>
            </div>
            <p className="text-[10px] text-text-muted leading-relaxed font-mono">
              [DEBUG LOGS]: If running locally, check the backend console standard output for the reset URL.
            </p>
            <Button
              onClick={() => navigate("/auth")}
              className="w-full h-10 text-xs font-bold font-mono uppercase tracking-wider bg-primary text-black hover:opacity-90 active:scale-[0.99] transition-all duration-300 cursor-pointer"
            >
              Return to Login
            </Button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2 text-center mb-6">
              <h1 className="text-xl font-bold tracking-tight text-white">Recover Credentials</h1>
              <p className="text-xs text-text-secondary font-semibold">
                Enter your registered developer email address to dispatch a password recovery key.
              </p>
            </div>

            {error && (
              <div className="p-3 text-xs text-critical bg-critical/10 border border-critical/20 rounded-xl flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 text-critical shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <div className="space-y-1.5">
              <Label htmlFor="email" className="text-xs font-semibold text-text-primary">Developer Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="dev@kodeye.io"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="h-11 bg-surface border-surface-border text-xs focus:border-primary placeholder-text-muted"
              />
            </div>

            <Button
              type="submit"
              disabled={isLoading || !email}
              className="w-full h-11 text-xs font-bold font-mono uppercase tracking-wider bg-primary text-black hover:opacity-90 active:scale-[0.99] transition-all duration-300 cursor-pointer flex items-center justify-center gap-2"
            >
              {isLoading ? (
                "Dispatching Key..."
              ) : (
                <>
                  <Send className="w-3.5 h-3.5" />
                  Dispatch Recovery Key
                </>
              )}
            </Button>
          </form>
        )}
      </div>
    </GridBackground>
  );
};

export default ForgotPasswordPage;
