import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Play, Cpu, ShieldCheck, Layers, Code2, 
  ArrowLeft, ArrowRight, RefreshCw, GitBranch, FolderOpen, FileCode, Download
} from 'lucide-react';
import { ScanLine } from '../ui/ScanLine';
import { analyzeCode } from '../../services/reviewService';
import {
  getGitHubProfile,
  getRepoFileContent,
  getRepoFiles,
  getRepos,
  scanGithubFile,
  type GitHubRepo,
  type GitHubRepoFileItem,
} from '../../services/githubService';

interface NewReviewPageProps {
  onReviewComplete: (newReview: {
    project: string;
    lang: string;
    score: number;
    issues: number;
    date: string;
    status: string;
    colorClass: string;
  }) => void;
  onExit: () => void;
  isScannerOnline?: boolean;
}

export const NewReviewPage: React.FC<NewReviewPageProps> = ({ 
  onReviewComplete, 
  onExit,
  isScannerOnline = true
}) => {
  const navigate = useNavigate();
  const [projectName, setProjectName] = useState("");
  const [language, setLanguage] = useState("TypeScript");
  const [depth, setDepth] = useState<"quick" | "deep">("quick");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [showGitHubImport, setShowGitHubImport] = useState(false);
  const [githubConnected, setGithubConnected] = useState<boolean | null>(null);
  const [repos, setRepos] = useState<GitHubRepo[]>([]);
  const [selectedRepo, setSelectedRepo] = useState<GitHubRepo | null>(null);
  const [selectedBranch, setSelectedBranch] = useState("");
  const [currentPath, setCurrentPath] = useState("");
  const [repoFiles, setRepoFiles] = useState<GitHubRepoFileItem[]>([]);
  const [isLoadingGitHub, setIsLoadingGitHub] = useState(false);
  const [githubError, setGithubError] = useState<string | null>(null);
  const [importedFilePath, setImportedFilePath] = useState<string | null>(null);
  const [importedSource, setImportedSource] = useState<{
    repo: string;
    branch: string;
    path: string;
    url: string;
  } | null>(null);
  
  const [detectSecrets, setDetectSecrets] = useState(true);
  const [checkUnsafe, setCheckUnsafe] = useState(true);
  const [injectionRisks, setInjectionRisks] = useState(true);
  const [errorHandling, setErrorHandling] = useState(true);
  const [codeSmells, setCodeSmells] = useState(true);
  const [suggestedFixes, setSuggestedFixes] = useState(true);

  const [code, setCode] = useState(`// Paste your function here to begin the scan
import jwt from "jsonwebtoken";

export async function verifySession(token) {
  if (!token) {
    throw new Error("Missing token payload");
  }
  
  // TODO: Fix hardcoded signing credentials
  const secretKey = "sk_live_51M3i...";
  const decoded = jwt.verify(token, secretKey);
  
  return {
    user: decoded.sub,
    scope: "admin"
  };
}`);

  const [scanState, setScanState] = useState<'idle' | 'scanning' | 'report'>('idle');
  const [scanStepIdx, setScanStepIdx] = useState(0);
  const scanSteps = [
    "Reading structure...",
    "Running security checks...",
    "Finding code smells...",
    "Preparing report..."
  ];

  useEffect(() => {
    let timer: any;
    if (scanState === 'scanning') {
      timer = setInterval(() => {
        setScanStepIdx((prev) => {
          if (prev >= scanSteps.length - 1) {
            clearInterval(timer);
            setTimeout(() => {
              setScanState('report');
            }, 800);
            return prev;
          }
          return prev + 1;
        });
      }, 700);
    }
    return () => clearInterval(timer);
  }, [scanState]);

  useEffect(() => {
    if (!showGitHubImport) return;

    const loadGitHubState = async () => {
      try {
        setIsLoadingGitHub(true);
        setGithubError(null);
        const profile = await getGitHubProfile();
        setGithubConnected(profile.connected);
        if (!profile.connected) return;
        const repoList = await getRepos();
        setRepos(repoList);
        if (repoList.length && !selectedRepo) {
          setSelectedRepo(repoList[0]);
          setSelectedBranch(repoList[0].default_branch || "main");
        } else if (!repoList.length) {
          setSelectedRepo(null);
          setRepoFiles([]);
        }
      } catch (error: any) {
        console.error(error);
        const detail = error.response?.data?.detail || "Unable to load GitHub repositories.";
        setGithubError(detail);
        if (error.response?.status === 401) {
          setGithubConnected(false);
        }
      } finally {
        setIsLoadingGitHub(false);
      }
    };

    loadGitHubState();
  }, [showGitHubImport]);

  useEffect(() => {
    if (!showGitHubImport || !selectedRepo || !githubConnected) return;

    const [owner, repo] = selectedRepo.full_name.split("/");
    const loadFiles = async () => {
      try {
        setIsLoadingGitHub(true);
        setGithubError(null);
        const data = await getRepoFiles(owner, repo, currentPath, selectedBranch || selectedRepo.default_branch);
        setRepoFiles(data.items);
        setSelectedBranch(data.branch);
      } catch (error: any) {
        console.error(error);
        const detail = error.response?.data?.detail || "Unable to browse GitHub files.";
        setGithubError(detail);
        if (error.response?.status === 401) {
          setGithubConnected(false);
        }
        setRepoFiles([]);
      } finally {
        setIsLoadingGitHub(false);
      }
    };

    loadFiles();
  }, [showGitHubImport, selectedRepo, selectedBranch, currentPath, githubConnected]);

  const languageFromImport = (detected: string) => {
    const normalized = detected.toLowerCase();
    const map: Record<string, string> = {
      javascript: "JavaScript",
      typescript: "TypeScript",
      python: "Python",
      go: "Go",
      rust: "Rust",
      java: "Java",
      cpp: "C++",
    };
    return map[normalized] || detected;
  };

  const handleRepoChange = (fullName: string) => {
    const repo = repos.find((item) => item.full_name === fullName) || null;
    setSelectedRepo(repo);
    setSelectedBranch(repo?.default_branch || "main");
    setCurrentPath("");
    setRepoFiles([]);
  };

  const handleImportFile = async (file: GitHubRepoFileItem) => {
    if (!selectedRepo || file.type !== "file" || !file.importable) return;
    const [owner, repo] = selectedRepo.full_name.split("/");
    try {
      setIsLoadingGitHub(true);
      setGithubError(null);
      const imported = await getRepoFileContent(owner, repo, file.path, selectedBranch || selectedRepo.default_branch);
      setCode(imported.content);
      setLanguage(languageFromImport(imported.language));
      setProjectName(selectedRepo.name);
      setImportedFilePath(imported.path);
      setImportedSource({
        repo: selectedRepo.full_name,
        branch: imported.branch,
        path: imported.path,
        url: `https://github.com/${selectedRepo.full_name}/blob/${imported.branch}/${imported.path}`,
      });
      setShowGitHubImport(false);
    } catch (error: any) {
      console.error(error);
      const detail = error.response?.data?.detail || "Unable to import this GitHub file.";
      setGithubError(detail);
      if (error.response?.status === 401) {
        setGithubConnected(false);
      }
    } finally {
      setIsLoadingGitHub(false);
    }
  };

  const handleScanGithubFile = async (file: GitHubRepoFileItem) => {
    if (!selectedRepo || file.type !== "file" || !file.importable) return;
    const [owner, repo] = selectedRepo.full_name.split("/");
    try {
      setIsLoadingGitHub(true);
      setGithubError(null);
      const result = await scanGithubFile(
        owner,
        repo,
        file.path,
        selectedBranch || selectedRepo.default_branch,
        projectName || selectedRepo.name
      );
      navigate(`/reviews/${result.review_id}`);
    } catch (error: any) {
      console.error(error);
      const detail = error.response?.data?.detail || "Unable to scan this GitHub file.";
      setGithubError(detail);
      if (error.response?.status === 401) {
        setGithubConnected(false);
      }
    } finally {
      setIsLoadingGitHub(false);
    }
  };

  const handleParentPath = () => {
    if (!currentPath) return;
    const parts = currentPath.split("/");
    parts.pop();
    setCurrentPath(parts.join("/"));
  };

  const handleAnalyze = async () => {
    if (!projectName.trim()) {
      alert("Please enter a project name.");
      return;
    }
    
    try {
      setIsAnalyzing(true);
      setScanStepIdx(0);
      setScanState('scanning');

      const result = await analyzeCode({
        project_name: projectName || "Untitled Project",
        language: language,
        code,
        review_depth: depth,
        source_provider: importedSource ? "github" : undefined,
        source_repo: importedSource?.repo,
        source_branch: importedSource?.branch,
        source_path: importedSource?.path,
        source_url: importedSource?.url,
      });

      if (!result.review_id) {
        throw new Error("Backend did not return a review id.");
      }

      const reviewId = String(result.review_id);
      const reviewItem = {
        id: reviewId,
        project_name: result.project_name || projectName || "Untitled Project",
        language: result.language || language,
        score: result.score,
        summary: result.summary,
        issues: result.issues,
        improved_code: result.improved_code,
        review_depth: depth,
        created_at: new Date().toISOString()
      };

      setTimeout(() => {
        onReviewComplete({
          project: reviewItem.project_name.toLowerCase(),
          lang: reviewItem.language,
          score: reviewItem.score,
          issues: reviewItem.issues.length,
          date: reviewItem.created_at.split('T')[0],
          status: reviewItem.score >= 90 ? "Clean" : reviewItem.score >= 75 ? "Issues" : "Critical",
          colorClass: reviewItem.score >= 90 ? "text-primary border-primary/20 bg-primary/5" :
                      reviewItem.score >= 75 ? "text-yellow-400 border-yellow-500/20 bg-yellow-500/5" :
                                           "text-red-400 border-red-500/20 bg-red-500/5"
        });
        navigate(`/reviews/${reviewId}`);
      }, 800);
    } catch (error) {
      console.error(error);
      alert("Failed to analyze code. Make sure backend is running.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleSaveAndReturn = () => {
    onExit();
  };

  return (
    <div className="w-full select-none text-left">
      <AnimatePresence mode="wait">
        
        {scanState === 'idle' && (
          <motion.div
            key="setup"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            className="space-y-6"
          >
            <div className="flex items-center justify-between border-b border-border/50 pb-5">
              <div className="flex items-center gap-3">
                <button 
                  onClick={onExit}
                  className="p-2 rounded-xl bg-card border border-border text-text-secondary hover:text-white hover:border-primary/20 transition-all duration-150 cursor-pointer"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                </button>
                <div>
                  <h1 className="text-xl md:text-2xl font-bold text-white tracking-tight">New Code Review</h1>
                  <p className="text-[11px] text-text-secondary mt-0.5 font-semibold">Scan code for bugs, security risks, and maintainability issues.</p>
                </div>
              </div>
              <button
                onClick={() => setShowGitHubImport((value) => !value)}
                className={`px-4 py-2 rounded-xl border text-[10px] font-mono uppercase font-bold tracking-wider transition-all cursor-pointer flex items-center gap-1.5 ${
                  showGitHubImport
                    ? "bg-primary text-black border-primary"
                    : "bg-card border-border text-text-secondary hover:text-white hover:border-primary/25"
                }`}
              >
                <GitBranch className={`w-3.5 h-3.5 ${showGitHubImport ? "text-black" : "text-primary"}`} />
                <span>Import from GitHub</span>
              </button>
            </div>

            <div className="w-full p-4 border border-border bg-card/40 rounded-xl grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-1">
                <label className="text-[9px] font-mono text-text-muted uppercase font-bold tracking-wider">Project Name</label>
                <input
                  type="text"
                  placeholder="e.g. auth-gateway"
                  value={projectName}
                  onChange={(e) => setProjectName(e.target.value)}
                  className="w-full bg-[#0C0C0E] border border-border rounded-xl px-3.5 py-2 text-xs text-white placeholder-text-muted/40 focus:border-primary/50 focus:outline-none transition-all duration-150 font-mono"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[9px] font-mono text-text-muted uppercase font-bold tracking-wider">Language Model</label>
                <select
                  value={language}
                  onChange={(e) => setLanguage(e.target.value)}
                  className="w-full bg-[#0C0C0E] border border-border rounded-xl px-3.5 py-2 text-xs text-white focus:border-primary/50 focus:outline-none transition-all duration-150 cursor-pointer font-mono font-semibold"
                >
                  {["TypeScript", "JavaScript", "Python", "Go", "Rust", "Java", "C++", "C", "C#", "PHP", "Ruby"].map((lang) => (
                    <option key={lang} value={lang} className="bg-[#0C0C0E]">
                      {lang}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[9px] font-mono text-text-muted uppercase font-bold tracking-wider">Review Audit Depth</label>
                <div className="flex gap-1.5 bg-[#0C0C0E] border border-border rounded-xl p-1 w-full justify-between">
                  <button
                    onClick={() => setDepth("quick")}
                    className={`flex-1 py-1 rounded-lg text-[9px] font-bold tracking-wide uppercase font-mono transition-all duration-150 cursor-pointer ${
                      depth === 'quick' ? 'bg-primary text-black font-extrabold shadow-md' : 'text-text-secondary hover:text-white'
                    }`}
                  >
                    Quick Scan
                  </button>
                  <button
                    onClick={() => setDepth("deep")}
                    className={`flex-1 py-1 rounded-lg text-[9px] font-bold tracking-wide uppercase font-mono transition-all duration-150 cursor-pointer ${
                      depth === 'deep' ? 'bg-primary text-black font-extrabold shadow-md' : 'text-text-secondary hover:text-white'
                    }`}
                  >
                    Deep AST
                  </button>
                </div>
              </div>
            </div>

            {showGitHubImport && (
              <div className="w-full p-4 border border-border bg-card rounded-2xl inner-glow-card space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border/50 pb-3">
                  <div className="flex items-center gap-2">
                    <GitBranch className="w-4 h-4 text-primary" />
                    <div>
                      <h3 className="text-[10px] font-mono uppercase font-bold text-white tracking-wider">GitHub Repository Import</h3>
                      <p className="text-[9px] text-text-muted font-semibold">Browse supported source files and load one into the editor.</p>
                    </div>
                  </div>
                  {isLoadingGitHub && <span className="text-[9px] font-mono text-primary uppercase font-bold animate-pulse">Loading...</span>}
                </div>

                {githubError && (
                  <div className="p-3 rounded-xl border border-red-500/20 bg-red-500/5 text-[10px] text-red-300 font-semibold">
                    {githubError}
                  </div>
                )}

                {githubConnected === false ? (
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-xl border border-border bg-[#0C0C0E]">
                    <div className="space-y-1">
                      <p className="text-[10px] text-text-secondary font-semibold">
                        {githubError?.toLowerCase().includes("token")
                          ? "GitHub token expired or invalid. Reconnect GitHub to import repository files."
                          : "Connect GitHub in Settings to import repository files."}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => navigate("/settings")}
                        className="px-4 py-2 rounded-xl bg-card border border-border text-text-secondary hover:text-white font-mono text-[9px] uppercase font-bold cursor-pointer"
                      >
                        Open Settings
                      </button>
                      <button
                        onClick={() => navigate("/settings")}
                        className="px-4 py-2 rounded-xl bg-primary text-black font-mono text-[9px] uppercase font-extrabold cursor-pointer"
                      >
                        Reconnect GitHub
                      </button>
                    </div>
                  </div>
                ) : githubConnected ? (
                  <>
                    {repos.length === 0 && !isLoadingGitHub ? (
                      <div className="p-6 rounded-xl border border-border bg-[#0C0C0E] text-center">
                        <FolderOpen className="w-6 h-6 text-text-muted mx-auto mb-3" />
                        <h4 className="text-[10px] font-mono uppercase font-bold text-white">No repositories found</h4>
                        <p className="text-[9px] text-text-muted mt-1 font-semibold">
                          This GitHub account returned no accessible repositories. Reconnect with repo scope for private repositories.
                        </p>
                        <button
                          onClick={() => navigate("/settings")}
                          className="mt-4 px-4 py-2 rounded-xl bg-primary text-black font-mono text-[9px] uppercase font-extrabold cursor-pointer"
                        >
                          Reconnect GitHub
                        </button>
                      </div>
                    ) : (
                      <>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      <div className="space-y-1">
                        <label className="text-[8px] font-mono text-text-muted uppercase font-bold">Repository</label>
                        <select
                          value={selectedRepo?.full_name || ""}
                          onChange={(event) => handleRepoChange(event.target.value)}
                          className="w-full bg-[#0C0C0E] border border-border rounded-xl px-3 py-2 text-[10px] font-mono text-text-secondary focus:border-primary/50 focus:outline-none"
                        >
                          {repos.map((repo) => (
                            <option key={repo.full_name} value={repo.full_name} className="bg-[#0C0C0E]">
                              {repo.full_name}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className="space-y-1">
                        <label className="text-[8px] font-mono text-text-muted uppercase font-bold">Branch</label>
                        <input
                          value={selectedBranch}
                          onChange={(event) => setSelectedBranch(event.target.value)}
                          placeholder={selectedRepo?.default_branch || "main"}
                          className="w-full bg-[#0C0C0E] border border-border rounded-xl px-3 py-2 text-[10px] font-mono text-text-secondary focus:border-primary/50 focus:outline-none"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-[8px] font-mono text-text-muted uppercase font-bold">Path</label>
                        <div className="flex gap-2">
                          <button
                            onClick={handleParentPath}
                            disabled={!currentPath}
                            className="px-3 py-2 rounded-xl bg-[#0C0C0E] border border-border text-text-secondary hover:text-white disabled:opacity-30 text-[9px] font-mono uppercase font-bold"
                          >
                            Up
                          </button>
                          <div className="flex-1 bg-[#0C0C0E] border border-border rounded-xl px-3 py-2 text-[10px] font-mono text-text-muted truncate">
                            /{currentPath || ""}
                          </div>
                        </div>
                      </div>
                    </div>
                      </>
                    )}

                    {selectedRepo && (
                      <>
                      <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
                        {[
                          { label: "Owner", value: selectedRepo.owner },
                          { label: "Visibility", value: selectedRepo.private ? "Private" : "Public" },
                          { label: "Default", value: selectedRepo.default_branch },
                          { label: "Language", value: selectedRepo.language || "-" },
                          { label: "Updated", value: selectedRepo.updated_at ? selectedRepo.updated_at.split("T")[0] : "-" },
                        ].map((meta) => (
                          <div key={meta.label} className="bg-[#0C0C0E] border border-border rounded-xl px-3 py-2 min-w-0">
                            <span className="text-[7px] font-mono text-text-muted uppercase font-bold block">{meta.label}</span>
                            <span className="text-[10px] font-mono text-white font-bold truncate block">{meta.value}</span>
                          </div>
                        ))}
                      </div>
                   

                    <div className="border border-border rounded-xl overflow-hidden bg-[#0C0C0E]">
                      <div className="max-h-72 overflow-y-auto divide-y divide-border/50">
                        {repoFiles.length > 0 ? repoFiles.map((item) => (
                          <div key={`${item.type}-${item.path}`} className="flex items-center justify-between gap-3 px-3 py-2 hover:bg-card/60">
                            <button
                              onClick={() => item.type === "dir" ? setCurrentPath(item.path) : undefined}
                              disabled={item.type !== "dir"}
                              className="min-w-0 flex items-center gap-2 text-left disabled:cursor-default"
                            >
                              {item.type === "dir" ? (
                                <FolderOpen className="w-3.5 h-3.5 text-primary shrink-0" />
                              ) : (
                                <FileCode className={`w-3.5 h-3.5 shrink-0 ${item.importable ? "text-text-secondary" : "text-text-muted/40"}`} />
                              )}
                              <span className={`text-[10px] font-mono font-bold truncate ${item.importable || item.type === "dir" ? "text-white" : "text-text-muted/40"}`}>
                                {item.name}
                              </span>
                              {item.language && (
                                <span className="px-1.5 py-0.5 rounded border border-border text-[7px] text-text-muted uppercase font-mono">
                                  {item.language}
                                </span>
                              )}
                            </button>

                            {item.type === "file" && (
                              <div className="flex items-center gap-2 shrink-0">
                                <button
                                  onClick={() => handleImportFile(item)}
                                  disabled={!item.importable || isLoadingGitHub}
                                  className="px-2.5 py-1 rounded-lg bg-card border border-border text-[8px] font-mono uppercase font-bold text-text-secondary hover:text-white hover:border-primary/30 disabled:opacity-30 disabled:cursor-not-allowed flex items-center gap-1"
                                >
                                  <Download className="w-2.5 h-2.5" />
                                  Import
                                </button>
                                <button
                                  onClick={() => handleScanGithubFile(item)}
                                  disabled={!item.importable || isLoadingGitHub}
                                  className="px-2.5 py-1 rounded-lg bg-primary text-black text-[8px] font-mono uppercase font-extrabold disabled:opacity-30 disabled:cursor-not-allowed"
                                >
                                  Scan
                                </button>
                              </div>
                            )}
                          </div>
                        )) : (
                          <div className="p-6 text-center text-[10px] text-text-muted font-mono uppercase font-bold">
                            {isLoadingGitHub ? "Loading repository files" : "No supported files in this folder"}
                          </div>
                        )}
                      </div>
                    </div>
                    </>
                    )}
                  </>
                ) : null}
              </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 w-full">
              
              <div className="lg:col-span-8 flex flex-col min-h-[380px]">
                <div className="relative w-full rounded-2xl border border-border bg-[#0C0C0E] shadow-[0_24px_80px_rgba(0,0,0,0.6)] overflow-hidden flex-1 flex flex-col inner-glow-card">
                  <div className="h-10 border-b border-border/80 bg-card/25 flex items-center px-4 justify-between select-none">
                    <div className="flex gap-1.5 shrink-0">
                      <div className="w-2.5 h-2.5 rounded-full bg-red-500/40" />
                      <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/40" />
                      <div className="w-2.5 h-2.5 rounded-full bg-green-500/40" />
                    </div>
                    
                    <div className="flex items-center gap-1.5 bg-[#0C0C0E] border border-border border-b-transparent px-3.5 py-1 rounded-t-lg -mb-2 mt-2 shrink-0 select-none">
                      <span className="font-mono text-[9px] text-[#FAFAFA] font-bold">{importedFilePath || "session_verifier.ts"}</span>
                      <span className="px-1 py-0.2 rounded bg-primary/10 border border-primary/20 text-[7px] font-mono text-primary font-bold">{language}</span>
                    </div>
                    
                    <div className="w-10" />
                  </div>

                  <div className="flex-1 flex font-mono text-[10px] leading-relaxed relative bg-[#0C0C0E] py-4">
                    <div className="flex flex-col px-3.5 border-r border-border/20 text-text-muted/30 text-right select-none gap-0.5 font-mono shrink-0">
                      {Array.from({ length: 15 }, (_, i) => (
                        <span key={i} className="h-[18px]">{i + 1}</span>
                      ))}
                    </div>
                    
                    <textarea
                      value={code}
                      onChange={(e) => setCode(e.target.value)}
                      className="flex-1 px-4 bg-transparent text-text-secondary focus:outline-none resize-none font-mono text-[10px] leading-[18px] min-h-[250px] dark-grid-bg-fine select-text"
                      spellCheck="false"
                    />
                  </div>

                  <div className="h-12 border-t border-border/50 bg-card/10 flex items-center justify-between px-4">
                    <div className="flex-1 text-left">
                      {!isScannerOnline && (
                        <div className="flex items-center gap-1.5 text-red-400 font-mono text-[9px] uppercase font-bold animate-pulse">
                          <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
                          <span>Scanner backend is offline. Start the backend before analyzing code.</span>
                        </div>
                      )}
                    </div>
                    <button
                      onClick={handleAnalyze}
                      disabled={isAnalyzing || !isScannerOnline}
                      className="px-5 py-2 rounded-xl bg-primary text-black font-extrabold text-[9px] hover:opacity-90 active:scale-[0.98] transition-all duration-150 cursor-pointer flex items-center gap-1.5 uppercase font-mono tracking-wider disabled:opacity-30 disabled:cursor-not-allowed disabled:bg-primary/20 disabled:text-text-muted"
                    >
                      <Play className="w-3 h-3 text-black fill-current" />
                      Analyze Code
                    </button>
                  </div>
                </div>
              </div>

              <div className="lg:col-span-4 space-y-6">
                
                <div className="w-full p-5 border border-border bg-card rounded-2xl inner-glow-card">
                  <h3 className="text-[10px] font-mono font-bold text-white uppercase tracking-wider border-b border-border/50 pb-2.5 mb-4">Scanner Checklist</h3>
                  
                  <div className="space-y-4">
                    {[
                      { label: "Secrets detection", state: detectSecrets, setter: setDetectSecrets, desc: "Check for exposed API secret credentials in cleartext" },
                      { label: "Unsafe calls audit", state: checkUnsafe, setter: setCheckUnsafe, desc: "Isolate dynamic execution contexts and parameter errors" },
                      { label: "Injection risk check", state: injectionRisks, setter: setInjectionRisks, desc: "Detect unparameterized database interpolation vectors" },
                      { label: "Error validation check", state: errorHandling, setter: setErrorHandling, desc: "Verify active async try-catch scopes are intact" },
                      { label: "Code smell scanner", state: codeSmells, setter: setCodeSmells, desc: "Isolate dead parameters or logic leaks" },
                      { label: "Suggest patches", state: suggestedFixes, setter: setSuggestedFixes, desc: "Compile complete AI code patches immediately" }
                    ].map((item, idx) => (
                      <label key={idx} className="flex items-start justify-between cursor-pointer group select-none gap-4">
                        <div className="text-left">
                          <span className="text-[10px] text-text-secondary hover:text-white transition-colors duration-150 font-bold block">
                            {item.label}
                          </span>
                          <span className="text-[8px] text-text-muted block mt-0.5 leading-normal">{item.desc}</span>
                        </div>
                        
                        <button
                          type="button"
                          onClick={() => item.setter(!item.state)}
                          className={`w-8 h-4 rounded-full p-0.5 transition-colors cursor-pointer shrink-0 mt-0.5 ${
                            item.state ? 'bg-primary' : 'bg-[#0C0C0E] border border-border'
                          }`}
                        >
                          <div className={`w-3 h-3 rounded-full transition-transform duration-150 ${
                            item.state ? 'translate-x-4 bg-black' : 'bg-text-secondary'
                          }`} />
                        </button>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="w-full p-5 border border-border bg-card rounded-2xl inner-glow-card">
                  <h3 className="text-[10px] font-mono font-bold text-white uppercase tracking-wider border-b border-border/50 pb-2.5 mb-4">Core Engine Scopes</h3>
                  
                  <div className="space-y-3.5 text-left">
                    {[
                      { title: "Logical Bugs & Smells", icon: <Layers className="w-3.5 h-3.5 text-primary" /> },
                      { title: "Security Vulnerabilities", icon: <ShieldCheck className="w-3.5 h-3.5 text-primary" /> },
                      { title: "Performance bottlenecks", icon: <Cpu className="w-3.5 h-3.5 text-primary" /> },
                      { title: "Code Readability standards", icon: <Code2 className="w-3.5 h-3.5 text-primary" /> }
                    ].map((item, idx) => (
                      <div key={idx} className="flex items-center justify-between select-none">
                        <div className="flex items-center gap-2.5">
                          <div className="p-1 rounded bg-[#0C0C0E] border border-border">
                            {item.icon}
                          </div>
                          <span className="text-[10px] text-white font-medium">{item.title}</span>
                        </div>
                        <div className="w-4 h-4 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-primary font-bold text-[8px]">
                          ✓
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

              </div>

            </div>
          </motion.div>
        )}

        {scanState === 'scanning' && (
          <motion.div
            key="scanning"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="h-[420px] w-full bg-[#0C0C0E]/95 backdrop-blur-2xl rounded-2xl border border-border flex flex-col items-center justify-center p-8 relative overflow-hidden select-none"
          >
            <ScanLine />

            <div className="space-y-6 text-center z-10 max-w-[320px]">
              <div className="relative w-12 h-12 rounded-xl bg-primary/5 border border-primary/20 flex items-center justify-center text-primary shadow-[0_0_15px_rgba(0,229,255,0.05)] mx-auto animate-pulse">
                <RefreshCw className="w-5 h-5 animate-spin" />
              </div>
              
              <h3 className="text-xs font-bold text-white font-mono uppercase tracking-widest animate-pulse">Running Code Audit</h3>
              
              <div className="bg-[#070708] border border-border rounded-2xl p-4 font-mono text-[9px] text-left space-y-2.5 w-72">
                {scanSteps.map((step, idx) => {
                  const isActive = idx === scanStepIdx;
                  const isDone = idx < scanStepIdx;
                  return (
                    <div 
                      key={idx} 
                      className={`flex items-center gap-2.5 transition-opacity duration-150 ${
                        isActive ? 'text-primary font-bold animate-pulse' : isDone ? 'text-text-secondary/35' : 'text-text-muted/10'
                      }`}
                    >
                      <span className="shrink-0">{isDone ? "✓" : isActive ? "➔" : "○"}</span>
                      <span className="font-semibold">{step}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </motion.div>
        )}

        {scanState === 'report' && (
          <motion.div
            key="report-redirect"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            className="h-[420px] w-full bg-[#0C0C0E]/95 backdrop-blur-2xl rounded-2xl border border-border flex flex-col items-center justify-center p-8 relative overflow-hidden select-none text-center"
          >
            <div className="space-y-6 max-w-sm">
              <div className="w-12 h-12 rounded-xl bg-primary/5 border border-primary/20 flex items-center justify-center text-primary shadow-[0_0_20px_rgba(0,229,255,0.06)] mx-auto animate-pulse">
                <ShieldCheck className="w-6 h-6 text-primary" />
              </div>

              <div className="space-y-1.5">
                <h3 className="text-sm font-bold text-white font-mono uppercase tracking-widest">
                  Scan Audit Complete
                </h3>
                <p className="text-[11px] text-text-secondary leading-relaxed max-w-xs mx-auto font-semibold">
                  AST parameters and safety metrics compiled successfully. Isolated security and performance issues are ready for review.
                </p>
              </div>

              <button
                onClick={handleSaveAndReturn}
                className="px-5 py-2.5 rounded-xl bg-primary text-black hover:opacity-90 font-bold text-[10px] font-mono uppercase tracking-wider flex items-center gap-1.5 cursor-pointer active:scale-95 transition-all mx-auto"
              >
                <span>View Full Report</span>
                <ArrowRight className="w-3.5 h-3.5 text-black" />
              </button>
            </div>
          </motion.div>
        )}

      </AnimatePresence>
    </div>
  );
};

export default NewReviewPage;
