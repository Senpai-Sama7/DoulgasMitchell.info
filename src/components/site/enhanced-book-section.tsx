'use client';

import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Terminal, Cpu, Database, Network, Sparkles, ChevronRight, Command } from 'lucide-react';

const websites = [
  { name: 'ReliantAI.org', url: 'https://ReliantAI.org' },
  { name: 'Nex-Gen.Pro', url: 'https://Nex-Gen.Pro' },
  { name: 'Gen-H.vercel.app', url: 'https://Gen-H.vercel.app' },
  { name: 'AdTok.Shop', url: 'https://AdTok.Shop' },
  { name: 'TheConfidentMind.Shop', url: 'https://TheConfidentMind.Shop' },
  { name: 'Clear-Desk-Ten.vercel.app', url: 'https://Clear-Desk-Ten.vercel.app' },
  { name: 'GitHub', url: 'https://github.com/senpai-sama7' },
  { name: 'LinkedIn', url: 'https://linkedin.com/in/douglas-mitchell-the-architect' },
];

function JITTerminal() {
  const [input, setInput] = useState('');
  const [history, setHistory] = useState<Array<{ type: 'cmd' | 'output' | 'error', text: React.ReactNode }>>([
    { type: 'output', text: 'Douglas Mitchell OS v4.2.0 initialized.' },
    { type: 'output', text: 'Type --help to see available commands.' },
  ]);
  const [isUpdating, setIsUpdating] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [history, isUpdating]);

  const handleTerminalClick = () => {
    inputRef.current?.focus();
  };

  const handleCommand = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const cmd = input.trim().toLowerCase();
    setHistory(prev => [...prev, { type: 'cmd', text: input }]);
    setInput('');

    if (cmd === '--help') {
      setHistory(prev => [...prev, { 
        type: 'output', 
        text: 'Available commands: --help, sudo apt update, git push, nmap, clear, whoami' 
      }]);
    } else if (cmd === 'sudo apt update') {
      setIsUpdating(true);
      setHistory(prev => [...prev, { type: 'output', text: 'Hit:1 http://archive.ubuntu.com/ubuntu noble InRelease' }]);
      
      setTimeout(() => {
        setHistory(prev => [...prev, { type: 'output', text: 'Get:2 http://security.ubuntu.com/ubuntu noble-security InRelease [126 kB]' }]);
      }, 500);
      
      setTimeout(() => {
        setHistory(prev => [...prev, { type: 'output', text: 'Fetched 126 kB in 1s (115 kB/s)' }]);
        setHistory(prev => [...prev, { type: 'output', text: 'Reading package lists... Done' }]);
        setHistory(prev => [...prev, { type: 'output', text: 'All packages are up to date.' }]);
        setIsUpdating(false);
      }, 1500);
    } else if (cmd === 'git push') {
      setHistory(prev => [...prev, { type: 'output', text: 'Enumerating objects: 15, done.' }]);
      setHistory(prev => [...prev, { type: 'output', text: 'Delta compression using up to 18 threads' }]);
      setHistory(prev => [...prev, { type: 'output', text: 'Redirecting to contact portal...' }]);
      setTimeout(() => {
        const contactSection = document.getElementById('contact');
        if (contactSection) contactSection.scrollIntoView({ behavior: 'smooth' });
      }, 1000);
    } else if (cmd === 'nmap') {
      setHistory(prev => [...prev, { type: 'output', text: 'Starting Nmap 7.80 ( https://nmap.org )' }]);
      setHistory(prev => [...prev, { 
        type: 'output', 
        text: (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-2">
            {websites.map(site => (
              <a 
                key={site.name} 
                href={site.url} 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-primary hover:underline flex items-center gap-1"
              >
                <ChevronRight className="h-3 w-3" /> {site.name}
              </a>
            ))}
          </div>
        )
      }]);
    } else if (cmd === 'clear') {
      setHistory([]);
    } else if (cmd === 'whoami') {
      setHistory(prev => [...prev, { type: 'output', text: 'the_architect' }]);
    } else {
      setHistory(prev => [...prev, { type: 'error', text: `Command not found: ${cmd}` }]);
    }
  };

  return (
    <div 
      className="w-full h-[500px] bg-black/95 rounded-2xl border border-primary/20 p-6 font-mono text-sm text-primary/80 overflow-hidden shadow-2xl relative flex flex-col cursor-text"
      onClick={handleTerminalClick}
    >
      {/* Header */}
      <div className="flex items-center gap-3 mb-6 pb-4 border-b border-primary/10">
        <div className="flex gap-1.5">
          <div className="w-3 h-3 rounded-full bg-red-500/40" />
          <div className="w-3 h-3 rounded-full bg-yellow-500/40" />
          <div className="w-3 h-3 rounded-full bg-green-500/40" />
        </div>
        <div className="flex-1 text-center opacity-50 uppercase tracking-[0.3em] text-[10px]">
          architect_terminal_v4.2
        </div>
        <Command className="h-4 w-4 opacity-50" />
      </div>

      {/* Terminal Output */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto space-y-2 mb-4 scrollbar-hide">
        {history.map((line, i) => (
          <div key={i} className={line.type === 'error' ? 'text-red-400' : line.type === 'cmd' ? 'text-white' : ''}>
            {line.type === 'cmd' && <span className="text-primary/50 mr-2">guest@dm-os:~$</span>}
            {line.text}
          </div>
        ))}
        {isUpdating && (
          <motion.div
            animate={{ opacity: [1, 0.5, 1] }}
            transition={{ duration: 0.5, repeat: Infinity }}
            className="text-primary/70"
          >
            Updating system repository...
          </motion.div>
        )}
      </div>

      {/* Input Line */}
      <form onSubmit={handleCommand} className="flex items-center gap-2">
        <span className="text-primary/50 whitespace-nowrap">guest@dm-os:~$</span>
        <input
          ref={inputRef}
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          className="bg-transparent border-none outline-none text-white w-full p-0 focus:ring-0"
          spellCheck={false}
          aria-label="Terminal input"
        />
      </form>

      {/* Background Icons */}
      <div className="absolute bottom-6 right-6 flex gap-6 opacity-10 pointer-events-none">
        <Cpu className="h-6 w-6" />
        <Database className="h-6 w-6" />
        <Network className="h-6 w-6" />
      </div>
    </div>
  );
}

