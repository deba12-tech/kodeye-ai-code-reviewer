import * as React from 'react';
import { motion } from 'framer-motion';
import { 
  LayoutDashboard, 
  TrendingUp, 
  Users, 
  DollarSign, 
  Activity,
  ArrowUpRight,
  ArrowDownRight,
  MoreVertical,
  Calendar,
  Download,
  Bell,
  Search,
  Settings,
  BarChart3,
  PieChart,
  LineChart as LineChartIcon
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';

function clsxMerge(...inputs: any[]) {
  return cn(...inputs);
}

interface StatCardProps {
  title: string;
  value: string | number;
  change: number;
  icon: React.ElementType;
  trend: 'up' | 'down';
  description?: string;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, change, icon: Icon, trend, description }) => {
  const isPositive = trend === 'up';
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      whileHover={{ scale: 1.02, y: -5 }}
    >
      <Card className="overflow-hidden bg-surface-card border-surface-border hover:border-primary/20 transition-all duration-300">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-text-primary">{title}</CardTitle>
          <div className="p-2 rounded-full bg-primary/10 text-primary">
            <Icon className="h-4 w-4" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-white">{value}</div>
          <div className="flex items-center gap-1 mt-1">
            {isPositive ? (
              <ArrowUpRight className="h-4 w-4 text-success" />
            ) : (
              <ArrowDownRight className="h-4 w-4 text-critical" />
            )}
            <span className={cn(
              "text-xs font-semibold",
              isPositive ? "text-success" : "text-critical"
            )}>
              {Math.abs(change)}%
            </span>
            <span className="text-xs text-text-muted ml-1 font-medium">
              {description || 'from last month'}
            </span>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

interface ActivityItem {
  id: string;
  user: {
    name: string;
    avatar: string;
  };
  action: string;
  time: string;
  amount?: string;
}

interface ChartData {
  label: string;
  value: number;
}

interface SaaSAnalyticsPageProps {
  stats?: {
    revenue: number;
    users: number;
    orders: number;
    growth: number;
  };
  recentActivity?: ActivityItem[];
  chartData?: ChartData[];
  className?: string;
}

const MiniBarChart: React.FC<{ data: ChartData[] }> = ({ data }) => {
  const maxValue = Math.max(1, ...data.map(d => d.value));
  
  return (
    <div className="flex items-end gap-2 h-32 pt-4">
      {data.map((item, index) => {
        const heightPx = (item.value / maxValue) * 128;
        
        return (
          <motion.div
            key={item.label}
            className="flex-1 flex flex-col items-center justify-end"
            initial={{ height: 0 }}
            animate={{ height: heightPx }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
          >
            <div
              className="w-full rounded-t bg-primary/40 hover:bg-primary/80 transition-colors cursor-pointer"
              style={{ height: '100%' }}
            />
            <span className="text-xs text-text-muted mt-2 font-semibold font-mono">{item.label}</span>
          </motion.div>
        );
      })}
    </div>
  );
};

export const SaaSAnalyticsPage: React.FC<SaaSAnalyticsPageProps> = ({ 
  stats = {
    revenue: 0,
    users: 0,
    orders: 0,
    growth: 0
  },
  recentActivity = [],
  chartData = [],
  className
}) => {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  return (
    <div className={clsxMerge("min-h-screen bg-transparent text-white", className)}>
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="max-w-7xl mx-auto space-y-6 text-left"
      >
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-xl md:text-2xl font-bold tracking-tight text-white flex items-center gap-2">
              <LayoutDashboard className="h-6 w-6 text-primary animate-pulse" />
              SaaS Analytics Showcase
            </h1>
            <p className="text-[11px] text-text-muted mt-1 font-medium">
              Interactive telemetry overview powered by standard component primitives.
            </p>
          </div>
          
          <div className="flex items-center gap-2 shrink-0">
            <Button variant="outline" size="icon" className="cursor-pointer border-surface-border bg-surface text-text-secondary hover:text-white rounded-xl">
              <Search className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="icon" className="cursor-pointer border-surface-border bg-surface text-text-secondary hover:text-white rounded-xl">
              <Bell className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="icon" className="cursor-pointer border-surface-border bg-surface text-text-secondary hover:text-white rounded-xl">
              <Settings className="h-4 w-4" />
            </Button>
            <Button className="cursor-pointer bg-primary hover:opacity-90 font-mono text-[9px] uppercase font-bold tracking-wider rounded-xl text-black py-2.5 px-4 h-9">
              <Download className="h-3.5 w-3.5 mr-2 shrink-0" />
              Export Telemetry
            </Button>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <StatCard
            title="Total Revenue"
            value={`$${stats.revenue.toLocaleString()}`}
            change={20.1}
            icon={DollarSign}
            trend="up"
          />
          <StatCard
            title="Active Users"
            value={`+${stats.users.toLocaleString()}`}
            change={18.2}
            icon={Users}
            trend="up"
          />
          <StatCard
            title="Total Runs"
            value={stats.orders.toLocaleString()}
            change={5.3}
            icon={Activity}
            trend="down"
          />
          <StatCard
            title="Weekly Growth"
            value={`${stats.growth}%`}
            change={12.5}
            icon={TrendingUp}
            trend="up"
          />
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="lg:col-span-4"
          >
            <Card className="bg-surface-card border-surface-border h-full">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-sm font-bold text-white uppercase tracking-wider font-mono">Weekly Overview</CardTitle>
                    <CardDescription className="text-text-muted text-[10px]">Your performance metrics this week</CardDescription>
                  </div>
                  <Button variant="ghost" size="icon" className="cursor-pointer text-text-muted hover:text-white rounded-lg">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <MiniBarChart data={chartData} />
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="lg:col-span-3"
          >
            <Card className="bg-surface-card border-surface-border h-full">
              <CardHeader>
                <CardTitle className="text-sm font-bold text-white uppercase tracking-wider font-mono">Recent Activity</CardTitle>
                <CardDescription className="text-text-muted text-[10px]">Latest system and review actions</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3.5">
                  {recentActivity.map((activity, index) => (
                    <motion.div
                      key={activity.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: 0.4 + index * 0.1 }}
                      className="flex items-center gap-4 p-2 rounded-xl hover:bg-surface/50 border border-transparent hover:border-surface-border transition-all duration-300"
                    >
                      <Avatar className="h-8 w-8 rounded-full border border-surface-border bg-surface shrink-0">
                        <AvatarImage src={activity.user.avatar} alt={activity.user.name} />
                        <AvatarFallback className="text-xs text-primary font-bold">{activity.user.name.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0 text-left">
                        <p className="text-xs font-bold text-text-primary truncate">{activity.user.name}</p>
                        <p className="text-[10px] text-text-secondary truncate">{activity.action}</p>
                      </div>
                      <div className="text-right shrink-0">
                        {activity.amount && (
                          <p className={`text-[9px] font-bold font-mono px-2 py-0.5 rounded-lg border uppercase tracking-wider inline-block ${
                            activity.amount === 'Critical' 
                              ? 'bg-critical/5 border-critical/20 text-critical' 
                              : 'bg-primary/5 border-primary/20 text-primary'
                          }`}>{activity.amount}</p>
                        )}
                        <p className="text-[9px] text-text-muted font-medium mt-0.5">{activity.time}</p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.5 }}
          >
            <Card className="bg-surface-card border-surface-border hover:shadow-lg transition-all duration-300">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-xs font-bold text-white uppercase tracking-wider font-mono">Quick Actions</CardTitle>
                <BarChart3 className="h-4 w-4 text-text-muted" />
              </CardHeader>
              <CardContent className="pt-2">
                <div className="space-y-2">
                  <Button variant="outline" className="w-full justify-start cursor-pointer border-surface-border hover:border-primary/20 text-text-secondary hover:text-white rounded-xl text-xs">
                    <PieChart className="h-3.5 w-3.5 mr-2 text-primary" />
                    View Analytics
                  </Button>
                  <Button variant="outline" className="w-full justify-start cursor-pointer border-surface-border hover:border-primary/20 text-text-secondary hover:text-white rounded-xl text-xs">
                    <LineChartIcon className="h-3.5 w-3.5 mr-2 text-primary" />
                    Generate Report
                  </Button>
                  <Button variant="outline" className="w-full justify-start cursor-pointer border-surface-border hover:border-primary/20 text-text-secondary hover:text-white rounded-xl text-xs">
                    <Calendar className="h-3.5 w-3.5 mr-2 text-primary" />
                    Schedule Meeting
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.6 }}
          >
            <Card className="bg-surface-card border-surface-border hover:shadow-lg transition-all duration-300">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-xs font-bold text-white uppercase tracking-wider font-mono">Top Products</CardTitle>
                <TrendingUp className="h-4 w-4 text-text-muted" />
              </CardHeader>
              <CardContent className="pt-2">
                <div className="space-y-3 pt-1">
                  {['Product A', 'Product B', 'Product C'].map((product, index) => (
                    <div key={product} className="flex items-center justify-between">
                      <span className="text-xs text-text-secondary font-medium">{product}</span>
                      <Badge variant="secondary" className="bg-[#0C0C0E] border-surface-border text-primary font-bold font-mono text-[10px] px-2 py-0.5 rounded-lg">
                        {(100 - index * 20)}%
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.7 }}
          >
            <Card className="bg-surface-card border-surface-border hover:shadow-lg transition-all duration-300">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-xs font-bold text-white uppercase tracking-wider font-mono">Notifications</CardTitle>
                <Bell className="h-4 w-4 text-text-muted animate-bounce" />
              </CardHeader>
              <CardContent className="pt-2">
                <div className="space-y-3 pt-1">
                  {[
                    { text: 'New vulnerability report', time: '5m ago' },
                    { text: 'Auth keys updated', time: '1h ago' },
                    { text: 'User registered', time: '2h ago' }
                  ].map((notification, index) => (
                    <div key={index} className="flex items-start gap-2.5">
                      <div className="h-1.5 w-1.5 rounded-full bg-primary mt-1.5 shrink-0" />
                      <div className="flex-1 text-left min-w-0">
                        <p className="text-xs text-text-primary truncate">{notification.text}</p>
                        <p className="text-[9px] text-text-muted font-medium mt-0.5">{notification.time}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
};
