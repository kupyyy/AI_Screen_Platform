import { useEffect, useRef, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useEditorStore } from '@/stores/editorStore';
import { componentRegistry } from '@/components-library';
import { projectApi } from '@/services/project';
import { registerAllComponents } from '@/components-library';

// 注册所有组件
registerAllComponents();

export default function Preview() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const containerRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);
  const { componentMap, rootComponentIds, loadDSL } = useEditorStore();

  useEffect(() => {
    if (id) {
      loadProject(id);
    }
  }, [id]);

  useEffect(() => {
    const handleResize = () => {
      if (!containerRef.current) return;
      const { width, height } = containerRef.current.getBoundingClientRect();
      const scaleX = width / 1920;
      const scaleY = height / 1080;
      setScale(Math.min(scaleX, scaleY));
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const loadProject = async (projectId: string) => {
    try {
      const res = await projectApi.getById(projectId);
      loadDSL(res.data.dsl);
    } catch {
      navigate('/dashboard');
    }
  };

  // 渲染单个组件
  const renderComponent = (compId: string) => {
    const comp = componentMap[compId];
    if (!comp) return null;

    const ComponentImpl = componentRegistry.getComponent(comp.type);
    if (!ComponentImpl) return null;

    return (
      <div
        key={compId}
        className="absolute"
        style={{
          left: `${comp.position.x}px`,
          top: `${comp.position.y}px`,
          width: `${comp.position.width}px`,
          height: `${comp.position.height}px`,
          zIndex: comp.position.zIndex,
        }}
      >
        <div className="w-full h-full overflow-hidden">
          <ComponentImpl {...comp.props} />
          {comp.childIds.map((childId) => renderComponent(childId))}
        </div>
      </div>
    );
  };

  return (
    <div
      ref={containerRef}
      className="w-full h-full overflow-hidden"
      style={{ backgroundColor: '#0a0a1a' }}
    >
      <div
        className="relative"
        style={{
          width: 1920,
          height: 1080,
          transform: `scale(${scale})`,
          transformOrigin: 'top left',
          position: 'absolute',
          left: '50%',
          top: '50%',
          marginLeft: -960,
          marginTop: -540,
        }}
      >
        {rootComponentIds.map((id) => renderComponent(id))}
      </div>
    </div>
  );
}
