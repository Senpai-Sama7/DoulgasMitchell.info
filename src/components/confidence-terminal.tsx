"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Terminal, Play, RotateCcw, Trophy, Brain, Zap, Target } from "lucide-react";

interface TerminalLine {
  id: number;
  text: string;
  type: "input" | "output" | "success" | "system";
}

const INITIAL_LINES: TerminalLine[] = [
  { id: 1, text: "Initializing Confidence Protocol...", type: "system" },
  { id: 2, text: "Loading neural pathways...", type: "output" },
  { id: 3, text: "✓ Self-doubt modules neutralized", type: "success" },
];

const CONFIDENCE_COMMANDS = [
  { cmd: "build_confidence --level=daily", output: "✓ Confidence baseline established: +15%", type: "success" },
  { cmd: "analyze_fear_loop", output: "Identifying trigger patterns...", type: "output" },
  { cmd: "deploy_courage --micro-action", output: "✓ Small win registered. Momentum building.", type: "success" },
  { cmd: "status --mindset", output: "Growth mindset: ACTIVE | Fixed mindset: 0%", type: "output" },
  { cmd: "reframe --negative-thought", output: "✓ Cognitive reframing complete", type: "success" },
];

// Mini Confidence Game
interface GameState {
  score: number;
  level: number;
  active: boolean;
  currentChallenge: string;
}

const CHALLENGES = [
  { text: "Take a deep breath", icon: Brain },
  { text: "Stand up straight", icon: Target },
  { text: "Smile confidently", icon: Zap },
  { text: "Say 'I can do this'", icon: Trophy },
];

function AudioVisualizer() {
  const [bars, setBars] = useState(Array(12).fill(20));
  
  useEffect(() => {
    const interval = setInterval(() => {
      setBars(prev => prev.map(() => Math.random() * 60 + 10));
    }, 100);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex items-end gap-1 h-12 px-2">
      {bars.map((height, i) => (
        <motion.div
          key={i}
          className="w-1 bg-primary/60 rounded-full"
          animate={{ height: `${height}%` }}
          transition={{ duration: 0.1 }}
        />
      ))}
    </div>
  );
}

function MatrixRain() {
  const [drops, setDrops] = useState<{ id: number; x: number; delay: number; duration: number }[]>([]);
  
  useEffect(() => {
    const newDrops = Array.from({ length: 15 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      delay: Math.random() * 2,
      duration: 2 + Math.random() * 2,
    }));
    setDrops(newDrops);
  }, []);

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-20">
      {drops.map((drop) => (
        <motion.div
          key={drop.id}
          className="absolute text-[8px] text-primary font-mono whitespace-pre"
          style={{ left: `${drop.x}%` }}
          initial={{ y: -20, opacity: 0 }}
          animate={{ 
            y: ["0%", "400%"],
            opacity: [0, 1, 1, 0]
          }}
          transition={{
            duration: drop.duration,
            delay: drop.delay,
            repeat: Infinity,
            ease: "linear"
          }}
        >
          {Array.from({ length: 8 }, () => 
            String.fromCharCode(0x30A0 + Math.random() * 96)
          ).join('\n')}
        </motion.div>
      ))}
    </div>
  );
}

