import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  User, Cpu, ShieldCheck, Lock, 
  Trash2, Check, Globe, Laptop, 
  Moon, Key, ShieldAlert, KeyRound
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { authService } from '../../services/authService';
import { userService } from '../../services/userService';
import type { UserSession } from '../../services/authService';
import { connectGitHub, disconnectGitHub, getGitHubProfile } from '../../services/githubService';

const GithubIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12"/>
  </svg>
);

interface SettingsPageProps {
  theme?: 'dark' | 'light' | 'system';
  onThemeChange?: (theme: 'dark' | 'light' | 'system') => void;
  initialSection?: 'profile' | 'appearance' | 'github' | 'ai' | 'security' | 'danger';
}

export const SettingsPage: React.FC<SettingsPageProps> = ({ 
  theme: propTheme, 
  onThemeChange,
  initialSection = 'profile'
}) => {
  const { user, logoutAll, logout } = useAuth();
  const [activeSection, setActiveSection] = useState<'profile' | 'appearance' | 'github' | 'ai' | 'security' | 'danger'>(initialSection);

  useEffect(() => {
    setActiveSection(initialSection);
  }, [initialSection]);

  const [name, setName] = useState(user?.name || "");
  const [email, setEmail] = useState(user?.email || "");
  const [bio, setBio] = useState("");
  const [profilePictureUrl, setProfilePictureUrl] = useState("");

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const profile = await userService.getProfile();
        setName(profile.name || "");
        setEmail(profile.email);
        setBio(profile.bio || "");
        setProfilePictureUrl(profile.profile_picture_url || "");
      } catch (err) {
        console.error("Failed to load profile", err);
        if (user) {
          setName(user.name);
          setEmail(user.email);
        }
      }
    };
    loadProfile();
  }, [user]);


  const [isGitHubConnected, setIsGitHubConnected] = useState(false);
  const [githubUsername, setGitHubUsername] = useState<string | null>(null);
  const [githubToken, setGitHubToken] = useState("");

  const [enableAI, setEnableAI] = useState(false);
  const [apiKey, setApiKey] = useState("");
  const [autoPR, setAutoPR] = useState(false);

  const [localTheme, setLocalTheme] = useState<'dark' | 'light' | 'system'>(() => {
    return (localStorage.getItem('kodeye-theme') as any) || 'dark';
  });

  const activeTheme = propTheme !== undefined ? propTheme : localTheme;

  const handleThemeChange = (newTheme: 'dark' | 'light' | 'system') => {
    if (onThemeChange) {
      onThemeChange(newTheme);
    } else {
      setLocalTheme(newTheme);
      localStorage.setItem('kodeye-theme', newTheme);
    }
  };

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [deletePassword, setDeletePassword] = useState("");
  const [showPass, setShowPass] = useState(false);

  const fetchConnectedAccounts = async () => {
    try {
      const [accounts, github] = await Promise.all([
        userService.getConnectedAccounts(),
        getGitHubProfile(),
      ]);
      setIsGitHubConnected(github.connected || accounts.accounts.some((a) => a.provider === "github"));
      setGitHubUsername(github.username || null);
    } catch (err) {
      console.error("Failed to fetch connected accounts", err);
    }
  };

  const [sessions, setSessions] = useState<UserSession[]>([]);
  const [isLoadingSessions, setIsLoadingSessions] = useState(false);

  const fetchSessions = async () => {
    setIsLoadingSessions(true);
    try {
      const data = await authService.getSessions();
      setSessions(data);
    } catch (err) {
      console.error("Failed to fetch sessions", err);
    } finally {
      setIsLoadingSessions(false);
    }
  };

  useEffect(() => {
    if (activeSection === 'security') {
      fetchSessions();
    }
    if (activeSection === 'github' || activeSection === 'profile') {
      fetchConnectedAccounts();
    }
  }, [activeSection]);

  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleProfileSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await userService.updateProfile({
        name,
        bio: bio || undefined,
        profile_picture_url: profilePictureUrl || undefined,
      });
      showToast("Profile updated successfully!");
    } catch (err) {
      showToast("Failed to update profile.");
    }
  };

  const handlePasswordUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentPassword || !newPassword || !confirmPassword) {
      showToast("Please fill in all password fields.");
      return;
    }
    if (newPassword !== confirmPassword) {
      showToast("New password and confirmation do not match.");
      return;
    }
    try {
      await userService.changePassword({
        current_password: currentPassword,
        new_password: newPassword,
        confirm_password: confirmPassword,
      });
      showToast("Password updated. Please sign in again.");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      await logout();
    } catch (err) {
      showToast("Failed to update password.");
    }
  };

  const handleToggleGitHub = async () => {
    if (isGitHubConnected) {
      try {
        await disconnectGitHub();
        setIsGitHubConnected(false);
        setGitHubUsername(null);
        await fetchConnectedAccounts();
        showToast("GitHub integration disconnected.");
      } catch (err) {
        showToast("Failed to disconnect GitHub.");
      }
    } else {
      authService.loginWithGitHub();
    }
  };

  const handleReconnectGitHub = async () => {
    try {
      if (isGitHubConnected) {
        await disconnectGitHub();
        setIsGitHubConnected(false);
        setGitHubUsername(null);
      }
    } catch {
    }
    authService.loginWithGitHub();
  };

  const handleConnectGitHubToken = async () => {
    if (!githubToken.trim()) {
      showToast("Paste a GitHub token first.");
      return;
    }
    try {
      const profile = await connectGitHub(githubToken.trim());
      setIsGitHubConnected(profile.connected);
      setGitHubUsername(profile.username || null);
      setGitHubToken("");
      showToast("GitHub token connected.");
    } catch (err) {
      showToast("Failed to connect GitHub token.");
    }
  };

  const handleRevokeSession = async (id: number) => {
    try {
      await authService.deleteSession(id);
      setSessions(prev => prev.filter(s => s.id !== id));
      showToast("Selected active session revoked.");
    } catch (err) {
      showToast("Failed to revoke session.");
    }
  };

  const handleLogoutAllDevices = async () => {
    if (confirm("Are you sure you want to log out of all active devices? This will terminate all active sessions including the current one.")) {
      try {
        await logoutAll();
        showToast("Logout signal dispatched. Clearing cache...");
      } catch (err) {
        showToast("Failed to terminate active sessions.");
      }
    }
  };

  const handleDeleteAccount = async () => {
    if (!confirm("WARNING: This will permanently delete your account. This action cannot be undone.")) {
      return;
    }
    try {
      await userService.deleteAccount({
        password: deletePassword || undefined,
        confirm_delete: true,
      });
      showToast("Account deleted.");
      await logout();
    } catch (err) {
      showToast("Failed to delete account. Check your password and try again.");
    }
  };

  return (
    <div className="space-y-6 text-left relative select-none">
      
      <AnimatePresence>
        {toastMessage && (
          <motion.div 
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            className="fixed top-6 right-6 z-50 bg-[#0C0C0E] border border-border text-primary px-4 py-2.5 rounded-xl shadow-2xl flex items-center gap-2 font-mono text-[10px] uppercase font-bold"
          >
            <Check className="w-3.5 h-3.5 shrink-0" />
            {toastMessage}
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-border pb-5">
        <div className="space-y-0.5 text-left">
          <h1 className="text-xl md:text-2xl font-bold text-text-primary tracking-tight">Settings</h1>
          <p className="text-[11px] text-text-secondary font-semibold font-sans">
            Manage your profile, repository connections, telemetry API layers, and active developer sessions.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 w-full pt-2">
        
        <div className="md:col-span-3 flex flex-col gap-0.5">
          {[
            { id: 'profile', label: "Profile", icon: <User className="w-3.5 h-3.5" /> },
            { id: 'appearance', label: "Appearance", icon: <Moon className="w-3.5 h-3.5" /> },
            { id: 'github', label: "GitHub Integration", icon: <GithubIcon className="w-3.5 h-3.5" /> },
            { id: 'ai', label: "AI Review Engine", icon: <Cpu className="w-3.5 h-3.5" /> },
            { id: 'security', label: "Security & Sessions", icon: <Lock className="w-3.5 h-3.5" /> },
            { id: 'danger', label: "Danger Zone", icon: <ShieldAlert className="w-3.5 h-3.5 text-critical" /> }
          ].map((sec) => {
            const isActive = activeSection === sec.id;
            return (
              <button
                key={sec.id}
                onClick={() => setActiveSection(sec.id as any)}
                className={`w-full px-3 py-2 text-xs font-semibold rounded-lg flex items-center gap-2.5 transition-all duration-150 cursor-pointer text-left border ${
                  isActive 
                    ? 'text-white bg-card border-border' 
                    : 'text-text-secondary border-transparent hover:text-white hover:bg-card/30'
                }`}
              >
                <div className={`shrink-0 ${isActive ? 'text-primary' : 'text-text-muted'}`}>
                  {sec.icon}
                </div>
                <span>{sec.label}</span>
              </button>
            );
          })}
        </div>

        <div className="md:col-span-9">
          <AnimatePresence mode="wait">
            
            {activeSection === 'profile' && (
              <motion.div
                key="profile-card"
                initial={{ opacity: 0, x: 5 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -5 }}
                transition={{ duration: 0.15 }}
                className="p-5 bg-card border border-border rounded-2xl shadow-sm"
              >
                <div className="flex items-center gap-2 border-b border-border pb-3 mb-5 select-none">
                  <User className="w-4 h-4 text-primary shrink-0" />
                  <h3 className="text-[10px] font-mono font-bold text-text-primary uppercase tracking-wider">Profile Settings</h3>
                </div>

                <form onSubmit={handleProfileSave} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-[9px] font-mono text-text-muted uppercase font-bold tracking-wider">Full Name</label>
                      <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="w-full bg-[#0C0C0E] border border-border rounded-xl px-4 py-2 text-xs text-text-primary focus:border-primary/50 focus:outline-none transition-all duration-150 font-medium"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[9px] font-mono text-text-muted uppercase font-bold tracking-wider">Email Address</label>
                      <input
                        type="email"
                        value={email}
                        readOnly
                        className="w-full bg-[#0C0C0E] border border-border rounded-xl px-4 py-2 text-xs text-text-secondary focus:outline-none font-medium cursor-not-allowed"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[9px] font-mono text-text-muted uppercase font-bold tracking-wider">Bio</label>
                    <textarea
                      value={bio}
                      onChange={(e) => setBio(e.target.value)}
                      rows={3}
                      maxLength={500}
                      className="w-full bg-[#0C0C0E] border border-border rounded-xl px-4 py-2 text-xs text-text-primary focus:border-primary/50 focus:outline-none transition-all duration-150 font-medium resize-none"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[9px] font-mono text-text-muted uppercase font-bold tracking-wider">Profile Picture URL</label>
                    <input
                      type="url"
                      value={profilePictureUrl}
                      onChange={(e) => setProfilePictureUrl(e.target.value)}
                      placeholder="https://..."
                      className="w-full bg-[#0C0C0E] border border-border rounded-xl px-4 py-2 text-xs text-text-primary focus:border-primary/50 focus:outline-none transition-all duration-150 font-medium"
                    />
                  </div>

                  <button
                    type="submit"
                    className="px-4 py-2 rounded-xl bg-primary text-black font-extrabold text-[9px] font-mono uppercase tracking-wider hover:opacity-90 active:scale-[0.98] transition-all cursor-pointer inline-flex items-center gap-1.5"
                  >
                    <span>Save Profile Changes</span>
                  </button>
                </form>
              </motion.div>
            )}

            {activeSection === 'appearance' && (
              <motion.div
                key="appearance-card"
                initial={{ opacity: 0, x: 5 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -5 }}
                transition={{ duration: 0.15 }}
                className="p-5 bg-card border border-border rounded-2xl shadow-sm"
              >
                <div className="flex items-center gap-2 border-b border-border pb-3 mb-5 select-none">
                  <Moon className="w-4 h-4 text-primary shrink-0" />
                  <h3 className="text-[10px] font-mono font-bold text-text-primary uppercase tracking-wider">Appearance Configurations</h3>
                </div>

                <div className="space-y-5 text-left select-none">
                  <div className="space-y-2">
                    <span className="text-[9px] font-mono text-text-muted uppercase block font-bold tracking-wider">Active Workspace Theme</span>
                    <div className="flex gap-2">
                      {[
                        { id: 'dark', label: 'Dark Mode' },
                        { id: 'light', label: 'Light Mode' },
                        { id: 'system', label: 'System Preferences' }
                      ].map((th) => {
                        const isSel = activeTheme === th.id;
                        return (
                          <button
                            key={th.id}
                            onClick={() => { handleThemeChange(th.id as any); showToast("Theme preference updated"); }}
                            className={`px-4 py-2 rounded-xl border text-xs font-semibold transition-all duration-150 cursor-pointer ${
                              isSel 
                                ? 'bg-primary border-primary/20 text-black font-extrabold shadow-md' 
                                : 'bg-[#0C0C0E] border-border text-text-secondary hover:text-white'
                            }`}
                          >
                            {th.label}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div className="pt-2">
                    <span className="text-[9px] font-mono text-text-muted uppercase block font-bold tracking-wider">Accent Preview</span>
                    <div className="flex items-center gap-2.5 mt-2 bg-[#0C0C0E] border border-border p-3.5 rounded-xl">
                      <div className="w-3.5 h-3.5 rounded-full bg-primary shrink-0 animate-pulse shadow-[0_0_8px_rgba(0,229,255,0.4)]" />
                      <span className="text-xs font-bold text-white">Kodeye Cyan (sparringly mapped focus color)</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {activeSection === 'github' && (
              <motion.div
                key="github-card"
                initial={{ opacity: 0, x: 5 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -5 }}
                transition={{ duration: 0.15 }}
                className="p-5 bg-card border border-border rounded-2xl shadow-sm"
              >
                <div className="flex items-center gap-2 border-b border-border pb-3 mb-5 select-none">
                  <GithubIcon className="w-4 h-4 text-primary shrink-0" />
                  <h3 className="text-[10px] font-mono font-bold text-text-primary uppercase tracking-wider">GitHub Connection Pipeline</h3>
                </div>

                <div className="space-y-5 text-left">
                  <div className="p-4 bg-[#0C0C0E]/40 border border-border rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div className="space-y-1">
                      <span className="text-xs font-bold text-white block">Connection Telemetry Status</span>
                      <span className="text-[9px] text-text-secondary leading-normal block max-w-sm">
                        Inject automated reviews directly inside pull requests and compile checks indicators at branch commit.
                      </span>
                    </div>

                    <div className="flex gap-2 shrink-0">
                      {isGitHubConnected && (
                        <button
                          onClick={handleReconnectGitHub}
                          className="px-4 py-2 rounded-xl bg-primary text-black hover:opacity-90 transition-all font-mono text-[9px] font-bold uppercase tracking-wider cursor-pointer"
                        >
                          Reconnect GitHub
                        </button>
                      )}
                      <button
                        onClick={handleToggleGitHub}
                        className={`px-4 py-2 rounded-xl transition-all font-mono text-[9px] font-bold uppercase tracking-wider cursor-pointer ${
                          isGitHubConnected 
                            ? 'bg-red-950/10 border border-red-500/30 text-red-400 hover:bg-red-500/10' 
                            : 'bg-primary text-black hover:opacity-90'
                        }`}
                      >
                        {isGitHubConnected ? "Disconnect Pipeline" : "Connect GitHub"}
                      </button>
                    </div>
                  </div>

                  {!isGitHubConnected && (
                    <div className="space-y-2">
                      <label className="text-[9px] font-mono text-text-muted uppercase font-bold tracking-wider">GitHub Personal Access Token</label>
                      <div className="flex gap-2">
                        <input
                          value={githubToken}
                          onChange={(e) => setGitHubToken(e.target.value)}
                          type="password"
                          placeholder="ghp_..."
                          className="flex-1 bg-[#0C0C0E] border border-border rounded-xl px-3.5 py-2 text-xs text-white placeholder-text-muted/40 focus:border-primary/50 focus:outline-none transition-all font-mono"
                        />
                        <button
                          onClick={handleConnectGitHubToken}
                          className="px-4 py-2 rounded-xl bg-primary text-black hover:opacity-90 transition-all font-mono text-[9px] font-bold uppercase tracking-wider cursor-pointer shrink-0"
                        >
                          Save Token
                        </button>
                      </div>
                    </div>
                  )}

                  {isGitHubConnected && (
                    <div className="p-3 bg-primary/5 border border-primary/20 rounded-xl flex items-center gap-2.5 font-mono text-[9px] text-primary uppercase font-bold select-none animate-pulse">
                      <ShieldCheck className="w-3.5 h-3.5 shrink-0" />
                      <span>Pipeline mapped successfully{githubUsername ? `: ${githubUsername}` : ""}.</span>
                    </div>
                  )}
                </div>
              </motion.div>
            )}

            {activeSection === 'ai' && (
              <motion.div
                key="ai-card"
                initial={{ opacity: 0, x: 5 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -5 }}
                transition={{ duration: 0.15 }}
                className="p-5 bg-card border border-border rounded-2xl shadow-sm"
              >
                <div className="flex items-center gap-2 border-b border-border pb-3 mb-5 select-none">
                  <Cpu className="w-4 h-4 text-primary shrink-0" />
                  <h3 className="text-[10px] font-mono font-bold text-text-primary uppercase tracking-wider">AI Review Engine</h3>
                </div>

                <div className="space-y-5 text-left">
                  <label className="flex items-start justify-between cursor-pointer group select-none gap-4">
                    <div className="text-left">
                      <span className="text-xs font-bold text-white block">Enable Advanced AI Review Layer</span>
                      <span className="text-[9px] text-text-secondary mt-0.5 leading-normal block max-w-sm">
                        Activates LLM scanning models for deep AST analysis and inline semantic patch generation.
                      </span>
                    </div>
                    
                    <button
                      type="button"
                      onClick={() => setEnableAI(!enableAI)}
                      className={`w-9 h-4.5 rounded-full p-0.5 transition-colors cursor-pointer shrink-0 mt-1 ${
                        enableAI ? 'bg-primary' : 'bg-[#0C0C0E] border border-border'
                      }`}
                    >
                      <div className={`w-3.5 h-3.5 rounded-full bg-white shadow transition-transform duration-150 ${
                        enableAI ? 'translate-x-4 bg-black' : ''
                      }`} />
                    </button>
                  </label>

                  <AnimatePresence>
                    {enableAI && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.15 }}
                        className="space-y-4 pt-2 border-t border-border/50"
                      >
                        <div className="space-y-1">
                          <label className="text-[9px] font-mono text-text-muted uppercase font-bold tracking-wider">OpenAI / Telemetry API Key</label>
                          <div className="relative">
                            <span className="absolute inset-y-0 left-3.5 flex items-center text-text-muted pointer-events-none">
                              <Key className="w-3.5 h-3.5" />
                            </span>
                            <input
                              type="password"
                              placeholder="sk-proj-••••••••••••••••"
                              value={apiKey}
                              onChange={(e) => setApiKey(e.target.value)}
                              className="w-full bg-[#0C0C0E] border border-border rounded-xl pl-10 pr-4 py-2 text-xs text-text-primary placeholder-text-muted focus:border-primary/50 focus:outline-none transition-all duration-150 font-mono"
                            />
                          </div>
                        </div>

                        <label className="flex items-center justify-between cursor-pointer group select-none">
                          <span className="text-[10px] text-text-secondary hover:text-white transition-colors duration-150 font-bold">
                            Auto-Create Patches Pull Request
                          </span>
                          <button
                            type="button"
                            onClick={() => setAutoPR(!autoPR)}
                            className={`w-9 h-4.5 rounded-full p-0.5 transition-colors cursor-pointer shrink-0 ${
                              autoPR ? 'bg-primary' : 'bg-[#0C0C0E] border border-border'
                            }`}
                          >
                            <div className={`w-3.5 h-3.5 rounded-full bg-white shadow transition-transform duration-150 ${
                              autoPR ? 'translate-x-4 bg-black' : ''
                            }`} />
                          </button>
                        </label>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </motion.div>
            )}

            {activeSection === 'security' && (
              <motion.div
                key="security-card"
                initial={{ opacity: 0, x: 5 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -5 }}
                transition={{ duration: 0.15 }}
                className="space-y-6"
              >
                <div className="p-5 bg-card border border-border rounded-2xl shadow-sm">
                  <div className="flex items-center gap-2 border-b border-border pb-3 mb-5 select-none">
                    <KeyRound className="w-4 h-4 text-primary shrink-0" />
                    <h3 className="text-[10px] font-mono font-bold text-text-primary uppercase tracking-wider">Change Password</h3>
                  </div>

                  <form onSubmit={handlePasswordUpdate} className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="text-[9px] font-mono text-text-muted uppercase font-bold tracking-wider">Current Password</label>
                        <input
                          type={showPass ? "text" : "password"}
                          value={currentPassword}
                          onChange={(e) => setCurrentPassword(e.target.value)}
                          placeholder="••••••••••••"
                          className="w-full bg-[#0C0C0E] border border-border rounded-xl px-4 py-2 text-xs text-text-primary focus:border-primary/50 focus:outline-none transition-all duration-150 font-mono"
                        />
                      </div>

                      <div className="space-y-1">
                        <div className="flex justify-between items-center">
                          <label className="text-[9px] font-mono text-text-muted uppercase font-bold tracking-wider">New Password</label>
                          <button
                            type="button"
                            onClick={() => setShowPass(!showPass)}
                            className="text-[9px] text-primary hover:underline font-mono font-semibold bg-transparent border-0 cursor-pointer"
                          >
                            {showPass ? "Hide" : "Show"}
                          </button>
                        </div>
                        <input
                          type={showPass ? "text" : "password"}
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                          placeholder="••••••••••••"
                          className="w-full bg-[#0C0C0E] border border-border rounded-xl px-4 py-2 text-xs text-text-primary focus:border-primary/50 focus:outline-none transition-all duration-150 font-mono"
                        />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[9px] font-mono text-text-muted uppercase font-bold tracking-wider">Confirm New Password</label>
                      <input
                        type={showPass ? "text" : "password"}
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="••••••••••••"
                        className="w-full bg-[#0C0C0E] border border-border rounded-xl px-4 py-2 text-xs text-text-primary focus:border-primary/50 focus:outline-none transition-all duration-150 font-mono"
                      />
                    </div>

                    <button
                      type="submit"
                      className="px-4 py-2 rounded-xl bg-primary text-black font-extrabold text-[9px] font-mono uppercase tracking-wider hover:opacity-90 active:scale-[0.98] transition-all cursor-pointer inline-flex items-center gap-1.5"
                    >
                      <span>Update Credentials</span>
                    </button>
                  </form>
                </div>

                <div className="p-5 bg-card border border-border rounded-2xl shadow-sm text-left select-none">
                  <div className="flex items-center gap-2 border-b border-border pb-3 mb-4">
                    <Laptop className="w-4 h-4 text-primary shrink-0" />
                    <h3 className="text-[10px] font-mono font-bold text-text-primary uppercase tracking-wider">Active Device Sessions</h3>
                  </div>

                  {isLoadingSessions ? (
                    <div className="py-8 text-center text-[10px] font-mono text-text-secondary uppercase tracking-widest animate-pulse">
                      Retrieving Session Context...
                    </div>
                  ) : sessions.length === 0 ? (
                    <div className="py-8 text-center text-xs text-text-muted">
                      No active sessions found.
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {sessions.map((sess) => (
                        <div 
                          key={sess.id}
                          className="flex items-center justify-between p-3.5 bg-[#0C0C0E]/40 border border-border rounded-xl"
                        >
                          <div className="flex items-center gap-3 truncate text-left pr-4">
                            <div className={`p-1.5 rounded-lg bg-[#0C0C0E] border border-border shrink-0 ${
                              sess.is_active ? 'text-primary' : 'text-text-muted'
                            }`}>
                              <Globe className="w-3.5 h-3.5" />
                            </div>
                            <div className="truncate">
                              <span className="text-xs font-bold text-white block truncate leading-tight">
                                {sess.device_info || 'Unknown Device Client'}
                              </span>
                              <span className="text-[9px] text-text-muted font-mono">
                                IP: {sess.ip_address || '—'} {sess.is_active ? '• Active' : '• Expired'}
                              </span>
                            </div>
                          </div>

                          {sess.is_active ? (
                            <button
                              onClick={() => handleRevokeSession(sess.id)}
                              className="px-2.5 py-1 rounded-lg border border-border bg-[#0C0C0E] hover:border-red-500/20 text-text-secondary hover:text-red-400 font-mono text-[9px] font-bold uppercase tracking-wide cursor-pointer transition-all shrink-0 h-6 flex items-center justify-center"
                            >
                              Revoke
                            </button>
                          ) : (
                            <span className="px-2.5 py-1 rounded-lg border border-border/40 bg-transparent text-text-muted font-mono text-[9px] font-bold uppercase tracking-wide shrink-0 h-6 flex items-center justify-center">
                              Expired
                            </span>
                          )}
                        </div>
                      ))}

                      <div className="pt-4 border-t border-border flex justify-end">
                        <button
                          onClick={handleLogoutAllDevices}
                          className="px-4 py-2 rounded-xl bg-red-950/10 border border-red-500/20 text-red-400 hover:bg-red-500/10 hover:border-red-500 transition-all font-bold text-[9px] font-mono uppercase tracking-wider cursor-pointer flex items-center gap-1.5 h-9"
                        >
                          <Lock className="w-3.5 h-3.5" />
                          Logout All Devices
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </motion.div>
            )}

            {activeSection === 'danger' && (
              <motion.div
                key="danger-card"
                initial={{ opacity: 0, x: 5 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -5 }}
                transition={{ duration: 0.15 }}
                className="p-5 bg-card border border-red-500/25 rounded-2xl shadow-sm text-left select-none relative overflow-hidden"
              >
                <div className="absolute top-0 left-0 w-full h-[2px] bg-red-500/30" />
                
                <div className="flex items-center gap-2 border-b border-red-500/10 pb-3 mb-5">
                  <ShieldAlert className="w-4 h-4 text-critical shrink-0 animate-pulse" />
                  <h3 className="text-[10px] font-mono font-bold text-critical uppercase tracking-wider">Danger Zone</h3>
                </div>

                <div className="space-y-4">
                  <div className="p-4 bg-red-950/5 border border-red-500/15 rounded-xl space-y-4">
                    <div className="space-y-1">
                      <span className="text-xs font-bold text-white block">Delete Developer Account</span>
                      <span className="text-[9px] text-text-secondary leading-normal block max-w-sm font-semibold">
                        Permanently purge your Kodeye credentials, telemetry histories, reports, and connections. This action is final.
                      </span>
                    </div>

                    <div className="space-y-1 max-w-sm">
                      <label className="text-[9px] font-mono text-text-muted uppercase font-bold tracking-wider">
                        Confirm Password (if applicable)
                      </label>
                      <input
                        type="password"
                        value={deletePassword}
                        onChange={(e) => setDeletePassword(e.target.value)}
                        placeholder="••••••••••••"
                        className="w-full bg-[#0C0C0E] border border-border rounded-xl px-4 py-2 text-xs text-text-primary focus:border-red-500/50 focus:outline-none font-mono"
                      />
                    </div>

                    <div className="flex justify-end">
                    <button
                      onClick={handleDeleteAccount}
                      className="px-4 py-2.5 rounded-xl bg-red-950/10 border border-red-500/20 text-red-400 hover:bg-red-500/10 hover:border-red-500 transition-all font-bold text-[9px] font-mono uppercase tracking-wider cursor-pointer shrink-0 flex items-center gap-1.5 h-9"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      Delete Account
                    </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

          </AnimatePresence>
        </div>

      </div>

    </div>
  );
};

export default SettingsPage;
