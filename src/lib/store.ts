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
            newReactions[itemId] = {
              like: 0,
              love: 0,
              laugh: 0,
              shocked: 0,
              mad: 0,
              care: 0,
            };
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
              [itemId]: {
                like: Math.floor(Math.random() * 20) + 5,
                love: Math.floor(Math.random() * 15) + 3,
                laugh: Math.floor(Math.random() * 10) + 2,
                shocked: Math.floor(Math.random() * 8) + 1,
                mad: Math.floor(Math.random() * 5) + 1,
                care: Math.floor(Math.random() * 12) + 4,
              },
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

// Contact Form Store
interface ContactDraft {
  id: string;
  name: string;
  email: string;
  notes: string;
  createdAt: string;
}

interface ContactState {
  drafts: ContactDraft[];
  addDraft: (draft: Omit<ContactDraft, 'id' | 'createdAt'>) => void;
}

export const useContactStore = create<ContactState>()(
  persist(
    (set) => ({
      drafts: [],
      addDraft: (draft) => {
        const newDraft: ContactDraft = {
          ...draft,
          id: `draft-${Date.now()}`,
          createdAt: new Date().toISOString(),
        };
        set((state) => ({
          drafts: [newDraft, ...state.drafts].slice(0, 10), // Keep last 10
        }));
      },
    }),
    {
      name: 'connectDrafts',
    }
  )
);

// Admin Store
interface ContentItem {
  id: string;
  type: 'text' | 'image' | 'video' | 'audio' | 'file' | 'pdf' | 'zip' | 'code';
  content: string;
  title?: string;
  description?: string;
  order: number;
  createdAt: string;
  updatedAt: string;
}

interface AdminState {
  items: ContentItem[];
  addItem: (item: Omit<ContentItem, 'id' | 'order' | 'createdAt' | 'updatedAt'>) => void;
  updateItem: (id: string, updates: Partial<ContentItem>) => void;
  deleteItem: (id: string) => void;
  reorderItems: (items: ContentItem[]) => void;
}

export const useAdminStore = create<AdminState>()(
  persist(
    (set) => ({
      items: [],
      addItem: (item) => {
        const newItem: ContentItem = {
          ...item,
          id: `item-${Date.now()}`,
          order: 0,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        set((state) => {
          const items = [...state.items, newItem].map((item, index) => ({
            ...item,
            order: index,
          }));
          return { items };
        });
      },
      updateItem: (id, updates) => {
        set((state) => ({
          items: state.items.map((item) =>
            item.id === id
              ? { ...item, ...updates, updatedAt: new Date().toISOString() }
              : item
          ),
        }));
      },
      deleteItem: (id) => {
        set((state) => ({
          items: state.items.filter((item) => item.id !== id),
        }));
      },
      reorderItems: (items) => {
        set({ items });
      },
    }),
    {
      name: 'admin-content',
    }
  )
);
