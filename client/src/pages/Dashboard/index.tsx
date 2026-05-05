import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/stores/authStore';
import { useThemeStore } from '@/stores/themeStore';
import { projectApi } from '@/services/project';
import type { Project } from '@/types';

export default function Dashboard() {
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);
  const { theme, toggleTheme } = useThemeStore();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProjects();
  }, []);

  const loadProjects = async () => {
    try {
      const res = await projectApi.getList();
      setProjects(res.data);
    } catch {
      // 静默处理
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async () => {
    try {
      const res = await projectApi.create({
        name: `新项目 ${projects.length + 1}`,
        dsl: {
          version: '1.0',
          screen: { width: 1920, height: 1080, backgroundColor: '#0a0a1a' },
          componentMap: {},
          rootComponentIds: [],
        },
      });
      navigate(`/editor/${res.data._id}`);
    } catch {
      alert('创建项目失败');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('确定删除此项目？')) return;
    try {
      await projectApi.delete(id);
      setProjects(projects.filter((p) => p._id !== id));
    } catch {
      alert('删除失败');
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="h-full flex flex-col" style={{ backgroundColor: 'var(--bg-primary)' }}>
      {/* 顶部导航 */}
      <header className="flex items-center justify-between px-6 py-4 border-b" style={{ borderColor: 'var(--border-primary)' }}>
        <h1 className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>
          AI 大屏低代码平台
        </h1>
        <div className="flex items-center gap-4">
          <button
            onClick={toggleTheme}
            className="px-3 py-1 rounded text-sm"
            style={{ backgroundColor: 'var(--bg-secondary)', color: 'var(--text-secondary)' }}
          >
            {theme === 'light' ? '暗色模式' : '亮色模式'}
          </button>
          <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>
            {user?.username}
          </span>
          <button
            onClick={handleLogout}
            className="px-3 py-1 rounded text-sm"
            style={{ color: 'var(--error)' }}
          >
            退出
          </button>
        </div>
      </header>

      {/* 项目列表 */}
      <main className="flex-1 overflow-auto p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>
            我的项目
          </h2>
          <button
            onClick={handleCreate}
            className="px-4 py-2 rounded text-white text-sm font-medium"
            style={{ backgroundColor: 'var(--accent)' }}
          >
            新建项目
          </button>
        </div>

        {loading ? (
          <div className="text-center py-12" style={{ color: 'var(--text-secondary)' }}>加载中...</div>
        ) : projects.length === 0 ? (
          <div className="text-center py-12" style={{ color: 'var(--text-secondary)' }}>
            暂无项目，点击上方按钮创建
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {projects.map((project) => (
              <div
                key={project._id}
                className="rounded-lg border p-4 cursor-pointer transition-colors hover:border-blue-400"
                style={{
                  backgroundColor: 'var(--bg-secondary)',
                  borderColor: 'var(--border-primary)',
                }}
                onClick={() => navigate(`/editor/${project._id}`)}
              >
                <div
                  className="w-full h-32 rounded mb-3 flex items-center justify-center"
                  style={{ backgroundColor: 'var(--bg-tertiary)' }}
                >
                  <span className="text-sm" style={{ color: 'var(--text-tertiary)' }}>预览图</span>
                </div>
                <h3 className="font-medium mb-1 truncate" style={{ color: 'var(--text-primary)' }}>
                  {project.name}
                </h3>
                <p className="text-xs mb-3" style={{ color: 'var(--text-tertiary)' }}>
                  更新于 {new Date(project.updatedAt).toLocaleDateString()}
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate(`/editor/${project._id}`);
                    }}
                    className="flex-1 px-3 py-1 rounded text-xs"
                    style={{ backgroundColor: 'var(--accent)', color: '#fff' }}
                  >
                    编辑
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDelete(project._id);
                    }}
                    className="px-3 py-1 rounded text-xs"
                    style={{ backgroundColor: 'var(--bg-tertiary)', color: 'var(--error)' }}
                  >
                    删除
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
