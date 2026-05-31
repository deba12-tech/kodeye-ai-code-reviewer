import React from 'react';
import { motion } from 'framer-motion';
import { ShieldCheck, AlertOctagon, Lock, EyeOff, Key } from 'lucide-react';

export const SecuritySection: React.FC = () => {
  const securityPillars = [
    {
      icon: <Lock className="w-4 h-4 text-primary" />,
      title: "Zero Retention Storage",
      desc: "We analyze your repository trees strictly in-memory. None of your source files are cached or stored on our servers."
    },
    {
      icon: <EyeOff className="w-4 h-4 text-primary" />,
      title: "End-to-End Encryption",
      desc: "All code payloads and metadata are guarded by TLS 1.3 in transit and AES-256 at rest during audit review cycles."
    },
    {
      icon: <Key className="w-4 h-4 text-primary" />,
      title: "Granular Vault Access",
      desc: "Manage and restrict scan boundaries with read-only repository tokens. Full compliance with Enterprise IAM scopes."
    }
  ];

  const vulnerabilityCards = [
    {
      severity: "Critical",
      vuln: "Remote Code Execution (RCE)",
      file: "upload_service.rs : L82",
      desc: "Unvalidated input buffer size parsed directly into command arguments, opening stack overflow and RCE vectors.",
      color: "critical",
      glowClass: "border-critical/20 bg-critical/5 text-critical hover:border-critical/40"
    },
    {
      severity: "High",
      vuln: "Broken Authentication Token",
      file: "auth_guard.go : L120",
      desc: "JWT claim signatures verify against public signing key tokens, letting attackers easily forge admin payloads.",
      color: "high",
      glowClass: "border-high/20 bg-high/5 text-high hover:border-high/40"
    },
    {
      severity: "Medium",
      vuln: "ReDoS Regular Expression",
      file: "validator.ts : L45",
      desc: "Backtracking complexity in telephone pattern match regex limits CPU performance and exposes endpoint crash vulnerabilities.",
      color: "medium",
      glowClass: "border-medium/20 bg-medium/5 text-medium hover:border-medium/40"
    }
  ];

  return (
    <section className="relative py-24 md:py-32 w-full overflow-hidden bg-transparent z-10">
      <div className="absolute inset-0 dark-grid-bg-fine opacity-30 pointer-events-none -z-10" />
      <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[140px] pointer-events-none -z-10" />

      <div className="max-w-5xl mx-auto px-6 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-center">
          
          <div className="lg:col-span-6 space-y-6 text-left">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.5 }}
              className="text-xs font-mono font-bold tracking-widest text-primary uppercase flex items-center gap-2"
            >
              <ShieldCheck className="w-4 h-4 text-primary" />
              Security Audits
            </motion.div>

            <motion.h2
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.5, delay: 0.05 }}
              className="text-3xl md:text-4xl font-bold text-text-primary tracking-tight leading-tight"
            >
              Protecting your secrets, in-memory.
            </motion.h2>

            <motion.p
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="text-xs md:text-sm text-text-secondary leading-relaxed"
            >
              Kodeye integrates static analysis (SAST), software composition analysis (SCA), and secrets detection in one single scanning process. Keep codebase standards high without sacrificing workspace integrity.
            </motion.p>

            <div className="space-y-4 pt-4 border-t border-surface-border">
              {securityPillars.map((pillar, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, x: -10 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true, margin: "-100px" }}
                  transition={{ duration: 0.5, delay: idx * 0.08 }}
                  className="flex gap-4 items-start select-none"
                >
                  <div className="w-8 h-8 rounded-xl bg-surface border border-surface-border flex items-center justify-center shrink-0 mt-0.5">
                    {pillar.icon}
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-text-primary tracking-wide">{pillar.title}</h4>
                    <p className="text-[11px] text-text-secondary mt-1 leading-relaxed">{pillar.desc}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          <div className="lg:col-span-6 space-y-4 select-none relative">
            <div className="absolute -inset-4 bg-gradient-to-r from-critical/5 to-transparent rounded-2xl blur-3xl pointer-events-none -z-10" />

            {vulnerabilityCards.map((card, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.6, delay: idx * 0.1, ease: [0.16, 1, 0.3, 1] as const }}
                whileHover={{ y: -2 }}
                className={`border bg-surface rounded-2xl p-4 shadow-sm flex gap-3 transition-all duration-300 ${card.glowClass} group text-left`}
              >
                <div className={`p-1.5 rounded-xl shrink-0 self-start ${
                  card.color === 'critical' ? 'bg-critical/10 border border-critical/20 text-critical' :
                  card.color === 'high' ? 'bg-high/10 border border-high/20 text-high' :
                  'bg-medium/10 border border-medium/20 text-medium'
                }`}>
                  <AlertOctagon className="w-4 h-4" />
                </div>

                <div className="flex-1 space-y-1">
                  <div className="flex items-center justify-between gap-2 flex-wrap">
                    <span className="font-sans text-xs font-bold text-text-primary group-hover:text-primary transition-colors duration-300">{card.vuln}</span>
                    <span className={`px-1.5 py-0.5 rounded-lg text-[8px] font-bold uppercase ${
                      card.color === 'critical' ? 'bg-critical/20 border border-critical/30 text-critical' :
                      card.color === 'high' ? 'bg-high/20 border border-high/30 text-high' :
                      'bg-medium/20 border border-medium/30 text-medium'
                    }`}>
                      {card.severity}
                    </span>
                  </div>
                  <div className="font-mono text-[9px] text-text-muted">{card.file}</div>
                  <p className="text-[10px] text-text-secondary leading-relaxed mt-1">{card.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>

        </div>
      </div>
    </section>
  );
};

export default SecuritySection;
