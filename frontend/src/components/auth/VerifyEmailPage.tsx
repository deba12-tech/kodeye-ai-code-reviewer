import React, { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "../ui/button";
import { Loader2, CheckCircle2, ShieldAlert, Mail } from "lucide-react";
import { Logo } from "../ui/Logo";
import { GridBackground } from "../ui/grid-background";
import { authService } from "../../services/authService";

export const VerifyEmailPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token") || "";

  const [status, setStatus] = useState<"loading" | "success" | "error" | "resend_view">(
    token ? "loading" : "resend_view"
  );
  const [errorMsg, setErrorMsg] = useState("");
  const [resendEmail, setResendEmail] = useState("");
  const [isResending, setIsResending] = useState(false);
  const [resendSuccess, setResendSuccess] = useState(false);

  useEffect(() => {
    if (!token) return;

    const performVerification = async () => {
      try {
        await authService.confirmEmailVerification(token);
        setStatus("success");
      } catch (err: any) {
        setErrorMsg(err.response?.data?.detail || "The verification token is invalid or has expired.");
        setStatus("error");
      }
    };

    performVerification();
  }, [token]);

  const handleResend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resendEmail.trim()) return;
    setIsResending(true);
    setErrorMsg("");
    try {
      await authService.requestEmailVerification(resendEmail);
      setResendSuccess(true);
    } catch (err: any) {
      setErrorMsg(err.response?.data?.detail || "Resend failed. Account may not exist.");
    } finally {
      setIsResending(false);
    }
  };

  return (
    <GridBackground className="h-screen w-screen flex items-center justify-center bg-background text-white select-none p-4 overflow-hidden">
      <div className="w-full max-w-[420px] bg-[#0A0A0B]/85 backdrop-blur-2xl rounded-2xl border border-border p-8 shadow-2xl relative overflow-hidden text-left z-10">
        <div className="flex justify-center mb-8">
          <Logo showText={true} />
        </div>

        {status === "loading" && (
          <div className="space-y-6 text-center py-6">
            <Loader2 className="w-10 h-10 text-primary animate-spin mx-auto shadow-[0_0_15px_rgba(0,229,255,0.2)]" />
            <div className="space-y-2">
              <h2 className="text-base font-bold text-white tracking-tight font-mono uppercase tracking-widest text-xs">Authenticating Signature...</h2>
              <p className="text-[11px] text-text-secondary leading-relaxed font-semibold">
                We are validating your email confirmation key on the secure cryptographic ledger.
              </p>
            </div>
          </div>
        )}

        {status === "success" && (
          <div className="space-y-6 text-center">
            <div className="w-12 h-12 rounded-full bg-success/10 border border-success/20 flex items-center justify-center text-success mx-auto shadow-[0_0_15px_rgba(0,230,118,0.15)]">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <div className="space-y-2">
              <h2 className="text-base font-bold text-white tracking-tight">Identity Verified</h2>
              <p className="text-xs text-text-secondary leading-relaxed font-semibold">
                Congratulations! Your developer email is verified. Full review dashboard and scans coverage are now unlocked.
              </p>
            </div>
            <Button
              onClick={() => navigate("/dashboard")}
              className="w-full h-10 text-xs font-bold font-mono uppercase tracking-wider bg-primary text-black hover:opacity-90 active:scale-[0.99] transition-all duration-300 cursor-pointer"
            >
              Enter Dashboard
            </Button>
          </div>
        )}

        {status === "error" && (
          <div className="space-y-6 text-center">
            <div className="w-12 h-12 rounded-full bg-critical/10 border border-critical/20 flex items-center justify-center text-critical mx-auto shadow-[0_0_15px_rgba(255,82,82,0.15)]">
              <ShieldAlert className="w-6 h-6" />
            </div>
            <div className="space-y-2">
              <h2 className="text-base font-bold text-white tracking-tight">Verification Failed</h2>
              <p className="text-xs text-text-secondary leading-relaxed font-semibold">
                {errorMsg}
              </p>
            </div>
            <div className="flex flex-col gap-2 pt-2">
              <Button
                onClick={() => setStatus("resend_view")}
                className="w-full h-10 text-xs font-bold font-mono uppercase tracking-wider bg-primary text-black hover:opacity-90 active:scale-[0.99] transition-all duration-300 cursor-pointer"
              >
                Request New Token
              </Button>
              <button
                onClick={() => navigate("/auth")}
                className="text-[10px] text-text-muted hover:text-white transition-colors uppercase font-mono tracking-widest pt-2"
              >
                Return to Login
              </button>
            </div>
          </div>
        )}

        {status === "resend_view" && (
          <div className="space-y-5">
            <div className="space-y-2 text-center mb-4">
              <h1 className="text-xl font-bold tracking-tight text-white">Email Verification</h1>
              <p className="text-xs text-text-secondary font-semibold">
                Please verify your developer email address to unlock security scans.
              </p>
            </div>

            {resendSuccess ? (
              <div className="space-y-4 text-center">
                <div className="p-3 text-xs text-success bg-success/10 border border-success/20 rounded-xl flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-success shrink-0" />
                  <span>Activation token dispatched successfully!</span>
                </div>
                <p className="text-[11px] text-text-secondary leading-relaxed">
                  Check your inbox for a new link. If testing locally, inspect the backend terminal outputs.
                </p>
                <Button
                  onClick={() => navigate("/auth")}
                  className="w-full h-10 text-xs font-bold font-mono uppercase tracking-wider bg-surface border border-surface-border text-white hover:bg-surface-card hover:border-primary/20 transition-all duration-300 cursor-pointer"
                >
                  Return to Sign In
                </Button>
              </div>
            ) : (
              <form onSubmit={handleResend} className="space-y-4">
                {errorMsg && (
                  <div className="p-3 text-xs text-critical bg-critical/10 border border-critical/20 rounded-xl flex items-center gap-2">
                    <ShieldAlert className="w-4 h-4 text-critical shrink-0" />
                    <span>{errorMsg}</span>
                  </div>
                )}
                
                <div className="space-y-1.5">
                  <input
                    type="email"
                    placeholder="Enter email to resend link"
                    value={resendEmail}
                    onChange={(e) => setResendEmail(e.target.value)}
                    required
                    className="w-full h-11 bg-surface border border-surface-border rounded-xl px-4 text-xs text-white focus:border-primary placeholder-text-muted focus:outline-none transition-all"
                  />
                </div>

                <Button
                  type="submit"
                  disabled={isResending || !resendEmail}
                  className="w-full h-11 text-xs font-bold font-mono uppercase tracking-wider bg-primary text-black hover:opacity-90 active:scale-[0.99] transition-all duration-300 cursor-pointer flex items-center justify-center gap-2"
                >
                  {isResending ? (
                    "Dispatching..."
                  ) : (
                    <>
                      <Mail className="w-3.5 h-3.5" />
                      Dispatch Verification Link
                    </>
                  )}
                </Button>

                <button
                  type="button"
                  onClick={() => navigate("/auth")}
                  className="w-full text-center text-[10px] text-text-muted hover:text-white transition-colors uppercase font-mono tracking-widest mt-2 bg-transparent border-0 cursor-pointer"
                >
                  Return to Login
                </button>
              </form>
            )}
          </div>
        )}
      </div>
    </GridBackground>
  );
};

export default VerifyEmailPage;
