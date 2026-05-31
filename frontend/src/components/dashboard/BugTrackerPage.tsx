import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, RotateCcw, X, Check, Save, Trash2, 
  ShieldX, UserPlus, ExternalLink, Calendar, FileCode
} from 'lucide-react';
import { getIssues, updateIssueStatus, deleteIssue } from '../../services/reviewService';
import { createGitHubIssue, getGitHubProfile, getGitHubRepos } from '../../services/githubService';

const Github = ({ className }: { className?: string }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12"/>
  </svg>
);

interface Issue {
  id: string;
  title: string;
  project: string;
  severity: 'Critical' | 'High' | 'Medium' | 'Low';
  category: 'Security' | 'Performance' | 'Best Practice' | 'Readability';
  status: 'Open' | 'In Progress' | 'Fixed' | 'Ignored';
  line: number;
  created: string;
  explanation: string;
  suggestedFix: string;
  relatedReview: string;
  githubIssueUrl?: string | null;
}

export const BugTrackerPage: React.FC = () => {
  const [issues, setIssues] = useState<Issue[]>([]);

  useEffect(() => {
    getIssues()
      .then((data) => setIssues(data.items.map((iss) => ({
        id: String(iss.id),
        title: iss.title,
        project: iss.project_name || "Unknown project",
        severity: iss.severity as Issue["severity"],
        category: (iss.category === "Performance" || iss.category === "Readability" || iss.category === "Security")
          ? iss.category as Issue["category"]
          : "Best Practice",
        status: iss.status,
        line: iss.line_number,
        created: "-",
        explanation: iss.description,
        suggestedFix: iss.suggested_fix || "",
        relatedReview: String(iss.review_id),
        githubIssueUrl: iss.github_issue_url,
      }))))
      .catch((err) => console.error("Failed to load backend issues", err));
  }, []);

  const [search, setSearch] = useState("");
  const [filterSeverity, setFilterSeverity] = useState<string>("All");
  const [filterStatus, setFilterStatus] = useState<string>("All");
  const [filterCategory, setFilterCategory] = useState<string>("All");
  const [filterProject, setFilterProject] = useState<string>("All");

  const [selectedIssueId, setSelectedIssueId] = useState<string | null>(null);
  const [drawerIssue, setDrawerIssue] = useState<Issue | null>(null);
  const [drawerStatus, setDrawerStatus] = useState<Issue['status']>("Open");

  const [toastMessage, setToastMessage] = useState<string | null>(null);

  useEffect(() => {
    if (selectedIssueId) {
      const issue = issues.find(i => i.id === selectedIssueId);
      if (issue) {
        setDrawerIssue(issue);
        setDrawerStatus(issue.status);
      } else {
        setDrawerIssue(null);
      }
    } else {
      setDrawerIssue(null);
    }
  }, [selectedIssueId, issues]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleUpdateStatus = (status: Issue['status']) => {
    setDrawerStatus(status);
  };

  const handleSaveChanges = async () => {
    if (drawerIssue) {
      await updateIssueStatus(drawerIssue.id, drawerStatus);
      setIssues(prev => prev.map(issue => 
        issue.id === drawerIssue.id 
          ? { ...issue, status: drawerStatus } 
          : issue
      ));
      showToast(`Issue ${drawerIssue.id} updated!`);
      setSelectedIssueId(null);
    }
  };

  const handleDeleteIssue = async (id: string) => {
    if (confirm(`Are you sure you want to delete ${id}?`)) {
      await deleteIssue(id);
      setIssues(prev => prev.filter(issue => issue.id !== id));
      showToast(`Issue ${id} has been deleted.`);
      setSelectedIssueId(null);
    }
  };

  const handleIgnoreIssue = async () => {
    if (drawerIssue) {
      await updateIssueStatus(drawerIssue.id, "Ignored");
      setIssues(prev => prev.map(issue => 
        issue.id === drawerIssue.id 
          ? { ...issue, status: "Ignored" } 
          : issue
      ));
      showToast(`Issue ${drawerIssue.id} ignored.`);
      setSelectedIssueId(null);
    }
  };

  const handleAssignToMe = () => {
    if (drawerIssue) {
      showToast(`Issue ${drawerIssue.id} assigned to you.`);
    }
  };

  const handleCreateGitHubIssue = async () => {
    if (!drawerIssue) return;
    try {
      const profile = await getGitHubProfile();
      if (!profile.connected) {
        showToast("Connect GitHub in Settings first.");
        return;
      }
      const repos = await getGitHubRepos();
      const repo = repos[0]?.full_name;
      if (!repo) {
        showToast("No GitHub repositories available.");
        return;
      }
      const created = await createGitHubIssue(Number(drawerIssue.id), repo);
      setIssues(prev => prev.map(issue =>
        issue.id === drawerIssue.id ? { ...issue, githubIssueUrl: created.issue_url } : issue
      ));
      showToast("GitHub issue created.");
    } catch (err) {
      console.error(err);
      showToast("Failed to create GitHub issue.");
    }
  };

  const handleResetFilters = () => {
    setSearch("");
    setFilterSeverity("All");
    setFilterStatus("All");
    setFilterCategory("All");
    setFilterProject("All");
    showToast("Filters reset to default");
  };

  const filteredIssues = issues.filter(issue => {
    const matchesSearch = issue.title.toLowerCase().includes(search.toLowerCase()) || 
                          issue.id.toLowerCase().includes(search.toLowerCase());
    const matchesSeverity = filterSeverity === "All" || issue.severity === filterSeverity;
    const matchesStatus = filterStatus === "All" || issue.status === filterStatus;
    const matchesCategory = filterCategory === "All" || issue.category === filterCategory;
    const matchesProject = filterProject === "All" || issue.project === filterProject;

    return matchesSearch && matchesSeverity && matchesStatus && matchesCategory && matchesProject;
  });

  const openCount = issues.filter(i => i.status === 'Open').length;
  const inProgressCount = issues.filter(i => i.status === 'In Progress').length;
  const fixedCount = issues.filter(i => i.status === 'Fixed').length;
  const criticalCount = issues.filter(i => i.severity === 'Critical' && i.status !== 'Fixed').length;
  const projectOptions = ["All", ...Array.from(new Set(issues.map((issue) => issue.project))).sort()];

  const severityStyles = {
    Critical: "bg-critical/10 text-critical border border-critical/20",
    High: "bg-high/10 text-high border border-high/20",
    Medium: "bg-medium/10 text-medium border border-medium/20",
    Low: "bg-low/10 text-low border border-low/20"
  };

  const statusStyles = {
    Open: "bg-text-secondary/15 text-text-secondary border border-border",
    "In Progress": "bg-primary/10 text-primary border border-primary/20",
    Fixed: "bg-success/10 text-success border border-success/20",
    Ignored: "bg-text-muted/10 text-text-muted border border-border"
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
          <h1 className="text-xl md:text-2xl font-bold text-text-primary tracking-tight">Bug Tracker</h1>
          <p className="text-[11px] text-text-secondary font-semibold font-sans">
            Trace and prioritize repository code bugs from isolation to resolution.
          </p>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2.5 select-none">
        {[
          { label: "Open", count: openCount, color: "text-text-secondary border-border bg-[#0C0C0E]" },
          { label: "In Progress", count: inProgressCount, color: "text-primary border-primary/20 bg-primary/5" },
          { label: "Fixed", count: fixedCount, color: "text-success border-success/20 bg-success/5" },
          { label: "Critical Active", count: criticalCount, color: "text-critical border-critical/20 bg-critical/5 animate-pulse" }
        ].map((item, idx) => (
          <span 
            key={idx}
            className={`px-3 py-1 rounded-full border text-[10px] font-semibold font-mono tracking-wide flex items-center gap-1.5 shrink-0 ${item.color}`}
          >
            <span>{item.label}:</span>
            <span className="font-bold text-white font-sans">{item.count}</span>
          </span>
        ))}
      </div>

      <div className="p-4 bg-card border border-border rounded-2xl shadow-sm flex flex-col gap-4">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="relative w-full sm:max-w-xs select-text">
            <span className="absolute inset-y-0 left-3 flex items-center pointer-events-none text-text-muted">
              <Search className="w-3.5 h-3.5" />
            </span>
            <input
              type="text"
              placeholder="Search issues by ID or Title..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-[#0C0C0E] border border-border rounded-xl pl-9 pr-4 py-2 text-xs text-text-primary placeholder-text-muted focus:border-primary/50 focus:outline-none transition-all duration-150 font-mono font-medium"
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            {(search || filterSeverity !== "All" || filterStatus !== "All" || filterCategory !== "All" || filterProject !== "All") && (
              <button 
                onClick={handleResetFilters}
                className="px-3 py-2 rounded-xl bg-[#0C0C0E] border border-border text-text-secondary hover:text-white hover:border-primary/20 transition-all duration-150 text-[10px] font-semibold font-mono uppercase tracking-wide cursor-pointer flex items-center gap-1.5 h-8 font-bold"
              >
                <RotateCcw className="w-3 h-3" />
                Clear Filters
              </button>
            )}
            <span className="font-mono text-[9px] text-text-muted uppercase font-bold shrink-0">
              Found {filteredIssues.length} results
            </span>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-3 border-t border-border/50">
          {[
            { label: "Project", val: filterProject, set: setFilterProject, options: projectOptions },
            { label: "Severity", val: filterSeverity, set: setFilterSeverity, options: ["All", "Critical", "High", "Medium", "Low"] },
            { label: "Status", val: filterStatus, set: setFilterStatus, options: ["All", "Open", "In Progress", "Fixed", "Ignored"] },
            { label: "Category", val: filterCategory, set: setFilterCategory, options: ["All", "Security", "Performance", "Best Practice", "Readability"] }
          ].map((drop, idx) => (
            <div key={idx} className="space-y-1 text-left">
              <label className="text-[8px] font-mono text-text-muted uppercase block font-bold tracking-wider">{drop.label}</label>
              <select
                value={drop.val}
                onChange={(e) => drop.set(e.target.value)}
                className="w-full bg-[#0C0C0E] border border-border rounded-xl px-3 py-1.5 text-[10px] font-mono text-text-secondary focus:border-primary/50 focus:outline-none cursor-pointer font-bold"
              >
                {drop.options.map((opt) => (
                  <option key={opt} value={opt} className="bg-[#0C0C0E]">
                    {opt === "All" ? `All ${drop.label}s` : opt}
                  </option>
                ))}
              </select>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-card border border-border rounded-2xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto w-full">
          <table className="w-full border-collapse text-left">
            <thead>
              <tr className="border-b border-border bg-[#0C0C0E]/50">
                <th className="p-4 font-mono text-[9px] text-text-muted uppercase font-bold">Issue</th>
                <th className="p-4 font-mono text-[9px] text-text-muted uppercase font-bold">Project</th>
                <th className="p-4 font-mono text-[9px] text-text-muted uppercase font-bold text-center">Severity</th>
                <th className="p-4 font-mono text-[9px] text-text-muted uppercase font-bold text-center">Category</th>
                <th className="p-4 font-mono text-[9px] text-text-muted uppercase font-bold text-center">Status</th>
                <th className="p-4 font-mono text-[9px] text-text-muted uppercase font-bold text-right">Line</th>
                <th className="p-4 font-mono text-[9px] text-text-muted uppercase font-bold text-right">Created</th>
                <th className="p-4 font-mono text-[9px] text-text-muted uppercase font-bold text-center">Action</th>
              </tr>
            </thead>
            <tbody>
              <AnimatePresence mode="popLayout">
                {filteredIssues.length > 0 ? (
                  filteredIssues.map((issue) => (
                    <motion.tr 
                      key={issue.id}
                      layoutId={`row-${issue.id}`}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.15 }}
                      onClick={() => setSelectedIssueId(issue.id)}
                      className="border-b border-border hover:bg-[#0C0C0E]/40 transition-colors cursor-pointer select-none group relative h-11"
                    >
                      <td className="p-3 pl-4 max-w-xs truncate">
                        <div className="flex items-center gap-2 pr-4 truncate">
                          <span className="font-mono text-[9px] text-primary/80 font-bold shrink-0">{issue.id}</span>
                          <span className="text-xs font-bold text-text-primary group-hover:text-primary transition-colors truncate block">
                            {issue.title}
                          </span>
                        </div>
                      </td>

                      <td className="p-3">
                        <span className="font-mono text-[10px] text-text-secondary font-bold">{issue.project}</span>
                      </td>

                      <td className="p-3 text-center">
                        <span className={`px-2 py-0.5 rounded font-mono text-[8px] font-bold uppercase inline-block ${severityStyles[issue.severity]}`}>
                          {issue.severity}
                        </span>
                      </td>

                      <td className="p-3 text-center">
                        <span className="px-2 py-0.5 rounded bg-[#0C0C0E] border border-border font-mono text-[8px] text-text-secondary inline-block font-semibold">
                          {issue.category}
                        </span>
                      </td>

                      <td className="p-3 text-center">
                        <span className={`px-2 py-0.5 rounded font-mono text-[8px] font-bold uppercase inline-block transition-all duration-150 ${statusStyles[issue.status]}`}>
                          {issue.status}
                        </span>
                      </td>

                      <td className="p-3 text-right">
                        <span className="font-mono text-[10px] text-text-secondary font-semibold">L{issue.line}</span>
                      </td>

                      <td className="p-3 text-right">
                        <span className="font-mono text-[10px] text-text-muted font-semibold">{issue.created}</span>
                      </td>

                      <td className="p-3 text-center" onClick={(e) => e.stopPropagation()}>
                        <button 
                          onClick={() => setSelectedIssueId(issue.id)}
                          className="px-2.5 py-1 rounded-lg bg-[#0C0C0E] border border-border text-text-secondary hover:text-white hover:border-primary/30 transition-all cursor-pointer font-mono text-[9px] uppercase font-bold shrink-0 h-6 flex items-center justify-center gap-1 mx-auto"
                        >
                          <span>Fix</span>
                        </button>
                      </td>
                    </motion.tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={8} className="p-8 text-center text-xs font-mono text-text-muted uppercase font-bold select-none">
                      No matching bugs isolated
                    </td>
                  </tr>
                )}
              </AnimatePresence>
            </tbody>
          </table>
        </div>
      </div>

      <AnimatePresence>
        {selectedIssueId && drawerIssue && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={() => setSelectedIssueId(null)}
              className="fixed inset-0 bg-[#070708]/60 backdrop-blur-sm z-40 select-none"
            />
            
            <motion.div 
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              className="fixed right-0 top-0 bottom-0 w-full max-w-[460px] bg-card border-l border-border shadow-2xl z-50 flex flex-col p-6 overflow-hidden select-none text-left"
            >
              
              <div className="flex items-center justify-between border-b border-border pb-4 mb-5 select-none">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-[9px] text-primary/80 font-bold bg-primary/5 border border-primary/20 px-2 py-0.5 rounded">
                    {drawerIssue.id}
                  </span>
                  <span className="text-[10px] font-mono text-text-muted font-bold uppercase tracking-wider">Bug Telemetry</span>
                </div>
                
                <button 
                  onClick={() => setSelectedIssueId(null)}
                  className="p-1.5 rounded-xl bg-[#0C0C0E] border border-border text-text-secondary hover:text-white hover:border-primary/20 transition-all cursor-pointer"
                  title="Close Inspector"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto space-y-6 pr-1 select-text">
                
                <div className="space-y-2 select-text">
                  <h2 className="text-md font-bold text-text-primary tracking-tight leading-snug">
                    {drawerIssue.title}
                  </h2>
                  
                  <div className="flex flex-wrap items-center gap-2 select-none">
                    <span className={`px-2 py-0.5 rounded font-mono text-[8px] font-bold uppercase ${severityStyles[drawerIssue.severity]}`}>
                      {drawerIssue.severity}
                    </span>
                    <span className="px-2 py-0.5 rounded bg-[#0C0C0E] border border-border font-mono text-[8px] text-text-secondary font-bold">
                      {drawerIssue.category}
                    </span>
                    <span className="px-2 py-0.5 rounded bg-[#0C0C0E] border border-border font-mono text-[8px] text-text-secondary font-bold">
                      Line {drawerIssue.line}
                    </span>
                  </div>
                </div>

                <div className="p-4 bg-[#0C0C0E] border border-border rounded-2xl space-y-2.5 select-none">
                  <label className="text-[9px] font-mono text-text-muted uppercase block font-bold tracking-wider">
                    Workflow Status
                  </label>
                  
                  <div className="flex items-center gap-3">
                    <select
                      value={drawerStatus}
                      onChange={(e) => handleUpdateStatus(e.target.value as Issue['status'])}
                      className="flex-1 bg-background border border-border rounded-xl px-3 py-2 text-xs font-mono text-text-secondary focus:border-primary/50 focus:outline-none cursor-pointer font-bold"
                    >
                      <option value="Open">Open</option>
                      <option value="In Progress">In Progress</option>
                      <option value="Fixed">Fixed</option>
                      <option value="Ignored">Ignored</option>
                    </select>

                    <button
                      onClick={handleSaveChanges}
                      className="px-4 py-2 rounded-xl bg-primary text-black hover:opacity-90 active:scale-[0.98] transition-all font-bold text-[10px] font-mono uppercase tracking-wider flex items-center gap-1.5 cursor-pointer"
                    >
                      <Save className="w-3.5 h-3.5 text-black shrink-0" />
                      Apply
                    </button>
                  </div>
                </div>

                <div className="space-y-3 font-mono text-[10px] text-text-secondary bg-[#0C0C0E]/50 border border-border p-4 rounded-2xl select-none">
                  <div className="flex justify-between items-center">
                    <span className="text-text-muted font-bold">Target Project:</span>
                    <span className="text-text-primary font-bold">{drawerIssue.project}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-text-muted font-bold">Created Date:</span>
                    <span className="text-text-primary font-bold flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-text-muted shrink-0" />
                      {drawerIssue.created}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-text-muted font-bold">Related Review ID:</span>
                    <span className="text-primary font-bold hover:underline cursor-pointer flex items-center gap-0.5">
                      <FileCode className="w-3.5 h-3.5 shrink-0" />
                      {drawerIssue.relatedReview}
                      <ExternalLink className="w-2.5 h-2.5 ml-0.5 shrink-0" />
                    </span>
                  </div>
                </div>

                <div className="p-4 border border-border bg-[#0C0C0E]/20 rounded-2xl select-none flex items-center justify-between gap-4 hover:border-primary/20 transition-all duration-150">
                  <div className="text-left">
                    <span className="text-[10px] font-bold text-white block">Establish Issue in GitHub</span>
                    <span className="text-[8px] text-text-muted block mt-0.5 leading-normal">
                      {drawerIssue.githubIssueUrl ? "GitHub tracker ticket is linked." : "Create and link a tracker ticket directly inside your repo."}
                    </span>
                  </div>
                  <button 
                    onClick={drawerIssue.githubIssueUrl ? () => window.open(drawerIssue.githubIssueUrl || "", "_blank") : handleCreateGitHubIssue}
                    className="px-3 py-1.5 rounded-lg border border-border bg-[#0C0C0E] hover:border-primary/20 text-text-secondary hover:text-white font-mono text-[9px] font-bold uppercase tracking-wide cursor-pointer flex items-center gap-1.5 transition-all shrink-0"
                  >
                    <Github className="w-3.5 h-3.5 shrink-0" />
                    {drawerIssue.githubIssueUrl ? "Open" : "Create"}
                  </button>
                </div>

                <div className="space-y-1.5 text-[11px] leading-relaxed">
                  <span className="text-[9px] font-mono text-text-muted uppercase block font-bold tracking-wider select-none">
                    Issue Explanation
                  </span>
                  <p className="text-text-secondary font-semibold bg-[#0C0C0E]/30 border border-border rounded-2xl p-4 select-text">
                    {drawerIssue.explanation}
                  </p>
                </div>

                <div className="space-y-2 text-[11px] leading-relaxed pb-4">
                  <span className="text-[9px] font-mono text-text-muted uppercase block font-bold tracking-wider select-none">
                    Suggested Remedy Code
                  </span>
                  <div className="bg-[#0C0C0E] border border-border rounded-2xl overflow-hidden shadow-inner">
                    <div className="bg-background px-3 py-1.5 border-b border-border flex justify-between items-center select-none">
                      <span className="font-mono text-[8px] text-primary font-bold uppercase tracking-wider">Remedy Syntax</span>
                      <button 
                        onClick={() => {
                          navigator.clipboard.writeText(drawerIssue.suggestedFix);
                          showToast("Remedy code copied!");
                        }}
                        className="p-1 rounded bg-[#0C0C0E] hover:text-[#FAFAFA] border border-border text-text-secondary transition-colors cursor-pointer"
                        title="Copy Remedy Code"
                      >
                        <Check className="w-2.5 h-2.5 text-primary" />
                      </button>
                    </div>
                    <pre className="p-4 text-text-secondary font-mono text-[9px] overflow-x-auto whitespace-pre select-text text-left leading-normal">
                      <code>{drawerIssue.suggestedFix}</code>
                    </pre>
                  </div>
                </div>

              </div>

              <div className="pt-4 border-t border-border flex items-center gap-2 flex-wrap select-none mt-auto">
                <button
                  onClick={handleAssignToMe}
                  className="flex-1 px-3 py-2.5 rounded-xl bg-[#0C0C0E] border border-border text-text-secondary hover:text-white hover:border-primary/20 transition-all font-bold text-[10px] font-mono uppercase tracking-wide cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <UserPlus className="w-3.5 h-3.5 shrink-0" />
                  Assign Me
                </button>
                <button
                  onClick={handleIgnoreIssue}
                  className="flex-1 px-3 py-2.5 rounded-xl bg-[#0C0C0E] border border-border text-text-secondary hover:text-white hover:border-primary/20 transition-all font-bold text-[10px] font-mono uppercase tracking-wide cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <ShieldX className="w-3.5 h-3.5 shrink-0" />
                  Ignore
                </button>
                <button
                  onClick={() => handleDeleteIssue(drawerIssue.id)}
                  className="px-3.5 py-2.5 rounded-xl bg-red-950/10 border border-red-500/20 text-red-400 hover:bg-red-500/10 hover:border-red-500 transition-all font-bold text-[10px] font-mono uppercase tracking-wide cursor-pointer flex items-center justify-center shrink-0"
                  title="Delete Issue"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>

            </motion.div>
          </>
        )}
      </AnimatePresence>

    </div>
  );
};

export default BugTrackerPage;
