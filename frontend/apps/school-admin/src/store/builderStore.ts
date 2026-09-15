import { create } from 'zustand';
import type { Section } from '../types/builder';

const HISTORY_LIMIT = 50;

interface BuilderState {
  pageId: number | null;
  sections: Section[];
  selectedSectionId: string | null;
  history: Section[][];
  future: Section[][];
  savedSections: Section[];

  loadPage: (pageId: number, sections: Section[]) => void;
  selectSection: (id: string | null) => void;
  addSection: (typeKey: string) => void;
  removeSection: (id: string) => void;
  duplicateSection: (id: string) => void;
  moveSection: (id: string, direction: 'up' | 'down') => void;
  updateSectionProps: (id: string, props: Record<string, unknown>) => void;
  undo: () => void;
  redo: () => void;
  markSaved: () => void;

  canUndo: () => boolean;
  canRedo: () => boolean;
  isDirty: () => boolean;
}

function cloneSections(sections: Section[]): Section[] {
  return sections.map((s) => ({ ...s, props: { ...s.props } }));
}

export const useBuilderStore = create<BuilderState>((set, get) => ({
  pageId: null,
  sections: [],
  selectedSectionId: null,
  history: [],
  future: [],
  savedSections: [],

  loadPage: (pageId, sections) =>
    set({
      pageId,
      sections: cloneSections(sections),
      savedSections: cloneSections(sections),
      selectedSectionId: null,
      history: [],
      future: [],
    }),

  selectSection: (id) => set({ selectedSectionId: id }),

  addSection: (typeKey) => {
    const newSection: Section = { id: crypto.randomUUID(), type: typeKey, props: {} };
    pushHistoryAndApply(set, get, (sections) => [...sections, newSection]);
    set({ selectedSectionId: newSection.id });
  },

  removeSection: (id) => {
    pushHistoryAndApply(set, get, (sections) => sections.filter((s) => s.id !== id));
    if (get().selectedSectionId === id) set({ selectedSectionId: null });
  },

  duplicateSection: (id) => {
    let newId = '';
    pushHistoryAndApply(set, get, (sections) => {
      const index = sections.findIndex((s) => s.id === id);
      if (index === -1) return sections;
      newId = crypto.randomUUID();
      const copy: Section = { ...sections[index], id: newId, props: { ...sections[index].props } };
      const next = [...sections];
      next.splice(index + 1, 0, copy);
      return next;
    });
    if (newId) set({ selectedSectionId: newId });
  },

  moveSection: (id, direction) => {
    pushHistoryAndApply(set, get, (sections) => {
      const index = sections.findIndex((s) => s.id === id);
      const targetIndex = direction === 'up' ? index - 1 : index + 1;
      if (index === -1 || targetIndex < 0 || targetIndex >= sections.length) return sections;
      const next = [...sections];
      [next[index], next[targetIndex]] = [next[targetIndex], next[index]];
      return next;
    });
  },

  updateSectionProps: (id, props) => {
    pushHistoryAndApply(set, get, (sections) =>
      sections.map((s) => (s.id === id ? { ...s, props } : s)),
    );
  },

  undo: () => {
    const { history, sections, future } = get();
    if (history.length === 0) return;
    const previous = history[history.length - 1];
    set({
      sections: previous,
      history: history.slice(0, -1),
      future: [sections, ...future].slice(0, HISTORY_LIMIT),
    });
  },

  redo: () => {
    const { future, sections, history } = get();
    if (future.length === 0) return;
    const next = future[0];
    set({
      sections: next,
      future: future.slice(1),
      history: [...history, sections].slice(-HISTORY_LIMIT),
    });
  },

  markSaved: () => set((state) => ({ savedSections: cloneSections(state.sections) })),

  canUndo: () => get().history.length > 0,
  canRedo: () => get().future.length > 0,
  isDirty: () => JSON.stringify(get().sections) !== JSON.stringify(get().savedSections),
}));

/** Snapshots current sections onto the undo stack, clears redo, then applies `mutate`. */
function pushHistoryAndApply(
  set: (partial: Partial<BuilderState>) => void,
  get: () => BuilderState,
  mutate: (sections: Section[]) => Section[],
) {
  const { sections, history } = get();
  const next = mutate(sections);
  set({
    sections: next,
    history: [...history, sections].slice(-HISTORY_LIMIT),
    future: [],
  });
}
