import { componentRegistry } from '@/components-library';
import DraggableComponent from '@/core/DragSystem/DraggableComponent';

export default function ComponentPanel() {
  const categories = componentRegistry.getCategories();

  return (
    <div className="p-3">
      <h3 className="text-sm font-medium mb-3" style={{ color: 'var(--text-primary)' }}>
        组件库
      </h3>
      {categories.map((category) => (
        <div key={category} className="mb-4">
          <div className="text-xs mb-2" style={{ color: 'var(--text-tertiary)' }}>
            {category}
          </div>
          <div className="grid grid-cols-2 gap-2">
            {componentRegistry.getMetaByCategory(category).map((meta) => (
              <DraggableComponent
                key={meta.type}
                type={meta.type}
                name={meta.name}
              >
                <div
                  className="flex flex-col items-center gap-1 p-3 rounded border cursor-grab transition-colors hover:border-blue-400"
                  style={{
                    backgroundColor: 'var(--bg-tertiary)',
                    borderColor: 'var(--border-primary)',
                  }}
                >
                  <span className="text-xl">{meta.icon === 'BarChart' ? '📊' : meta.icon === 'LineChart' ? '📈' : meta.icon === 'PieChart' ? '🥧' : meta.icon === 'Text' ? '📝' : meta.icon === 'Image' ? '🖼️' : '📋'}</span>
                  <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                    {meta.name}
                  </span>
                </div>
              </DraggableComponent>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
