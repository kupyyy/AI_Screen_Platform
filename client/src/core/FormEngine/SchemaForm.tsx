import { useCallback } from 'react';

interface SchemaFormProps {
  schema: Record<string, any>;
  values: Record<string, any>;
  onChange: (values: Record<string, any>) => void;
}

export default function SchemaForm({ schema, values, onChange }: SchemaFormProps) {
  const handleChange = useCallback(
    (key: string, value: any) => {
      onChange({ ...values, [key]: value });
    },
    [values, onChange]
  );

  if (!schema || !schema.properties) {
    return (
      <div className="text-center py-4" style={{ color: 'var(--text-tertiary)' }}>
        暂无配置项
      </div>
    );
  }

  const renderField = (key: string, fieldSchema: Record<string, any>) => {
    const value = values[key];

    switch (fieldSchema.type) {
      case 'string':
        if (fieldSchema.format === 'color') {
          return (
            <div key={key} className="mb-3">
              <label className="block text-xs mb-1" style={{ color: 'var(--text-tertiary)' }}>
                {fieldSchema.title || key}
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={value || '#000000'}
                  onChange={(e) => handleChange(key, e.target.value)}
                  className="w-8 h-8 rounded cursor-pointer"
                />
                <input
                  type="text"
                  value={value || ''}
                  onChange={(e) => handleChange(key, e.target.value)}
                  className="flex-1 px-2 py-1 rounded border text-sm"
                  style={{
                    backgroundColor: 'var(--bg-tertiary)',
                    borderColor: 'var(--border-primary)',
                    color: 'var(--text-primary)',
                  }}
                />
              </div>
            </div>
          );
        }

        if (fieldSchema.enum) {
          return (
            <div key={key} className="mb-3">
              <label className="block text-xs mb-1" style={{ color: 'var(--text-tertiary)' }}>
                {fieldSchema.title || key}
              </label>
              <select
                value={value || ''}
                onChange={(e) => handleChange(key, e.target.value)}
                className="w-full px-2 py-1.5 rounded border text-sm"
                style={{
                  backgroundColor: 'var(--bg-tertiary)',
                  borderColor: 'var(--border-primary)',
                  color: 'var(--text-primary)',
                }}
              >
                {fieldSchema.enum.map((opt: string, idx: number) => (
                  <option key={opt} value={opt}>
                    {fieldSchema.enumNames?.[idx] || opt}
                  </option>
                ))}
              </select>
            </div>
          );
        }

        return (
          <div key={key} className="mb-3">
            <label className="block text-xs mb-1" style={{ color: 'var(--text-tertiary)' }}>
              {fieldSchema.title || key}
            </label>
            <input
              type="text"
              value={value || ''}
              onChange={(e) => handleChange(key, e.target.value)}
              className="w-full px-2 py-1.5 rounded border text-sm"
              style={{
                backgroundColor: 'var(--bg-tertiary)',
                borderColor: 'var(--border-primary)',
                color: 'var(--text-primary)',
              }}
            />
          </div>
        );

      case 'number':
        return (
          <div key={key} className="mb-3">
            <label className="block text-xs mb-1" style={{ color: 'var(--text-tertiary)' }}>
              {fieldSchema.title || key}
            </label>
            <input
              type="number"
              value={value ?? ''}
              onChange={(e) => handleChange(key, Number(e.target.value))}
              min={fieldSchema.minimum}
              max={fieldSchema.maximum}
              className="w-full px-2 py-1.5 rounded border text-sm"
              style={{
                backgroundColor: 'var(--bg-tertiary)',
                borderColor: 'var(--border-primary)',
                color: 'var(--text-primary)',
              }}
            />
          </div>
        );

      case 'boolean':
        return (
          <div key={key} className="mb-3 flex items-center gap-2">
            <input
              type="checkbox"
              checked={value || false}
              onChange={(e) => handleChange(key, e.target.checked)}
              className="rounded"
            />
            <label className="text-xs" style={{ color: 'var(--text-tertiary)' }}>
              {fieldSchema.title || key}
            </label>
          </div>
        );

      case 'array':
        return (
          <div key={key} className="mb-3">
            <label className="block text-xs mb-1" style={{ color: 'var(--text-tertiary)' }}>
              {fieldSchema.title || key}
            </label>
            <textarea
              value={JSON.stringify(value || [], null, 2)}
              onChange={(e) => {
                try {
                  handleChange(key, JSON.parse(e.target.value));
                } catch {
                  // 忽略解析错误
                }
              }}
              rows={4}
              className="w-full px-2 py-1.5 rounded border text-sm font-mono"
              style={{
                backgroundColor: 'var(--bg-tertiary)',
                borderColor: 'var(--border-primary)',
                color: 'var(--text-primary)',
              }}
            />
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div>
      {Object.entries(schema.properties).map(([key, fieldSchema]) =>
        renderField(key, fieldSchema as Record<string, any>)
      )}
    </div>
  );
}
