import { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useEditorStore } from '@/stores/editorStore';
import { useThemeStore } from '@/stores/themeStore';
import { useKeyboard } from '@/hooks/useKeyboard';
import { projectApi } from '@/services/project';
import { registerAllComponents } from '@/components-library';
import DndProvider from '@/core/DragSystem/DndProvider';
import ComponentPanel from './ComponentPanel';
import Canvas from './Canvas';
import PropertyPanel from './PropertyPanel';
import AIPanel from './AIPanel';

// 注册所有组件
registerAllComponents();

export default function Editor() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { setProjectInfo, loadDSL, getDSL, projectName } = useEditorStore();
  const { theme, toggleTheme } = useThemeStore();

  // 键盘快捷键
  useKeyboard();

  useEffect(() => {
    if (id) {
      loadProject(id);
    }
  }, [id]);

  const loadProject = async (projectId: string) => {
    try {
      const res = await projectApi.getById(projectId);
      setProjectInfo(res.data._id, res.data.name);
      loadDSL(res.data.dsl);
    } catch (err) {
      console.error('加载项目失败:', err);
      navigate('/dashboard');
    }
  };

  const handleSave = async () => {
    if (!id) return;
    try {
      const dsl = getDSL();
      await projectApi.update(id, { dsl });
    } catch {
      alert('保存失败');
    }
  };

  const handleBack = () => {
    navigate('/dashboard');
  };

  const handlePreview = () => {
    if (id) {
      window.open(`/preview/${id}`, '_blank');
    }
  };

  const handleExportDSL = () => {
    const dsl = getDSL();
    const blob = new Blob([JSON.stringify(dsl, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${projectName}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <DndProvider>
      <div className="h-full flex flex-col" style={{ backgroundColor: 'var(--bg-primary)' }}>
        {/* 顶部工具栏 */}
        <header
          className="flex items-center justify-between px-4 py-2 border-b"
          style={{ borderColor: 'var(--border-primary)', backgroundColor: 'var(--bg-secondary)' }}
        >
          <div className="flex items-center gap-3">
            <button
              onClick={handleBack}
              className="px-2 py-1 rounded text-sm"
              style={{ color: 'var(--text-secondary)' }}
            >
              返回
            </button>
            <span className="font-medium" style={{ color: 'var(--text-primary)' }}>
              {projectName}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleExportDSL}
              className="px-3 py-1 rounded text-sm"
              style={{ backgroundColor: 'var(--bg-tertiary)', color: 'var(--text-secondary)' }}
            >
              导出
            </button>
            <button
              onClick={handlePreview}
              className="px-3 py-1 rounded text-sm"
              style={{ backgroundColor: 'var(--bg-tertiary)', color: 'var(--text-secondary)' }}
            >
              预览
            </button>
            <button
              onClick={toggleTheme}
              className="px-3 py-1 rounded text-sm"
              style={{ backgroundColor: 'var(--bg-tertiary)', color: 'var(--text-secondary)' }}
            >
              {theme === 'light' ? '暗色' : '亮色'}
            </button>
            <button
              onClick={handleSave}
              className="px-4 py-1 rounded text-sm text-white"
              style={{ backgroundColor: 'var(--accent)' }}
            >
              保存
            </button>
          </div>
        </header>

        {/* 主体区域 */}
        <div className="flex-1 flex overflow-hidden">
          {/* 左侧组件面板 */}
          <aside
            className="w-64 border-r flex-shrink-0 overflow-auto"
            style={{ borderColor: 'var(--border-primary)', backgroundColor: 'var(--bg-secondary)' }}
          >
            <ComponentPanel />
          </aside>

          {/* 中间画布 */}
          <main className="flex-1 overflow-hidden relative">
            <Canvas />
          </main>

          {/* 右侧属性面板 */}
          <aside
            className="w-80 border-l flex-shrink-0 overflow-auto"
            style={{ borderColor: 'var(--border-primary)', backgroundColor: 'var(--bg-secondary)' }}
          >
            <PropertyPanel />
          </aside>
        </div>

        {/* AI 面板 */}
        <AIPanel />
      </div>
    </DndProvider>
  );
}
