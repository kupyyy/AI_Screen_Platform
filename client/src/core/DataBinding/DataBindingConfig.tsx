import { useState } from 'react';
import type { DataBinding } from '@/types';

interface DataBindingConfigProps {
  binding?: DataBinding;
  onChange: (binding: DataBinding | undefined) => void;
}

export default function DataBindingConfig({ binding, onChange }: DataBindingConfigProps) {
  const [bindingType, setBindingType] = useState<DataBinding['type']>(binding?.type || 'static');

  const handleTypeChange = (type: DataBinding['type']) => {
    setBindingType(type);

    switch (type) {
      case 'static':
        onChange({ type: 'static', config: { data: [] } });
        break;
      case 'api':
        onChange({
          type: 'api',
          config: { url: '', method: 'GET', headers: {}, interval: 0 },
        });
        break;
      case 'websocket':
        onChange({ type: 'websocket', config: { url: '', reconnectInterval: 5000 } });
        break;
    }
  };

  return (
    <div className="mb-4">
      <label className="block text-xs mb-2" style={{ color: 'var(--text-tertiary)' }}>
        数据绑定
      </label>

      <select
        value={bindingType}
        onChange={(e) => handleTypeChange(e.target.value as DataBinding['type'])}
        className="w-full px-2 py-1.5 rounded border text-sm mb-3"
        style={{
          backgroundColor: 'var(--bg-tertiary)',
          borderColor: 'var(--border-primary)',
          color: 'var(--text-primary)',
        }}
      >
        <option value="static">静态数据</option>
        <option value="api">API 数据源</option>
        <option value="websocket">WebSocket 实时数据</option>
      </select>

      {bindingType === 'api' && (
        <div className="space-y-2">
          <div>
            <label className="block text-xs mb-1" style={{ color: 'var(--text-tertiary)' }}>
              API 地址
            </label>
            <input
              type="text"
              value={binding?.config?.url || ''}
              onChange={(e) =>
                onChange({
                  type: 'api',
                  config: { ...binding?.config, url: e.target.value },
                })
              }
              placeholder="https://api.example.com/data"
              className="w-full px-2 py-1.5 rounded border text-sm"
              style={{
                backgroundColor: 'var(--bg-tertiary)',
                borderColor: 'var(--border-primary)',
                color: 'var(--text-primary)',
              }}
            />
          </div>

          <div>
            <label className="block text-xs mb-1" style={{ color: 'var(--text-tertiary)' }}>
              轮询间隔 (ms)
            </label>
            <input
              type="number"
              value={binding?.config?.interval || 0}
              onChange={(e) =>
                onChange({
                  type: 'api',
                  config: { ...binding?.config, interval: Number(e.target.value) },
                })
              }
              min={0}
              placeholder="0 表示不轮询"
              className="w-full px-2 py-1.5 rounded border text-sm"
              style={{
                backgroundColor: 'var(--bg-tertiary)',
                borderColor: 'var(--border-primary)',
                color: 'var(--text-primary)',
              }}
            />
          </div>
        </div>
      )}

      {bindingType === 'websocket' && (
        <div className="space-y-2">
          <div>
            <label className="block text-xs mb-1" style={{ color: 'var(--text-tertiary)' }}>
              WebSocket 地址
            </label>
            <input
              type="text"
              value={binding?.config?.url || ''}
              onChange={(e) =>
                onChange({
                  type: 'websocket',
                  config: { ...binding?.config, url: e.target.value },
                })
              }
              placeholder="ws://localhost:8080"
              className="w-full px-2 py-1.5 rounded border text-sm"
              style={{
                backgroundColor: 'var(--bg-tertiary)',
                borderColor: 'var(--border-primary)',
                color: 'var(--text-primary)',
              }}
            />
          </div>

          <div>
            <label className="block text-xs mb-1" style={{ color: 'var(--text-tertiary)' }}>
              重连间隔 (ms)
            </label>
            <input
              type="number"
              value={binding?.config?.reconnectInterval || 5000}
              onChange={(e) =>
                onChange({
                  type: 'websocket',
                  config: { ...binding?.config, reconnectInterval: Number(e.target.value) },
                })
              }
              min={0}
              className="w-full px-2 py-1.5 rounded border text-sm"
              style={{
                backgroundColor: 'var(--bg-tertiary)',
                borderColor: 'var(--border-primary)',
                color: 'var(--text-primary)',
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
}