export function ConfidenceTerminal() {
  const [lines, setLines] = useState<TerminalLine[]>(INITIAL_LINES);
  const [isTyping, setIsTyping] = useState(false);
  const [gameState, setGameState] = useState<GameState>({
    score: 0,
    level: 1,
    active: false,
    currentChallenge: "",
  });
  const [showGame, setShowGame] = useState(false);
  const terminalRef = useRef<HTMLDivElement>(null);
  const lineIdRef = useRef(4);

  const scrollToBottom = useCallback(() => {
    if (terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
    }
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [lines, scrollToBottom]);

  // Auto-play commands
  useEffect(() => {
    if (showGame) return;
    
    const interval = setInterval(() => {
      if (isTyping) return;
      
      const randomCmd = CONFIDENCE_COMMANDS[Math.floor(Math.random() * CONFIDENCE_COMMANDS.length)];
      setIsTyping(true);
      
      // Add command line
      const cmdLine: TerminalLine = {
        id: lineIdRef.current++,
        text: `> ${randomCmd.cmd}`,
        type: "input",
      };
      setLines(prev => [...prev.slice(-8), cmdLine]);
      
      // Add output after delay
      setTimeout(() => {
        const outputLine: TerminalLine = {
          id: lineIdRef.current++,
          text: randomCmd.output,
          type: randomCmd.type as "output" | "success",
        };
        setLines(prev => [...prev, outputLine]);
        setIsTyping(false);
      }, 800);
    }, 3500);

    return () => clearInterval(interval);
  }, [isTyping, showGame]);

  const startGame = () => {
    setShowGame(true);
    setGameState({
      score: 0,
      level: 1,
      active: true,
      currentChallenge: CHALLENGES[0].text,
    });
  };

  const completeChallenge = () => {
    setGameState(prev => {
      const newScore = prev.score + 10 * prev.level;
      const newLevel = Math.floor(newScore / 50) + 1;
      const nextChallenge = CHALLENGES[Math.floor(Math.random() * CHALLENGES.length)];
      
      // Add success line to terminal
      const successLine: TerminalLine = {
        id: lineIdRef.current++,
        text: `✓ Challenge completed! +${10 * prev.level} confidence points`,
        type: "success",
      };
      setLines(lines => [...lines.slice(-8), successLine]);
      
      return {
        ...prev,
        score: newScore,
        level: newLevel,
        currentChallenge: nextChallenge.text,
      };
    });
  };

  const resetGame = () => {
    setShowGame(false);
    setGameState({
      score: 0,
      level: 1,
      active: false,
      currentChallenge: "",
    });
  };

  const CurrentIcon = showGame 
    ? CHALLENGES.find(c => c.text === gameState.currentChallenge)?.icon || Brain
    : Terminal;

  return (
    <div className="relative w-full max-w-md mx-auto perspective-1000">
      {/* 3D Container */}
      <motion.div
        className="relative"
        initial={{ rotateX: 15, scale: 0.95 }}
        animate={{ rotateX: 0, scale: 1 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        style={{ transformStyle: "preserve-3d" }}
      >
        {/* Glow Effect */}
        <div className="absolute -inset-1 bg-gradient-to-r from-primary/20 via-amber-500/20 to-primary/20 rounded-2xl blur-xl opacity-60" />
        
        {/* Main Terminal Container */}
        <div className="relative bg-black/90 rounded-2xl border border-primary/30 overflow-hidden shadow-2xl">
          {/* Matrix Rain Background */}
          <MatrixRain />
          
          {/* Terminal Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-primary/20 bg-black/50 backdrop-blur-sm">
            <div className="flex items-center gap-2">
              <div className="flex gap-1.5">
                <div className="w-3 h-3 rounded-full bg-red-500/80" />
                <div className="w-3 h-3 rounded-full bg-amber-500/80" />
                <div className="w-3 h-3 rounded-full bg-green-500/80" />
              </div>
              <span className="ml-3 text-xs font-mono text-primary/60">confidence_terminal.exe</span>
            </div>
            <AudioVisualizer />
          </div>

          {/* Terminal Content */}
          <div 
            ref={terminalRef}
            className="h-48 overflow-y-auto p-4 font-mono text-sm scrollbar-hide"
          >
            <AnimatePresence mode="popLayout">
              {lines.map((line) => (
                <motion.div
                  key={line.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0 }}
                  className={`mb-1 ${
                    line.type === "input" ? "text-primary" :
                    line.type === "success" ? "text-green-400" :
                    line.type === "system" ? "text-amber-400" :
                    "text-muted-foreground"
                  }`}
                >
                  {line.text}
                </motion.div>
              ))}
            </AnimatePresence>
            
            {isTyping && (
              <motion.span
                animate={{ opacity: [1, 0] }}
                transition={{ repeat: Infinity, duration: 0.5 }}
                className="text-primary"
              >
                ▊
              </motion.span>
            )}
          </div>

          {/* Game Overlay */}
          <AnimatePresence>
            {showGame && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
                className="absolute inset-0 bg-black/95 backdrop-blur-md flex flex-col items-center justify-center p-6"
              >
                <motion.div
                  key={gameState.currentChallenge}
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="text-center"
                >
                  <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-primary/20 flex items-center justify-center">
                    <CurrentIcon className="w-8 h-8 text-primary" />
                  </div>
                  <h4 className="text-lg font-bold mb-2">Confidence Challenge</h4>
                  <p className="text-muted-foreground mb-6">{gameState.currentChallenge}</p>
                  
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={completeChallenge}
                    className="px-6 py-3 bg-primary text-primary-foreground rounded-lg font-medium mb-4"
                  >
                    Complete Challenge
                  </motion.button>
                  
                  <div className="flex items-center justify-center gap-6 text-sm">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-primary">{gameState.score}</div>
                      <div className="text-muted-foreground text-xs">Points</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-amber-500">{gameState.level}</div>
                      <div className="text-muted-foreground text-xs">Level</div>
                    </div>
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Controls */}
          <div className="flex items-center justify-between px-4 py-3 border-t border-primary/20 bg-black/50">
            <div className="flex items-center gap-2">
              {!showGame ? (
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={startGame}
                  className="flex items-center gap-2 px-3 py-1.5 bg-primary/20 hover:bg-primary/30 rounded-lg text-xs font-medium transition-colors"
                >
                  <Play className="w-3.5 h-3.5" />
                  Start Training
                </motion.button>
              ) : (
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={resetGame}
                  className="flex items-center gap-2 px-3 py-1.5 bg-muted hover:bg-muted/80 rounded-lg text-xs font-medium transition-colors"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  Back to Terminal
                </motion.button>
              )}
            </div>
            
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              System Active
            </div>
          </div>
        </div>

        {/* 3D Reflection */}
        <div 
          className="absolute -bottom-8 left-0 right-0 h-16 bg-gradient-to-b from-primary/10 to-transparent rounded-full blur-2xl opacity-50"
          style={{ transform: "rotateX(60deg)" }}
        />
      </motion.div>

      {/* Floating Stats */}
      <motion.div
        className="absolute -right-4 top-1/4 glass-card px-3 py-2 rounded-lg text-xs"
        animate={{ y: [0, -5, 0] }}
        transition={{ repeat: Infinity, duration: 3 }}
      >
        <div className="text-primary font-bold">Confidence OS</div>
        <div className="text-muted-foreground">v2.0.4</div>
      </motion.div>

      <motion.div
        className="absolute -left-4 bottom-1/4 glass-card px-3 py-2 rounded-lg text-xs"
        animate={{ y: [0, 5, 0] }}
        transition={{ repeat: Infinity, duration: 3, delay: 1.5 }}
      >
        <div className="text-green-400 font-bold">Neural Link</div>
        <div className="text-muted-foreground">Connected</div>
      </motion.div>
    </div>
  );
}
