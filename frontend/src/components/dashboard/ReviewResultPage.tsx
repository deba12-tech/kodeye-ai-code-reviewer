import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ShieldAlert, AlertTriangle, AlertCircle, Info, 
  Play, Download, ArrowLeft, Check, Copy, 
  ShieldCheck, FileCode, Sparkles, ChevronRight
} from 'lucide-react';
import { jsPDF } from 'jspdf';
import { getReview, type ReviewResponse } from '../../services/reviewService';

interface ReviewResultPageProps {
  onBackToDashboard: () => void;
  onReanalyze: () => void;
}

export const ReviewResultPage: React.FC<ReviewResultPageProps> = ({ 
  onBackToDashboard, 
  onReanalyze 
}) => {
  const { id } = useParams<{ id: string }>();
  const [backendReview, setBackendReview] = useState<ReviewResponse | null>(null);
  const [isLoadingReview, setIsLoadingReview] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    if (id && id !== "current") {
      setIsLoadingReview(true);
      setLoadError(null);
      getReview(id)
        .then(setBackendReview)
        .catch((err) => {
          console.error("Failed to load backend review", err);
          setLoadError("Unable to load this review from the backend.");
        })
        .finally(() => setIsLoadingReview(false));
    } else {
      setBackendReview(null);
      setLoadError("Select a saved backend review from History to inspect a report.");
    }
  }, [id]);

  const finalReview = backendReview;

  const targetScore = finalReview?.score ?? 0;
  const [score, setScore] = useState(0);

  const [copiedId, setCopiedId] = useState<string | null>(null);

  const [expandedIssue, setExpandedIssue] = useState<number | null>(null);

  const [toastMessage, setToastMessage] = useState<string | null>(null);

  useEffect(() => {
    if (targetScore <= 0) {
      setScore(0);
      return;
    }
    const duration = 800;
    const stepTime = Math.abs(Math.floor(duration / targetScore));
    let current = 0;
    const timer = setInterval(() => {
      current += 1;
      setScore(current);
      if (current >= targetScore) {
        clearInterval(timer);
      }
    }, stepTime);

    return () => clearInterval(timer);
  }, [targetScore]);

  const handleCopyCode = (codeText: string, id: string) => {
    navigator.clipboard.writeText(codeText);
    setCopiedId(id);
    showToast("Copied to clipboard");
    setTimeout(() => setCopiedId(null), 2000);
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const criticalCount = finalReview?.issues.filter((i: any) => i.severity === "Critical").length ?? 0;
  const highCount = finalReview?.issues.filter((i: any) => i.severity === "High").length ?? 0;
  const mediumCount = finalReview?.issues.filter((i: any) => i.severity === "Medium").length ?? 0;
  const lowCount = finalReview?.issues.filter((i: any) => i.severity === "Low").length ?? 0;

  const severities = [
    { label: "Critical", count: criticalCount, color: "text-red-400 border-red-500/20 bg-red-500/5", icon: <ShieldAlert className="w-3.5 h-3.5" /> },
    { label: "High", count: highCount, color: "text-orange-400 border-orange-500/20 bg-orange-500/5", icon: <AlertTriangle className="w-3.5 h-3.5" /> },
    { label: "Medium", count: mediumCount, color: "text-yellow-400 border-yellow-500/20 bg-yellow-500/5", icon: <AlertCircle className="w-3.5 h-3.5" /> },
    { label: "Low", count: lowCount, color: "text-blue-400 border-border bg-[#0C0C0E]", icon: <Info className="w-3.5 h-3.5" /> }
  ];

  const issues = React.useMemo(() => {
    if (!finalReview) return [];

    return finalReview.issues.map((issue: any, index: number) => {
      const lineNum = issue.line_number;

      return {
        id: index + 1,
        title: issue.title,
        severity: issue.severity,
        category: issue.category,
        line: lineNum,
        explanation: issue.description,
        suggestedFix: issue.suggested_fix,
        beforeCode: "Original source context is stored in the backend scan result only when provided by the API.",
        afterCode: issue.fixed_code || "// Fixed code recommendation"
      };
    });
  }, [finalReview]);

  const completeImprovedCode = finalReview?.improved_code ?? "";

  if (!finalReview) {
    return (
      <div className="min-h-[420px] bg-card border border-border rounded-2xl flex flex-col items-center justify-center p-8 text-center select-none">
        <FileCode className="w-8 h-8 text-text-muted mb-4" />
        <h1 className="text-sm font-bold text-white font-mono uppercase tracking-wider">
          {isLoadingReview ? "Loading backend review" : "Review unavailable"}
        </h1>
        <p className="text-[11px] text-text-secondary mt-2 max-w-sm font-semibold">
          {isLoadingReview ? "Fetching the report from the API." : loadError}
        </p>
        <button
          onClick={onBackToDashboard}
          className="mt-5 px-4 py-2 rounded-lg bg-[#0C0C0E] border border-border text-text-secondary hover:text-white hover:border-primary/30 transition-all duration-150 text-xs font-semibold cursor-pointer font-mono uppercase"
        >
          Back to Dashboard
        </button>
      </div>
    );
  }

  const exportToPDF = () => {
    try {
      const doc = new jsPDF();
      
      const margin = 20;
      const width = 170;
      let y = 20;
      
      const checkNewPage = (heightNeeded: number) => {
        if (y + heightNeeded > 270) {
          doc.addPage();
          doc.setFont("helvetica", "normal");
          doc.setFontSize(8);
          doc.setTextColor(150, 150, 150);
          doc.text("KODEYE - Code Audit Report", margin, 12);
          doc.text(`Page ${doc.getNumberOfPages()}`, 190, 12, { align: "right" });
          doc.setDrawColor(220, 220, 220);
          doc.line(margin, 14, 190, 14);
          y = 25;
        }
      };

      doc.setFillColor(12, 12, 14);
      doc.rect(margin, y, width, 25, "F");
      
      doc.setFont("helvetica", "bold");
      doc.setFontSize(16);
      doc.setTextColor(0, 229, 255);
      doc.text("KODEYE", margin + 6, y + 10);
      
      doc.setFont("helvetica", "normal");
      doc.setFontSize(9);
      doc.setTextColor(255, 255, 255);
      doc.text("AI-POWERED TELEMETRY AUDIT REPORT", margin + 6, y + 17);
      
      y += 33;
      
      checkNewPage(45);
      doc.setDrawColor(230, 230, 230);
      doc.setFillColor(248, 249, 250);
      doc.rect(margin, y, width, 40, "FD");
      
      doc.setFont("helvetica", "bold");
      doc.setFontSize(11);
      doc.setTextColor(33, 37, 41);
      doc.text(`Project Name: ${finalReview.project_name}`, margin + 8, y + 10);
      doc.text(`Language: ${finalReview.language}`, margin + 8, y + 18);
      
      const dateStr = new Date().toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric"
      });
      doc.text(`Audit Date: ${dateStr}`, margin + 8, y + 26);
      
      doc.setFillColor(0, 229, 255);
      doc.rect(margin + 120, y + 5, 42, 30, "F");
      
      doc.setFont("helvetica", "bold");
      doc.setFontSize(22);
      doc.setTextColor(12, 12, 14);
      doc.text(`${targetScore}`, margin + 141, y + 21, { align: "center" });
      
      doc.setFontSize(8);
      doc.text("QUALITY SCORE", margin + 141, y + 28, { align: "center" });
      
      y += 48;
      
      checkNewPage(30);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(12);
      doc.setTextColor(33, 37, 41);
      doc.text("Executive Summary", margin, y);
      
      doc.setFont("helvetica", "normal");
      doc.setFontSize(10);
      doc.setTextColor(73, 80, 87);
      y += 6;
      const summaryLines = doc.splitTextToSize(finalReview.summary, width);
      doc.text(summaryLines, margin, y);
      y += (summaryLines.length * 5) + 6;
      
      checkNewPage(25);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(12);
      doc.setTextColor(33, 37, 41);
      doc.text("Diagnostics Severity Breakdown", margin, y);
      
      y += 6;
      doc.setFillColor(240, 240, 240);
      doc.rect(margin, y, width, 10, "F");
      doc.setFont("helvetica", "bold");
      doc.setFontSize(9);
      doc.text("CRITICAL", margin + 5, y + 7);
      doc.text("HIGH", margin + 45, y + 7);
      doc.text("MEDIUM", margin + 85, y + 7);
      doc.text("LOW", margin + 125, y + 7);
      
      y += 10;
      doc.setFont("helvetica", "normal");
      doc.text(`${criticalCount} Issue(s)`, margin + 5, y + 7);
      doc.text(`${highCount} Issue(s)`, margin + 45, y + 7);
      doc.text(`${mediumCount} Issue(s)`, margin + 85, y + 7);
      doc.text(`${lowCount} Issue(s)`, margin + 125, y + 7);
      y += 18;
      
      checkNewPage(15);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(13);
      doc.setTextColor(33, 37, 41);
      doc.text("Detailed Diagnostic Findings", margin, y);
      doc.line(margin, y + 2, 190, y + 2);
      
      y += 10;
      
      finalReview.issues.forEach((issue: any) => {
        const explLines = doc.splitTextToSize(`Analysis: ${issue.description}`, width);
        const fixLines = doc.splitTextToSize(`Remedy: ${issue.suggested_fix}`, width);
        const totalHeight = 15 + (explLines.length * 5) + (fixLines.length * 5) + 10;
        
        checkNewPage(totalHeight);
        
        doc.setFillColor(248, 249, 250);
        doc.rect(margin, y, width, 6, "F");
        
        doc.setFont("helvetica", "bold");
        doc.setFontSize(10);
        
        if (issue.severity === "Critical") doc.setTextColor(220, 53, 69);
        else if (issue.severity === "High") doc.setTextColor(253, 126, 20);
        else if (issue.severity === "Medium") doc.setTextColor(255, 193, 7);
        else doc.setTextColor(13, 110, 253);
        
        doc.text(`[${issue.severity.toUpperCase()}] ${issue.title}`, margin + 4, y + 4.5);
        
        doc.setFont("helvetica", "normal");
        doc.setFontSize(9);
        doc.setTextColor(100, 100, 100);
        doc.text(`Category: ${issue.category}  |  Line: ${issue.line_number}`, margin + 100, y + 4.5);
        
        y += 10;
        
        doc.setTextColor(73, 80, 87);
        doc.text(explLines, margin + 4, y);
        y += (explLines.length * 5) + 2;
        
        doc.text(fixLines, margin + 4, y);
        y += (fixLines.length * 5) + 6;
      });
      
      y += 5;
      checkNewPage(25);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(13);
      doc.setTextColor(33, 37, 41);
      doc.text("Audited & Improved Code", margin, y);
      doc.line(margin, y + 2, 190, y + 2);
      
      y += 8;
      
      doc.setFont("courier", "normal");
      doc.setFontSize(8.5);
      doc.setTextColor(50, 50, 50);
      
      const rawLines = finalReview.improved_code.split("\n");
      
      rawLines.forEach((lineText: string) => {
        checkNewPage(7);
        doc.text(lineText, margin + 4, y);
        y += 4.5;
      });
      
      const totalPages = doc.getNumberOfPages();
      for (let i = 1; i <= totalPages; i++) {
        doc.setPage(i);
        doc.setFont("helvetica", "normal");
        doc.setFontSize(7.5);
        doc.setTextColor(150, 150, 150);
        doc.text("CONFIDENTIAL - FOR EMPLOYMENT & REVIEW PURPOSES ONLY", 105, 288, { align: "center" });
        doc.text(`Generated by Kodeye AI platform on ${dateStr}`, margin, 288);
        doc.text(`Page ${i} of ${totalPages}`, 190, 288, { align: "right" });
      }
      
      doc.save(`Kodeye_Audit_Report_${finalReview.project_name}.pdf`);
      showToast("Report exported successfully as PDF!");
    } catch (err) {
      console.error(err);
      showToast("Failed to generate PDF report.");
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
            className="fixed top-6 right-6 z-50 bg-[#0C0C0E] border border-primary/30 text-primary px-4 py-2.5 rounded-xl shadow-2xl flex items-center gap-2 font-mono text-[10px] uppercase font-bold"
          >
            <Check className="w-3.5 h-3.5 shrink-0" />
            {toastMessage}
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-border pb-5">
        <div className="space-y-0.5 text-left">
          <div className="flex items-center gap-2 select-none">
            <span className="font-mono text-[9px] text-primary font-bold uppercase tracking-widest bg-primary/5 border border-primary/20 px-2 py-0.5 rounded">
              Telemetry Audit Report
            </span>
          </div>
          <h1 className="text-xl md:text-2xl font-bold text-white tracking-tight">Review Report: {finalReview.project_name}</h1>
          <p className="text-[11px] text-text-secondary font-semibold font-sans">
            Kodeye analyzed your branch code and detected critical quality and security vulnerabilities.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button 
            onClick={onReanalyze}
            className="px-4 py-2 rounded-xl bg-card border border-border text-text-secondary hover:text-white hover:border-primary/20 transition-all duration-150 text-xs font-mono uppercase tracking-wide cursor-pointer flex items-center gap-1.5 h-9"
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            Re-analyze
          </button>
          <button 
            onClick={exportToPDF}
            className="px-4 py-2 rounded-xl bg-card border border-border text-text-secondary hover:text-white hover:border-primary/20 transition-all duration-150 text-xs font-mono uppercase tracking-wide cursor-pointer flex items-center gap-1.5 h-9"
          >
            <Download className="w-3.5 h-3.5" />
            Export Report
          </button>
          <button 
            onClick={onBackToDashboard}
            className="px-4 py-2 rounded-xl bg-primary text-black hover:opacity-90 active:scale-[0.98] transition-all duration-150 text-xs font-mono uppercase tracking-wide cursor-pointer flex items-center gap-1.5 font-bold h-9"
          >
            <ArrowLeft className="w-3.5 h-3.5 text-black" />
            Dashboard
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 w-full">
        
        <div className="lg:col-span-4 bg-card border border-border rounded-2xl p-6 shadow-md flex flex-col items-center justify-between h-[260px] inner-glow-card relative overflow-hidden transition-all duration-300 hover:border-primary/20">
          <div className="w-full flex justify-between items-center select-none">
            <span className="text-[9px] font-mono tracking-widest text-text-muted uppercase font-bold">Overall Quality</span>
            <div className="w-1.5 h-1.5 rounded-full bg-yellow-400 animate-pulse" />
          </div>

          <div className="relative w-28 h-28 flex items-center justify-center select-none">
            <svg className="w-28 h-28 transform -rotate-90">
              <circle 
                cx="56" 
                cy="56" 
                r="46" 
                className="stroke-[#0C0C0E]" 
                strokeWidth="5" 
                fill="transparent" 
              />
              <motion.circle 
                cx="56" 
                cy="56" 
                r="46" 
                className="stroke-primary" 
                strokeWidth="5" 
                fill="transparent"
                strokeLinecap="round"
                initial={{ strokeDasharray: 289.02, strokeDashoffset: 289.02 }}
                animate={{ strokeDashoffset: 289.02 - (289.02 * targetScore) / 100 }}
                transition={{ duration: 1, ease: "easeOut" }}
                style={{
                  strokeDasharray: 289.02
                }}
              />
            </svg>
            <div className="absolute flex flex-col items-center select-none">
              <span className="font-mono text-2xl font-black text-white tracking-tight leading-none">
                {score}
              </span>
              <span className="text-[7px] text-text-muted font-bold tracking-widest mt-1 uppercase">
                / 100
              </span>
            </div>
          </div>

          <div className="text-center space-y-0.5">
            <span className="font-mono text-[9px] text-primary uppercase font-bold tracking-widest block">
              Good Standing
            </span>
            <span className="text-[10px] font-semibold text-text-secondary block">
              needs security hardening.
            </span>
          </div>
        </div>

        <div className="lg:col-span-8 flex flex-col justify-between gap-4 h-auto lg:h-[260px]">
          <div className="flex-1 bg-card border border-border rounded-2xl p-5 shadow-md flex items-start gap-4 inner-glow-card relative overflow-hidden transition-all duration-300 hover:border-primary/20">
            <div className="p-2 rounded-xl bg-primary/10 border border-primary/20 text-primary shrink-0">
              <Sparkles className="w-4 h-4" />
            </div>
            <div className="space-y-1.5 flex-1 text-left">
              <div className="flex items-center justify-between select-none">
                <h3 className="text-[10px] font-mono font-bold text-white uppercase tracking-wider">AI Audit Overview</h3>
                <span className="text-[7px] font-mono text-primary font-bold uppercase tracking-widest px-2 py-0.5 rounded bg-primary/5 border border-primary/20">
                  Ready to Patch
                </span>
              </div>
              <p className="text-[11px] text-text-secondary leading-relaxed font-semibold font-sans">
                {finalReview.summary}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 w-full select-none">
            {severities.map((item, idx) => (
              <div 
                key={idx}
                className={`bg-card border border-border rounded-xl p-3.5 flex items-center justify-between inner-glow-card transition-all duration-150 hover:bg-[#121215]`}
              >
                <div className="space-y-0.5 text-left">
                  <span className="text-[9px] font-mono text-text-muted uppercase block font-bold">
                    {item.label}
                  </span>
                  <span className="font-mono text-base font-black text-white tracking-tight leading-none">
                    {item.count}
                  </span>
                </div>
                <div className={`p-2 rounded-lg bg-[#0C0C0E] border ${item.color} shrink-0`}>
                  {item.icon}
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 w-full pt-2">
        
        <div className="lg:col-span-7 space-y-4">
          <div className="flex items-center justify-between pb-1.5 border-b border-border select-none">
            <h3 className="text-[10px] font-mono font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
              <ShieldAlert className="w-4 h-4 text-primary shrink-0" />
              Priority Fixes (Issues 1-{Math.min(3, issues.length)})
            </h3>
            <span className="font-mono text-[8px] text-text-muted font-bold uppercase">Actions Required</span>
          </div>

          <div className="space-y-3">
            {issues.slice(0, 3).map((issue: any, idx: number) => {
              const isExpanded = expandedIssue === idx;
              return (
                <div
                  key={issue.id}
                  className={`border rounded-2xl overflow-hidden transition-all duration-150 shadow-md ${
                    isExpanded 
                      ? 'border-primary/20 bg-card' 
                      : 'border-border bg-card/40 hover:border-card-foreground/10 hover:bg-card/60'
                  }`}
                >
                  <div 
                    onClick={() => setExpandedIssue(isExpanded ? null : idx)}
                    className="p-4 flex items-center justify-between cursor-pointer select-none"
                  >
                    <div className="flex items-center gap-3 pr-4 truncate">
                      <div className={`w-1.5 h-1.5 rounded-full shrink-0 ${
                        issue.severity === 'Critical' ? 'bg-critical shadow-[0_0_6px_rgba(239,68,68,0.4)]' :
                        issue.severity === 'High' ? 'bg-high' : 'bg-medium'
                      }`} />
                      <div className="text-left truncate">
                        <h4 className="text-xs font-bold text-white leading-tight truncate hover:text-primary transition-colors">
                          {issue.title}
                        </h4>
                        <div className="flex items-center gap-2 font-mono text-[9px] text-text-muted mt-0.5">
                          <span>Line {issue.line}</span>
                          <span>•</span>
                          <span className="text-primary font-bold">{issue.category}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <span className={`px-2 py-0.5 rounded font-mono text-[7px] font-bold uppercase ${
                        issue.severity === 'Critical' ? 'bg-critical/10 text-critical border border-critical/20' :
                        issue.severity === 'High' ? 'bg-high/10 text-high border border-high/20' :
                        'bg-medium/10 text-medium border border-medium/20'
                      }`}>
                        {issue.severity}
                      </span>
                      <ChevronRight className={`w-3.5 h-3.5 text-text-muted transition-transform duration-150 ${
                        isExpanded ? 'rotate-90 text-primary' : ''
                      }`} />
                    </div>
                  </div>

                  <AnimatePresence initial={false}>
                    {isExpanded && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.15 }}
                        className="border-t border-border/50 bg-[#0C0C0E]/50"
                      >
                        <div className="p-4 space-y-4 text-xs leading-normal">
                          <div className="space-y-1 text-left">
                            <span className="text-[8px] font-mono text-text-muted font-bold uppercase tracking-wider block">
                              Vulnerability Analysis
                            </span>
                            <p className="text-text-secondary font-semibold">
                              {issue.explanation}
                            </p>
                          </div>

                          <div className="space-y-1 text-left">
                            <span className="text-[8px] font-mono text-text-muted font-bold uppercase tracking-wider block">
                              Suggested Remedy
                            </span>
                            <p className="text-text-secondary font-semibold">
                              {issue.suggestedFix}
                            </p>
                          </div>

                          <div className="space-y-2 pt-1 text-left">
                            <span className="text-[8px] font-mono text-text-muted font-bold uppercase tracking-wider block">
                              AST Comparison Diff
                            </span>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 w-full font-mono text-[9px]">
                              <div className="rounded-xl border border-critical/20 overflow-hidden flex flex-col bg-[#070708]">
                                <div className="bg-critical/5 px-3 py-1.5 border-b border-critical/10 flex justify-between items-center select-none">
                                  <span className="font-mono text-[8px] text-critical font-bold uppercase tracking-wider">Before Patch</span>
                                  <span className="font-mono text-[8px] text-text-muted">Line {issue.line}</span>
                                </div>
                                <pre className="p-3 text-text-secondary/70 overflow-x-auto whitespace-pre select-text text-left leading-normal font-mono">
                                  <code>{issue.beforeCode}</code>
                                </pre>
                              </div>

                              <div className="rounded-xl border border-primary/20 overflow-hidden flex flex-col bg-[#070708] relative group">
                                <div className="bg-primary/5 px-3 py-1.5 border-b border-primary/10 flex justify-between items-center select-none">
                                  <span className="font-mono text-[8px] text-primary font-bold uppercase tracking-wider">Suggested Fix</span>
                                  <button 
                                    onClick={() => handleCopyCode(issue.afterCode, `issue-${issue.id}`)}
                                    className="p-1 rounded bg-[#0C0C0E] hover:text-white border border-border text-text-secondary hover:border-primary/20 transition-all cursor-pointer"
                                    title="Copy Code"
                                  >
                                    {copiedId === `issue-${issue.id}` ? (
                                      <Check className="w-2.5 h-2.5 text-primary" />
                                    ) : (
                                      <Copy className="w-2.5 h-2.5" />
                                    )}
                                  </button>
                                </div>
                                <pre className="p-3 text-white overflow-x-auto whitespace-pre select-text text-left leading-normal font-mono">
                                  <code>{issue.afterCode}</code>
                                </pre>
                              </div>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>
        </div>

        <div className="lg:col-span-5 space-y-4">
          <div className="flex items-center justify-between pb-1.5 border-b border-border select-none">
            <h3 className="text-[10px] font-mono font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
              <FileCode className="w-4 h-4 text-primary shrink-0" />
              Improved File View
            </h3>
            <span className="font-mono text-[8px] text-text-muted font-bold uppercase">verifySession.ts</span>
          </div>

          <div className="w-full rounded-2xl border border-primary/10 bg-[#0C0C0E] shadow-[0_24px_80px_rgba(0,0,0,0.6)] overflow-hidden flex flex-col inner-glow-card h-[430px]">
            <div className="h-10 border-b border-border bg-card/25 flex items-center px-4 justify-between select-none">
              <div className="flex gap-1.5 shrink-0">
                <div className="w-2.5 h-2.5 rounded-full bg-red-500/40" />
                <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/40" />
                <div className="w-2.5 h-2.5 rounded-full bg-green-500/40" />
              </div>
              <div className="flex items-center gap-1.5 bg-[#0C0C0E] border border-border border-b-transparent px-3 py-1 rounded-t-lg -mb-2 mt-2">
                <FileCode className="w-3 h-3 text-primary" />
                <span className="font-mono text-[9px] text-white font-bold">verifySession.ts</span>
              </div>
              <button 
                onClick={() => handleCopyCode(completeImprovedCode, 'full-code')}
                className="px-2.5 py-1 rounded-lg bg-[#070708] hover:text-white border border-border text-text-secondary hover:border-primary/20 transition-all font-mono text-[8px] uppercase tracking-wide cursor-pointer flex items-center gap-1 shrink-0 font-bold"
              >
                {copiedId === 'full-code' ? "Copied" : "Copy"}
              </button>
            </div>

            <div className="flex-1 font-mono text-[9px] leading-relaxed relative bg-[#0C0C0E] overflow-y-auto overflow-x-auto p-4 dark-grid-bg-fine select-text">
              <pre className="text-text-secondary whitespace-pre text-left font-mono leading-normal">
                {completeImprovedCode.split('\n').map((lineText: string, index: number) => {
                  const isFixedLine = lineText.includes('FIXED:');
                  return (
                    <div 
                      key={index} 
                      className={`flex w-full select-text py-0.5 px-1 rounded transition-colors ${
                        isFixedLine ? 'bg-primary/5 text-white font-semibold border-l-2 border-primary' : ''
                      }`}
                    >
                      <span className="w-6 text-text-muted/20 select-none pr-2.5 text-right shrink-0 font-mono font-bold">{index + 1}</span>
                      <code className="flex-1 select-text whitespace-pre font-mono leading-normal">{lineText}</code>
                    </div>
                  );
                })}
              </pre>
            </div>
            
            <div className="h-8 border-t border-border/50 bg-[#070708] flex items-center justify-between px-4 font-mono text-[8px] text-text-muted/30 select-none font-bold">
              <span>{finalReview.language} • UTF-8</span>
              <span className="flex items-center gap-1 text-primary/80 uppercase font-bold">
                <ShieldCheck className="w-3.5 h-3.5 text-primary shrink-0" />
                Audit Passed
              </span>
            </div>
          </div>
        </div>

      </div>

      <div className="space-y-4 pt-2">
        <div className="pb-1 border-b border-border select-none text-left">
          <h3 className="text-[10px] font-mono font-bold text-white uppercase tracking-wider">
            All Code Diagnostics
          </h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {issues.map((issue: any) => (
            <div 
              key={issue.id}
              className="p-4 border border-border bg-card rounded-xl hover:border-card-foreground/10 hover:bg-card/80 transition-all duration-150 shadow-md text-left flex items-start justify-between gap-4"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${
                    issue.severity === 'Critical' ? 'bg-critical' :
                    issue.severity === 'High' ? 'bg-high' :
                    issue.severity === 'Medium' ? 'bg-medium' : 'bg-low'
                  }`} />
                  <h4 className="text-xs font-bold text-white truncate max-w-[200px]">{issue.title}</h4>
                </div>
                <p className="text-[10px] text-text-secondary font-semibold leading-relaxed line-clamp-2">
                  {issue.explanation}
                </p>
                <div className="font-mono text-[8px] text-text-muted pt-1 font-bold uppercase tracking-wider">
                  Line {issue.line} • <span className="text-primary">{issue.category}</span>
                </div>
              </div>

              <span className={`px-2 py-0.5 rounded font-mono text-[7px] font-bold uppercase shrink-0 ${
                issue.severity === 'Critical' ? 'bg-critical/10 text-critical border border-critical/20' :
                issue.severity === 'High' ? 'bg-high/10 text-high border border-high/20' :
                issue.severity === 'Medium' ? 'bg-medium/10 text-medium border border-medium/20' :
                'bg-low/10 text-low border border-low/20'
              }`}>
                {issue.severity}
              </span>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};

export default ReviewResultPage;
