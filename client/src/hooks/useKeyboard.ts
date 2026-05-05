import { useEffect } from 'react';
import { useEditorStore } from '@/stores/editorStore';

export function useKeyboard() {
  const {
    selectedId,
    deleteComponent,
    copyComponent,
    pasteComponent,
    undo,
    redo,
    selectComponent,
  } = useEditorStore();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // 忽略输入框中的快捷键
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement ||
        e.target instanceof HTMLSelectElement
      ) {
        return;
      }

      const isCtrl = e.ctrlKey || e.metaKey;

      // Ctrl+Z: 撤销
      if (isCtrl && e.key === 'z' && !e.shiftKey) {
        e.preventDefault();
        undo();
        return;
      }

      // Ctrl+Shift+Z 或 Ctrl+Y: 重做
      if ((isCtrl && e.shiftKey && e.key === 'z') || (isCtrl && e.key === 'y')) {
        e.preventDefault();
        redo();
        return;
      }

      // Ctrl+C: 复制
      if (isCtrl && e.key === 'c' && selectedId) {
        e.preventDefault();
        copyComponent(selectedId);
        return;
      }

      // Ctrl+V: 粘贴
      if (isCtrl && e.key === 'v') {
        e.preventDefault();
        pasteComponent();
        return;
      }

      // Delete 或 Backspace: 删除
      if ((e.key === 'Delete' || e.key === 'Backspace') && selectedId) {
        e.preventDefault();
        deleteComponent(selectedId);
        return;
      }

      // Escape: 取消选中
      if (e.key === 'Escape') {
        e.preventDefault();
        selectComponent(null);
        return;
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [selectedId, deleteComponent, copyComponent, pasteComponent, undo, redo, selectComponent]);
}
