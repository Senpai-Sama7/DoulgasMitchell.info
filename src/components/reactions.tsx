"use client";

import { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useReactionStore, ReactionType } from "@/lib/store";
import { reactionEmojis } from "@/lib/data";
import { cn } from "@/lib/utils";

interface ReactionsProps {
  itemId: string;
  variant?: "light" | "dark";
}

export function Reactions({ itemId, variant = "light" }: ReactionsProps) {
  const { reactions, userReactions, addReaction, removeReaction, initializeReactions } =
    useReactionStore();

  useEffect(() => {
    initializeReactions(itemId);
  }, [itemId, initializeReactions]);

  const itemReactions = reactions[itemId] || {
    like: 0,
    love: 0,
    laugh: 0,
    shocked: 0,
    mad: 0,
    care: 0,
  };

  const userReaction = userReactions[itemId];

  const handleReaction = (reaction: ReactionType) => {
    if (userReaction === reaction) {
      removeReaction(itemId);
    } else {
      addReaction(itemId, reaction);
    }
  };

  const reactionTypes: ReactionType[] = ["like", "love", "laugh", "shocked", "mad", "care"];

  return (
    <div className="flex flex-wrap justify-center gap-2">
      <AnimatePresence>
        {reactionTypes.map((type) => {
          const count = itemReactions[type];
          const isActive = userReaction === type;

          return (
            <motion.button
              key={type}
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0 }}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => handleReaction(type)}
              className={cn(
                "reaction-btn",
                isActive && "active",
                variant === "dark" && "bg-white/10 border-white/20 text-white"
              )}
            >
              <span className="text-base">{reactionEmojis[type]}</span>
              {count > 0 && (
                <motion.span
                  initial={{ opacity: 0, scale: 0.5 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="text-xs font-mono"
                >
                  {count}
                </motion.span>
              )}
            </motion.button>
          );
        })}
      </AnimatePresence>
    </div>
  );
}
