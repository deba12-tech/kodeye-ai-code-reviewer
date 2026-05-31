import React, { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Loader2, CheckCircle2, ShieldAlert } from "lucide-react";
import { Logo } from "../ui/Logo";
import { GridBackground } from "../ui/grid-background";
import { useAuth } from "../../context/AuthContext";

/**
 * OAuthCallbackPage
 *
 * Handles the OAuth redirect from Google and GitHub.
 * The backend redirects here after verifying with the provider:
 *
 *   http://localhost:5173/auth/callback?access_token=<jwt>&refresh_token=<jwt>
 *
 * Supported query params:
 *   - access_token (primary)   OR  token (fallback)
 *   - refresh_token
 *   - error  (backend-side OAuth failure message)
 *
 * On success, stores tokens, calls /auth/me, sets AuthContext user, and opens /dashboard.
 * On failure, cleans up and redirects to /auth?error=oauth_failed.
 */
export const OAuthCallbackPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { handleOAuthCallback } = useAuth();

  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [displayError, setDisplayError] = useState("");

  useEffect(() => {
    const run = async () => {
      const backendError = searchParams.get("error");
      if (backendError) {
        setDisplayError("OAuth login failed. Please try again.");
        setStatus("error");
        return;
      }

      const hasAccessToken =
        searchParams.get("access_token") || searchParams.get("token");
      const hasRefreshToken = searchParams.get("refresh_token");

      if (!hasAccessToken || !hasRefreshToken) {
        setDisplayError("OAuth login failed. Please try again.");
        setStatus("error");
        return;
      }

      try {
        await handleOAuthCallback(searchParams);
        setStatus("success");
        setTimeout(() => navigate("/dashboard", { replace: true }), 900);
      } catch {
        setDisplayError("OAuth login failed. Please try again.");
        setStatus("error");
      }
    };

    run();
  }, []);

  const handleReturnToLogin = () => {
    navigate("/auth?error=oauth_failed", { replace: true });
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
              <h2 className="text-[10px] font-mono font-bold text-text-primary uppercase tracking-widest">
                Connecting your Kodeye account...
              </h2>
              <p className="text-[11px] text-text-secondary leading-relaxed font-semibold">
                Validating OAuth credentials and loading your workspace.
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
              <h2 className="text-base font-bold text-white tracking-tight">
                Account Connected
              </h2>
              <p className="text-xs text-text-secondary leading-relaxed font-semibold">
                Identity verified. Redirecting to your workspace...
              </p>
            </div>
          </div>
        )}

        {status === "error" && (
          <div className="space-y-6 text-center">
            <div className="w-12 h-12 rounded-full bg-critical/10 border border-critical/20 flex items-center justify-center text-critical mx-auto shadow-[0_0_15px_rgba(255,82,82,0.15)]">
              <ShieldAlert className="w-6 h-6" />
            </div>
            <div className="space-y-2">
              <h2 className="text-base font-bold text-white tracking-tight">
                OAuth Login Failed
              </h2>
              <p className="text-xs text-text-secondary leading-relaxed font-semibold">
                {displayError}
              </p>
            </div>
            <button
              onClick={handleReturnToLogin}
              className="w-full py-2.5 px-4 rounded-xl bg-primary text-black font-extrabold text-xs font-mono uppercase tracking-wider hover:opacity-90 active:scale-[0.99] transition-all duration-300 cursor-pointer"
            >
              Return to Login
            </button>
          </div>
        )}
      </div>
    </GridBackground>
  );
};

export default OAuthCallbackPage;
