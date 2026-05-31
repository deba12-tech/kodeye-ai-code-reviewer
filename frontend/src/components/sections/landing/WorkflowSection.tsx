import React from 'react';
import { motion } from 'framer-motion';
import { ShieldAlert, UserPlus, Play, CheckCircle2, ArrowRight } from 'lucide-react';

export const WorkflowSection: React.FC = () => {
  const workflowStages = [
    {
      num: "01",
      status: "Detected",
      title: "CSRF Loophole",
      desc: "API lacks authenticity token verification checks on sensitive user endpoints.",
      icon: <ShieldAlert className="w-4 h-4 text-critical" />,
      colorClass: "border-critical/20 bg-critical/5 hover:border-critical/40 shadow-sm",
      badge: <span className="px-1.5 py-0.5 rounded-lg bg-critical/15 border border-critical/20 text-[8px] text-critical font-bold uppercase">Critical</span>,
      badgeText: "Flaw Found"
    },
    {
      num: "02",
      status: "Assigned",
      title: "Sara (Security)",
      desc: "Ticket automatically allocated to Lead Security Developer workspace folder.",
      icon: <UserPlus className="w-4 h-4 text-high" />,
      colorClass: "border-high/20 bg-high/5 hover:border-high/40 shadow-sm",
      badge: <span className="px-1.5 py-0.5 rounded-lg bg-high/15 border border-high/20 text-[8px] text-high font-bold uppercase">Allocated</span>,
      badgeText: "Dev Task"
    },
    {
      num: "03",
      status: "In Progress",
      title: "Code Compiling",
      desc: "Integrating suggested token verification middlewares inside the auth scope.",
      icon: <Play className="w-4 h-4 text-low animate-pulse" />,
      colorClass: "border-low/20 bg-low/5 hover:border-low/40 shadow-sm",
      badge: <span className="px-1.5 py-0.5 rounded-lg bg-low/15 border border-low/20 text-[8px] text-low font-bold uppercase">Re-testing</span>,
      badgeText: "Patching"
    },
    {
      num: "04",
      status: "Fixed",
      title: "Patch Verified",
      desc: "Vulnerability fully mitigated. Static AST rules confirm complete compliance.",
      icon: <CheckCircle2 className="w-4 h-4 text-success" />,
      colorClass: "border-success/20 bg-success/5 hover:border-success/40 shadow-sm",
      badge: <span className="px-1.5 py-0.5 rounded-lg bg-success/15 border border-success/20 text-[8px] text-success font-bold uppercase">Mitigated</span>,
      badgeText: "Audited"
    }
  ];

  return (
    <section className="relative py-24 md:py-32 w-full overflow-hidden bg-transparent z-10">
      <div className="absolute inset-0 dark-grid-bg-fine opacity-30 pointer-events-none -z-10" />

      <div className="max-w-5xl mx-auto px-6 w-full">
        <div className="text-center mb-16 md:mb-20">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.5 }}
            className="text-xs font-mono font-bold tracking-widest text-primary uppercase flex items-center justify-center gap-2"
          >
            <ShieldAlert className="w-3.5 h-3.5 text-primary" />
            Seamless Orchestration
          </motion.div>
          
          <motion.h2
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.5, delay: 0.05 }}
            className="text-3xl md:text-4xl font-bold text-text-primary tracking-tight leading-tight"
          >
            From detection to resolution.
          </motion.h2>
          
          <motion.p
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-xs md:text-sm text-text-secondary mt-3 max-w-xl mx-auto leading-relaxed"
          >
            Watch how isolated vulnerabilities are instantly identified, assigned to workspace repositories, and patched via our code engine.
          </motion.p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 relative select-none">
          {workflowStages.map((stage, idx) => (
            <motion.div
              key={idx}
              initial={{ y: 20, opacity: 0 }}
              whileInView={{ y: 0, opacity: 1 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.6, delay: idx * 0.08, ease: [0.16, 1, 0.3, 1] as const }}
              className={`border rounded-2xl p-5 relative overflow-hidden transition-all duration-300 flex flex-col justify-between h-[230px] group ${stage.colorClass} text-left`}
            >
              <div>
                <div className="flex items-center justify-between border-b border-surface-border pb-2 mb-3">
                  <span className="font-mono text-[9px] tracking-wider text-text-muted uppercase">{stage.badgeText}</span>
                  <div className="flex items-center gap-1">
                    <span className="font-mono text-[10px] text-text-primary font-bold">{stage.num}</span>
                    {stage.badge}
                  </div>
                </div>

                <div className="flex items-center gap-2 mb-2">
                  <div className="p-1 rounded-lg bg-surface border border-surface-border">
                    {stage.icon}
                  </div>
                  <h3 className="text-xs font-bold text-text-primary group-hover:text-primary transition-colors duration-300">{stage.title}</h3>
                </div>

                <p className="text-[10px] text-text-secondary leading-relaxed">
                  {stage.desc}
                </p>
              </div>

              <div className="flex items-center justify-between mt-4">
                <span className="text-[9px] font-mono text-text-muted uppercase">Stage: {stage.status}</span>
                {idx < 3 && (
                  <ArrowRight className="w-3.5 h-3.5 text-text-muted/30 group-hover:text-primary transition-colors duration-300 hidden lg:block" />
                )}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default WorkflowSection;
