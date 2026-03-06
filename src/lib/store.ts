import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { ReactionType } from '@/lib/data';

export type { ReactionType } from '@/lib/data';

// Lightbox Store
interface LightboxState {
  isOpen: boolean;
  currentIndex: number;
  open: (index: number) => void;
  close: () => void;
  next: () => void;
  prev: () => void;
  setCurrentIndex: (index: number) => void;
}

export const useLightboxStore = create<LightboxState>((set) => ({
  isOpen: false,
  currentIndex: 0,
  open: (index) => set({ isOpen: true, currentIndex: index }),
  close: () => set({ isOpen: false }),
  next: () => set((state) => ({ currentIndex: state.currentIndex + 1 })),
  prev: () => set((state) => ({ currentIndex: state.currentIndex - 1 })),
  setCurrentIndex: (index) => set({ currentIndex: index }),
}));

// Page Store
interface PageState {
  currentPage: string;
  setCurrentPage: (page: string) => void;
}

export const usePageStore = create<PageState>((set) => ({
  currentPage: 'home',
  setCurrentPage: (page) => set({ currentPage: page }),
}));

// Seeded random number generator for consistent reaction counts
// This ensures the same item always shows the same initial reaction counts
function seededRandom(seed: string): number {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    const char = seed.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  // Normalize to 0-1 range
  return Math.abs(hash) / 2147483647;
}

// Generate consistent initial reactions based on item ID
function generateInitialReactions(itemId: string): Record<ReactionType, number> {
  const baseSeed = itemId;
  return {
    like: Math.floor(seededRandom(baseSeed + 'like') * 20) + 5,
    love: Math.floor(seededRandom(baseSeed + 'love') * 15) + 3,
    laugh: Math.floor(seededRandom(baseSeed + 'laugh') * 10) + 2,
    shocked: Math.floor(seededRandom(baseSeed + 'shocked') * 8) + 1,
    mad: Math.floor(seededRandom(baseSeed + 'mad') * 5) + 1,
    care: Math.floor(seededRandom(baseSeed + 'care') * 12) + 4,
  };
}

// Reactions Store
interface ReactionState {
  reactions: Record<string, Record<ReactionType, number>>;
  userReactions: Record<string, ReactionType | null>;
  addReaction: (itemId: string, reaction: ReactionType) => void;
  removeReaction: (itemId: string) => void;
  initializeReactions: (itemId: string) => void;
}

export const useReactionStore = create<ReactionState>()(
  persist(
    (set, get) => ({
      reactions: {},
      userReactions: {},
      addReaction: (itemId, reaction) => {
        const state = get();
        const currentReaction = state.userReactions[itemId];
        
        set((state) => {
          const newReactions = { ...state.reactions };
          const newUserReactions = { ...state.userReactions };
          
          // Initialize if needed
          if (!newReactions[itemId]) {
            newReactions[itemId] = generateInitialReactions(itemId);
          }
          
          // Remove previous reaction if exists
          if (currentReaction) {
            newReactions[itemId][currentReaction] = Math.max(0, newReactions[itemId][currentReaction] - 1);
          }
          
          // Add new reaction
          newReactions[itemId][reaction] += 1;
          newUserReactions[itemId] = reaction;
          
          return { reactions: newReactions, userReactions: newUserReactions };
        });
      },
      removeReaction: (itemId) => {
        const state = get();
        const currentReaction = state.userReactions[itemId];
        
        if (!currentReaction) return;
        
        set((state) => {
          const newReactions = { ...state.reactions };
          const newUserReactions = { ...state.userReactions };
          
          if (newReactions[itemId] && currentReaction) {
            newReactions[itemId][currentReaction] = Math.max(0, newReactions[itemId][currentReaction] - 1);
          }
          
          newUserReactions[itemId] = null;
          
          return { reactions: newReactions, userReactions: newUserReactions };
        });
      },
      initializeReactions: (itemId) => {
        const state = get();
        if (!state.reactions[itemId]) {
          set((state) => ({
            reactions: {
              ...state.reactions,
              [itemId]: generateInitialReactions(itemId),
            },
          }));
        }
      },
    }),
    {
      name: 'reactions-storage',
    }
  )
);