export function EnhancedBookSection() {
  return (
    <section id="book" className="section-spacing bg-muted/30 relative overflow-hidden">
      <div className="editorial-container relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-12"
        >
          <div className="flex items-center gap-3 mb-4">
            <span className="font-mono text-xs text-muted-foreground">{'// 04'}</span>
            <div className="h-px flex-1 bg-gradient-to-r from-border to-transparent" />
          </div>
          <div className="flex items-center gap-3">
            <Sparkles className="h-5 w-5 text-primary" />
            <span className="font-mono text-sm text-muted-foreground uppercase tracking-widest">System Command Center</span>
          </div>
        </motion.div>

        <div className="grid lg:grid-cols-3 gap-12 items-start">
          <div className="lg:col-span-2">
            <JITTerminal />
          </div>
          
          <div className="space-y-8">
            <div className="p-6 rounded-2xl border border-border bg-background">
              <h3 className="font-mono text-xs uppercase tracking-widest text-primary mb-4">Quick Shortcuts</h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-muted-foreground font-mono">--help</span>
                  <span className="text-xs opacity-50">View all commands</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-muted-foreground font-mono">nmap</span>
                  <span className="text-xs opacity-50">Scan project grid</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-muted-foreground font-mono">git push</span>
                  <span className="text-xs opacity-50">Sync to contact</span>
                </div>
              </div>
            </div>

            <div className="p-6 rounded-2xl border border-border bg-muted/40">
              <p className="text-sm text-muted-foreground leading-relaxed">
                Interact with the Architect's terminal to explore the network, sync with the contact portal, or run system diagnostics.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
