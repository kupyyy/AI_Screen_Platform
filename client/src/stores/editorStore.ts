import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import { v4 as uuidv4 } from 'uuid';
import type { DSLComponent, ComponentPosition, ScreenDSL } from '@/types';

const MAX_HISTORY = 50;

interface EditorState {
  // 画布状态
  mode: 'edit' | 'preview';
  scale: number;
  scaleMode: 'auto' | 'manual';
  gridSize: number;
  showGrid: boolean;

  // 组件状态 - 扁平 Map 结构
  componentMap: Record<string, DSLComponent>;
  rootComponentIds: string[];
  selectedId: string | null;
  clipboard: DSLComponent | null;

  // 项目信息
  projectId: string | null;
  projectName: string;

  // 历史记录
  history: Record<string, DSLComponent>[];
  historyIndex: number;
}

interface EditorActions {
  // 画布操作
  setMode: (mode: 'edit' | 'preview') => void;
  setScale: (scale: number) => void;
  setScaleMode: (mode: 'auto' | 'manual') => void;
  setGridSize: (size: number) => void;
  toggleGrid: () => void;

  // 组件操作
  addComponent: (comp: DSLComponent, parentId?: string) => void;
  updateComponent: (id: string, updates: Partial<DSLComponent>) => void;
  updateComponentProps: (id: string, props: Record<string, any>) => void;
  deleteComponent: (id: string) => void;
  selectComponent: (id: string | null) => void;
  moveComponent: (id: string, position: Partial<ComponentPosition>) => void;
  moveComponentOrder: (id: string, direction: 'up' | 'down' | 'top' | 'bottom') => void;

  // 剪贴板
  copyComponent: (id: string) => void;
  pasteComponent: () => void;

  // 历史记录
  undo: () => void;
  redo: () => void;
  pushHistory: () => void;

  // DSL 操作
  loadDSL: (dsl: ScreenDSL) => void;
  getDSL: () => ScreenDSL;
  clearCanvas: () => void;

  // 项目信息
  setProjectInfo: (id: string, name: string) => void;
}

export type EditorStore = EditorState & EditorActions;

