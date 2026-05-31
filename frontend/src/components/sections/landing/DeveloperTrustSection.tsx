import React from 'react';
import { motion } from 'framer-motion';
import { Shield, BrainCircuit, Terminal, Cpu, Users } from 'lucide-react';

export const DeveloperTrustSection: React.FC = () => {
  const trustPillars = [
    {
      icon: <Cpu className="w-5 h-5 text-primary" />,
      title: "Rule-Based AST Parser",
      desc: "Our engine relies on high-fidelity Abstract Syntax Tree (AST) matching logic. Zero statistical guesswork; pure semantic analysis."
    },
    {
      icon: <BrainCircuit className="w-5 h-5 text-primary" />,
      title: "Explainable Findings",
      desc: "No vague warnings. Every audit includes a complete breakdown of why a line is dangerous, along with exact code diff fixes."
    },
    {
      icon: <Shield className="w-5 h-5 text-primary" />,
      title: "Isolated Sandbox Core",
      desc: "Code tokens are evaluated in secure, ephemerally sandboxed environments. Your IP is fully protected and private."
    },
    {
      icon: <Terminal className="w-5 h-5 text-primary" />,
      title: "REST APIs & Webhooks",
      desc: "Connect scans with Slack alerts, Datadog logging metrics, or custom endpoints. Built entirely for automated operations."
    }
  ];

  return (
    <section className="relative py-24 md:py-32 w-full overflow-hidden bg-transparent z-10">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[500px] bg-primary/5 rounded-full blur-[140px] pointer-events-none -z-10" />

      <div className="max-w-5xl mx-auto px-6 w-full">
        <div className="text-center mb-16 md:mb-20">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.5 }}
            className="text-xs font-mono font-bold tracking-widest text-primary uppercase flex items-center justify-center gap-2"
          >
            <Users className="w-3.5 h-3.5 text-primary" />
            Developer Assurances
          </motion.div>
          
          <motion.h2
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.5, delay: 0.05 }}
            className="text-3xl md:text-4xl font-bold text-text-primary tracking-tight leading-tight"
          >
            Built for scale. Trusted by developers.
          </motion.h2>
          
          <motion.p
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-xs md:text-sm text-text-secondary mt-3 max-w-xl mx-auto leading-relaxed"
          >
            Our core design focuses on structural safety, explainability, and seamless backend modularity.
          </motion.p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 select-none text-left">
          {trustPillars.map((pillar, idx) => (
            <motion.div
              key={idx}
              initial={{ y: 20, opacity: 0 }}
              whileInView={{ y: 0, opacity: 1 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.6, delay: idx * 0.08, ease: [0.16, 1, 0.3, 1] as const }}
              className="flex h-full w-full"
            >
              <div className="w-full p-6 bg-surface-card border border-surface-border rounded-2xl transition-all duration-300 hover:border-surface-bright flex gap-5 items-start shadow-sm group">
                
                <div className="w-10 h-10 rounded-xl bg-surface border border-surface-border text-primary flex items-center justify-center shrink-0 mt-0.5 group-hover:scale-105 transition-transform duration-500">
                  {pillar.icon}
                </div>

                <div>
                  <h3 className="text-sm font-bold text-text-primary tracking-wide group-hover:text-primary transition-colors duration-300">{pillar.title}</h3>
                  <p className="text-xs text-text-secondary mt-2 leading-relaxed">{pillar.desc}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default DeveloperTrustSection;
