import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Topbar } from './Topbar';
import { healthCheck } from '../../services/api';
import { HealthOverviewCard } from './HealthOverviewCard';
import { CriticalQueue } from './CriticalQueue';
import { StatCards } from './StatCards';
import { SeverityBreakdown } from './SeverityBreakdown';
import { RecentReviewsTable } from './RecentReviewsTable';
import { ReviewActivityChart } from './ReviewActivityChart';
import { ScannerCoverageCard } from './ScannerCoverageCard';
import { NewReviewPage } from './NewReviewPage';
import { ReviewResultPage } from './ReviewResultPage';
import { BugTrackerPage } from './BugTrackerPage';
import { ReviewHistoryPage } from './ReviewHistoryPage';
import { SettingsPage } from './SettingsPage';
import { Sparkles } from 'lucide-react';
import { GridBackground } from '../ui/grid-background';
import { getDashboardStats } from '../../services/dashboardService';

interface DashboardPageProps {
  onExit: () => void;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({ onExit }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const getTabFromPath = (path: string) => {
    if (path.startsWith('/reviews/')) return "Review Report";
    if (path === '/new-review') return "New Review";
    if (path === '/issues') return "Bug Tracker";
    if (path === '/history') return "History";
    if (path === '/settings' || path === '/sessions') return "Settings";
    return "Dashboard";
  };

  const getPathFromTab = (tab: string) => {
    if (tab === "Review Report") {
      if (location.pathname.startsWith('/reviews/')) return location.pathname;
      return "/reviews/current";
    }
    if (tab === "New Review") return "/new-review";
    if (tab === "Bug Tracker") return "/issues";
    if (tab === "History") return "/history";
    if (tab === "Settings") return "/settings";
    return "/dashboard";
  };

  const [currentTab, setCurrentTab] = useState(() => getTabFromPath(location.pathname));

  useEffect(() => {
    setCurrentTab(getTabFromPath(location.pathname));
  }, [location.pathname]);

  const handleTabChange = (tab: string) => {
    setCurrentTab(tab);
    navigate(getPathFromTab(tab));
  };

  const [isScannerOnline, setIsScannerOnline] = useState<boolean>(true);

  useEffect(() => {
    const runCheck = async () => {
      const online = await healthCheck();
      setIsScannerOnline(online);
    };
    runCheck();
    const timer = setInterval(runCheck, 5000);
    return () => clearInterval(timer);
  }, []);
  const [theme, setTheme] = useState<'dark' | 'light' | 'system'>(() => {
    return (localStorage.getItem('kodeye-theme') as any) || 'dark';
  });

  const resolvedTheme = React.useMemo(() => {
    if (theme === 'system') {
      return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }
    return theme;
  }, [theme]);
  
  const [reviewsList, setReviewsList] = useState<Array<{
    id?: string;
    project: string;
    lang: string;
    score: number;
    issues: number;
    date: string;
    status: string;
    colorClass: string;
  }>>([]);

  const mapReviewRow = (review: any) => ({
    id: String(review.id),
    project: review.project_name,
    lang: review.language,
    score: review.score,
    issues: review.issues_count || 0,
    date: review.created_at?.split('T')[0] || "-",
    status: review.score >= 90 ? "Clean" : review.score >= 75 ? "Issues" : "Critical",
    colorClass: review.score >= 90 ? "text-primary border-primary/20 bg-primary/5" :
      review.score >= 75 ? "text-yellow-400 border-yellow-500/20 bg-yellow-500/5" :
      "text-red-400 border-red-500/20 bg-red-500/5"
  });

  useEffect(() => {
    const loadStats = async () => {
      try {
        const stats = await getDashboardStats();
        setReviewsList(stats.recent_reviews.length ? stats.recent_reviews.map(mapReviewRow) : []);
      } catch (err) {
        console.error("Failed to load dashboard stats", err);
      }
    };
    loadStats();
  }, []);

  const handleReviewComplete = (newReview: {
    project: string;
    lang: string;
    score: number;
    issues: number;
    date: string;
    status: string;
    colorClass: string;
  }) => {
    setReviewsList((prev) => [newReview, ...prev]);
    setCurrentTab("Review Report");
  };

  return (
    <GridBackground className={`h-screen w-screen font-sans select-none ${resolvedTheme === 'light' ? 'light text-text-primary bg-background' : 'dark text-white bg-background'}`}>
      
      <Sidebar 
        currentTab={currentTab} 
        onTabChange={handleTabChange} 
        onExit={onExit} 
      />

      <div className="flex-1 flex flex-col h-full overflow-hidden">
        
        <Topbar currentTab={currentTab} isScannerOnline={isScannerOnline} />

        <main className="flex-1 overflow-y-auto p-8 space-y-6">
          
          {currentTab === "New Review" ? (
            <NewReviewPage 
              onReviewComplete={handleReviewComplete}
              onExit={() => setCurrentTab("Dashboard")}
              isScannerOnline={isScannerOnline}
            />
          ) : currentTab === "Review Report" ? (
            <ReviewResultPage 
              onBackToDashboard={() => setCurrentTab("Dashboard")}
              onReanalyze={() => setCurrentTab("New Review")}
            />
          ) : currentTab === "Bug Tracker" ? (
            <BugTrackerPage />
          ) : currentTab === "History" ? (
            <ReviewHistoryPage 
              onViewReport={() => setCurrentTab("Review Report")}
              onStartReview={() => setCurrentTab("New Review")}
            />
          ) : currentTab === "Settings" ? (
            <SettingsPage 
              theme={theme} 
              onThemeChange={setTheme} 
              initialSection={location.pathname === '/sessions' ? 'security' : 'profile'}
            />
          ) : currentTab === "Dashboard" ? (
            <>
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 select-none">
                <div>
                  <h1 className="text-xl md:text-2xl font-bold text-white tracking-tight">Workspace Overview</h1>
                  <p className="text-[11px] text-text-secondary mt-1 font-semibold">Track code quality and security patches across your active branches.</p>
                </div>
                <div className={`font-mono text-[9px] bg-card border border-border px-3 py-1.5 rounded-xl uppercase tracking-widest select-none font-bold flex items-center gap-1.5 ${isScannerOnline ? "text-primary" : "text-red-400 animate-pulse"}`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${isScannerOnline ? "bg-success shadow-[0_0_6px_rgba(0,229,255,0.4)]" : "bg-red-500 animate-pulse"}`} />
                  <span>Telemetry Live: {isScannerOnline ? "OK" : "OFFLINE"}</span>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 w-full">
                <div className="lg:col-span-2 w-full flex">
                  <HealthOverviewCard onNewReviewClick={() => setCurrentTab("New Review")} />
                </div>
                <div className="lg:col-span-1 w-full flex">
                  <CriticalQueue onInvestigateClick={() => setCurrentTab("Bug Tracker")} />
                </div>
              </div>

              <StatCards />

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 w-full">
                <div className="lg:col-span-8 w-full flex">
                  <RecentReviewsTable 
                    reviews={reviewsList} 
                    onViewReportClick={(reviewId) => {
                      setCurrentTab("Review Report");
                      navigate(reviewId ? `/reviews/${reviewId}` : "/history");
                    }}
                  />
                </div>
                <div className="lg:col-span-4 w-full flex">
                  <SeverityBreakdown />
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 w-full">
                <div className="lg:col-span-8 w-full flex">
                  <ReviewActivityChart />
                </div>
                <div className="lg:col-span-4 w-full flex">
                  <ScannerCoverageCard />
                </div>
              </div>
            </>
          ) : (
            <div className="h-[450px] w-full bg-[#0A0A0B]/85 backdrop-blur-2xl rounded-2xl border border-border flex flex-col items-center justify-center p-8 relative overflow-hidden select-none">
              <div className="space-y-6 text-center z-10 max-w-[300px]">
                <div className="relative w-12 h-12 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shadow-[0_0_20px_rgba(0,229,255,0.1)] mx-auto animate-pulse">
                  <Sparkles className="w-5 h-5" />
                </div>
                
                <h3 className="text-sm font-bold text-white font-mono uppercase tracking-widest">{currentTab} Page</h3>
                <p className="text-[11px] text-text-secondary leading-relaxed font-semibold">This view is sandbox-encrypted. Check back later for real-time telemetry feeds.</p>
                <button 
                  onClick={() => setCurrentTab("Dashboard")}
                  className="px-4 py-2 rounded-lg bg-card border border-border text-text-secondary hover:text-white hover:border-primary/30 transition-all duration-150 text-xs font-semibold cursor-pointer font-mono uppercase"
                >
                  Back to Dashboard
                </button>
              </div>
            </div>
          )}

        </main>

      </div>

    </GridBackground>
  );
};

export default DashboardPage;
