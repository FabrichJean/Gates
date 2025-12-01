import { create } from "zustand";

type CardState = {
  visible: boolean;
  collapsed: boolean;
  show: () => void;
  hide: () => void;
  toggle: () => void;
  expand: () => void;
  collapse: () => void;
  setVisible: (v: boolean) => void;
  setCollapsed: (c: boolean) => void;
};

const STORAGE_KEY = "card-flottant-store";

function readInitial(): { visible: boolean; collapsed: boolean } {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { visible: false, collapsed: false };
    const parsed = JSON.parse(raw);
    return {
      visible: Boolean(parsed.visible),
      collapsed: Boolean(parsed.collapsed),
    };
  } catch {
    return { visible: false, collapsed: false };
  }
}

export const useCardStore = create<CardState>((set, get) => {
  const initial = readInitial();

  // subscribe to changes and persist to localStorage
  const persist = () => {
    try {
      const state = { visible: get().visible, collapsed: get().collapsed } as any;
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      /* ignore */
    }
  };

  return {
    visible: initial.visible,
    collapsed: initial.collapsed,
    show: () => {
      set({ visible: true });
      persist();
    },
    hide: () => {
      set({ visible: false });
      persist();
    },
    toggle: () => {
      set((s) => ({ visible: !s.visible }));
      persist();
    },
    expand: () => {
      set({ collapsed: false });
      persist();
    },
    collapse: () => {
      set({ collapsed: true });
      persist();
    },
    setVisible: (v: boolean) => {
      set({ visible: v });
      persist();
    },
    setCollapsed: (c: boolean) => {
      set({ collapsed: c });
      persist();
    },
  } as CardState;
});

export default useCardStore;