export const useEditorStore = create<EditorStore>()(
  immer((set, get) => ({
    // 初始状态
    mode: 'edit',
    scale: 1,
    scaleMode: 'auto',
    gridSize: 10,
    showGrid: true,

    componentMap: {},
    rootComponentIds: [],
    selectedId: null,
    clipboard: null,

    projectId: null,
    projectName: '未命名项目',

    history: [{}, {}],
    historyIndex: 0,

    // 画布操作
    setMode: (mode) => set({ mode }),
    setScale: (scale) => set({ scale: Math.max(0.25, Math.min(4, scale)) }),
    setScaleMode: (scaleMode) => set({ scaleMode }),
    setGridSize: (gridSize) => set({ gridSize }),
    toggleGrid: () => set((state) => ({ showGrid: !state.showGrid })),

    // 组件操作
    addComponent: (comp, parentId) =>
      set((state) => {
        state.componentMap[comp.id] = comp;

        if (parentId && state.componentMap[parentId]) {
          comp.parentId = parentId;
          state.componentMap[parentId].childIds.push(comp.id);
        } else {
          comp.parentId = null;
          state.rootComponentIds.push(comp.id);
        }

        get().pushHistory();
      }),

    updateComponent: (id, updates) =>
      set((state) => {
        if (state.componentMap[id]) {
          Object.assign(state.componentMap[id], updates);
        }
      }),

    updateComponentProps: (id, props) =>
      set((state) => {
        if (state.componentMap[id]) {
          Object.assign(state.componentMap[id].props, props);
        }
      }),

    deleteComponent: (id) =>
      set((state) => {
        const comp = state.componentMap[id];
        if (!comp) return;

        // 递归删除子组件
        const deleteRecursive = (compId: string) => {
          const c = state.componentMap[compId];
          if (!c) return;
          c.childIds.forEach(deleteRecursive);
          delete state.componentMap[compId];
        };

        // 从父组件中移除
        if (comp.parentId && state.componentMap[comp.parentId]) {
          const parent = state.componentMap[comp.parentId];
          parent.childIds = parent.childIds.filter((cid) => cid !== id);
        } else {
          state.rootComponentIds = state.rootComponentIds.filter((cid) => cid !== id);
        }

        deleteRecursive(id);

        if (state.selectedId === id) {
          state.selectedId = null;
        }

        get().pushHistory();
      }),

    selectComponent: (id) => set({ selectedId: id }),

    moveComponent: (id, position) =>
      set((state) => {
        if (state.componentMap[id]) {
          Object.assign(state.componentMap[id].position, position);
        }
      }),

    moveComponentOrder: (id, direction) =>
      set((state) => {
        const comp = state.componentMap[id];
        if (!comp) return;

        const list = comp.parentId
          ? state.componentMap[comp.parentId]?.childIds
          : state.rootComponentIds;

        if (!list) return;

        const idx = list.indexOf(id);
        if (idx === -1) return;

        switch (direction) {
          case 'up':
            if (idx < list.length - 1) {
              [list[idx], list[idx + 1]] = [list[idx + 1], list[idx]];
            }
            break;
          case 'down':
            if (idx > 0) {
              [list[idx], list[idx - 1]] = [list[idx - 1], list[idx]];
            }
            break;
          case 'top':
            list.splice(idx, 1);
            list.push(id);
            break;
          case 'bottom':
            list.splice(idx, 1);
            list.unshift(id);
            break;
        }
      }),

    // 剪贴板
    copyComponent: (id) =>
      set((state) => {
        const comp = state.componentMap[id];
        if (comp) {
          state.clipboard = JSON.parse(JSON.stringify(comp));
        }
      }),

    pasteComponent: () =>
      set((state) => {
        if (!state.clipboard) return;

        const newComp: DSLComponent = {
          ...JSON.parse(JSON.stringify(state.clipboard)),
          id: uuidv4(),
          name: `${state.clipboard.name} (副本)`,
          position: {
            ...state.clipboard.position,
            x: state.clipboard.position.x + 20,
            y: state.clipboard.position.y + 20,
          },
          parentId: null,
          childIds: [],
        };

        state.componentMap[newComp.id] = newComp;
        state.rootComponentIds.push(newComp.id);
        state.selectedId = newComp.id;
        state.clipboard = newComp;

        get().pushHistory();
      }),

    // 历史记录
    pushHistory: () =>
      set((state) => {
        const snapshot = JSON.parse(JSON.stringify(state.componentMap));
        const newHistory = state.history.slice(0, state.historyIndex + 1);
        newHistory.push(snapshot);

        if (newHistory.length > MAX_HISTORY) {
          newHistory.shift();
        }

        state.history = newHistory;
        state.historyIndex = newHistory.length - 1;
      }),

    undo: () =>
      set((state) => {
        if (state.historyIndex > 0) {
          state.historyIndex--;
          state.componentMap = JSON.parse(JSON.stringify(state.history[state.historyIndex]));
        }
      }),

    redo: () =>
      set((state) => {
        if (state.historyIndex < state.history.length - 1) {
          state.historyIndex++;
          state.componentMap = JSON.parse(JSON.stringify(state.history[state.historyIndex]));
        }
      }),

    // DSL 操作
    loadDSL: (dsl) => {
      const componentMap = dsl.componentMap || {};
      const rootComponentIds = dsl.rootComponentIds || [];
      set({
        componentMap,
        rootComponentIds,
        selectedId: null,
        history: [JSON.parse(JSON.stringify(componentMap))],
        historyIndex: 0,
      });
    },

    getDSL: () => {
      const state = get();
      return {
        version: '1.0',
        screen: {
          width: 1920,
          height: 1080,
          backgroundColor: '#0a0a1a',
        },
        componentMap: state.componentMap,
        rootComponentIds: state.rootComponentIds,
      };
    },

    clearCanvas: () =>
      set({
        componentMap: {},
        rootComponentIds: [],
        selectedId: null,
        history: [{}],
        historyIndex: 0,
      }),

    setProjectInfo: (id, name) => set({ projectId: id, projectName: name }),
  }))
);
