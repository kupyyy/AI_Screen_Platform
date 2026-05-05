import { useEditorStore } from '@/stores/editorStore';
import { componentRegistry } from '@/components-library';
import SchemaForm from '@/core/FormEngine/SchemaForm';

export default function PropertyPanel() {
  const {
    selectedId,
    componentMap,
    updateComponent,
    updateComponentProps,
    deleteComponent,
    moveComponentOrder,
  } = useEditorStore();

  if (!selectedId || !componentMap[selectedId]) {
    return (
      <div className="p-4">
        <h3 className="text-sm font-medium mb-3" style={{ color: 'var(--text-primary)' }}>
          属性面板
        </h3>
        <div className="text-center py-8" style={{ color: 'var(--text-tertiary)' }}>
          请选择一个组件
        </div>
      </div>
    );
  }

  const comp = componentMap[selectedId];
  const meta = componentRegistry.getMeta(comp.type);
  const schema = meta?.schema;

  const handlePositionChange = (key: string, value: number) => {
    moveComponent(selectedId, { [key]: value });
  };

  const handleNameChange = (name: string) => {
    updateComponent(selectedId, { name });
  };

  const handlePropsChange = (props: Record<string, any>) => {
    updateComponentProps(selectedId, props);
  };

  const handleDelete = () => {
    if (confirm('确定删除此组件？')) {
      deleteComponent(selectedId);
    }
  };

  return (
    <div className="p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
          属性面板
        </h3>
        <button
          onClick={handleDelete}
          className="px-2 py-1 rounded text-xs"
          style={{ color: 'var(--error)', backgroundColor: 'rgba(255,77,79,0.1)' }}
        >
          删除
        </button>
      </div>

      {/* 基本信息 */}
      <div className="mb-4">
        <label className="block text-xs mb-1" style={{ color: 'var(--text-tertiary)' }}>
          组件名称
        </label>
        <input
          type="text"
          value={comp.name}
          onChange={(e) => handleNameChange(e.target.value)}
          className="w-full px-3 py-1.5 rounded border text-sm"
          style={{
            backgroundColor: 'var(--bg-tertiary)',
            borderColor: 'var(--border-primary)',
            color: 'var(--text-primary)',
          }}
        />
      </div>

      <div className="mb-4">
        <label className="block text-xs mb-1" style={{ color: 'var(--text-tertiary)' }}>
          组件类型
        </label>
        <div className="px-3 py-1.5 rounded text-sm" style={{ backgroundColor: 'var(--bg-tertiary)', color: 'var(--text-secondary)' }}>
          {comp.type}
        </div>
      </div>

      {/* 位置和尺寸 */}
      <div className="mb-4">
        <label className="block text-xs mb-2" style={{ color: 'var(--text-tertiary)' }}>
          位置和尺寸
        </label>
        <div className="grid grid-cols-2 gap-2">
          {(['x', 'y', 'width', 'height'] as const).map((key) => (
            <div key={key}>
              <label className="block text-xs mb-1" style={{ color: 'var(--text-tertiary)' }}>
                {key === 'x' ? 'X' : key === 'y' ? 'Y' : key === 'width' ? '宽' : '高'}
              </label>
              <input
                type="number"
                value={comp.position[key]}
                onChange={(e) => handlePositionChange(key, Number(e.target.value))}
                className="w-full px-2 py-1 rounded border text-sm"
                style={{
                  backgroundColor: 'var(--bg-tertiary)',
                  borderColor: 'var(--border-primary)',
                  color: 'var(--text-primary)',
                }}
              />
            </div>
          ))}
        </div>
      </div>

      {/* 层级管理 */}
      <div className="mb-4">
        <label className="block text-xs mb-2" style={{ color: 'var(--text-tertiary)' }}>
          层级管理
        </label>
        <div className="flex items-center gap-2 mb-2">
          <input
            type="number"
            value={comp.position.zIndex}
            onChange={(e) => handlePositionChange('zIndex', Number(e.target.value))}
            className="flex-1 px-2 py-1 rounded border text-sm"
            style={{
              backgroundColor: 'var(--bg-tertiary)',
              borderColor: 'var(--border-primary)',
              color: 'var(--text-primary)',
            }}
          />
        </div>
        <div className="grid grid-cols-4 gap-1">
          <button
            onClick={() => moveComponentOrder(selectedId, 'top')}
            className="px-2 py-1 rounded text-xs"
            style={{ backgroundColor: 'var(--bg-tertiary)', color: 'var(--text-secondary)' }}
            title="置顶"
          >
            置顶
          </button>
          <button
            onClick={() => moveComponentOrder(selectedId, 'up')}
            className="px-2 py-1 rounded text-xs"
            style={{ backgroundColor: 'var(--bg-tertiary)', color: 'var(--text-secondary)' }}
            title="上移"
          >
            上移
          </button>
          <button
            onClick={() => moveComponentOrder(selectedId, 'down')}
            className="px-2 py-1 rounded text-xs"
            style={{ backgroundColor: 'var(--bg-tertiary)', color: 'var(--text-secondary)' }}
            title="下移"
          >
            下移
          </button>
          <button
            onClick={() => moveComponentOrder(selectedId, 'bottom')}
            className="px-2 py-1 rounded text-xs"
            style={{ backgroundColor: 'var(--bg-tertiary)', color: 'var(--text-secondary)' }}
            title="置底"
          >
            置底
          </button>
        </div>
      </div>

      {/* 组件特定属性 - 由 JSON Schema 动态生成 */}
      <div className="mb-4">
        <label className="block text-xs mb-2" style={{ color: 'var(--text-tertiary)' }}>
          组件属性
        </label>
        {schema ? (
          <SchemaForm
            schema={schema}
            values={comp.props}
            onChange={handlePropsChange}
          />
        ) : (
          <div className="p-3 rounded text-xs text-center" style={{ backgroundColor: 'var(--bg-tertiary)', color: 'var(--text-tertiary)' }}>
            暂无配置项
          </div>
        )}
      </div>
    </div>
  );
}

function moveComponent(id: string, updates: Record<string, number>) {
  const store = useEditorStore.getState();
  store.moveComponent(id, updates);
}
