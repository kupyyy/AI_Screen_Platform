import { useState, useCallback } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { useEditorStore } from '@/stores/editorStore';
import { useSSE } from '@/hooks/useSSE';
import type { DSLComponent } from '@/types';

export default function AIPanel() {
  const [prompt, setPrompt] = useState('');
  const [messages, setMessages] = useState<Array<{ role: 'user' | 'ai'; content: string }>>([]);
  const { selectedId, componentMap, addComponent, updateComponentProps, deleteComponent, getDSL } =
    useEditorStore();

  const handleEvent = useCallback(
    (event: { type: string; data: any }) => {
      if (event.type === 'tool_call') {
        const { tool, args } = event.data;

        switch (tool) {
          case 'addComponent': {
            const comp: DSLComponent = {
              id: uuidv4(),
              type: args.componentType,
              name: args.componentType,
              parentId: null,
              childIds: [],
              position: {
                x: args.position?.x ?? 100,
                y: args.position?.y ?? 100,
                width: args.position?.width ?? 400,
                height: args.position?.height ?? 300,
                zIndex: Date.now(),
              },
              props: args.props || {},
            };
            addComponent(comp);
            setMessages((prev) => [
              ...prev,
              { role: 'ai', content: `添加组件: ${comp.name}` },
            ]);
            break;
          }

          case 'modifyComponent':
            updateComponentProps(args.componentId, args.props);
            setMessages((prev) => [
              ...prev,
              { role: 'ai', content: `修改组件属性` },
            ]);
            break;

          case 'removeComponent':
            deleteComponent(args.componentId);
            setMessages((prev) => [
              ...prev,
              { role: 'ai', content: `删除组件` },
            ]);
            break;
        }
      }

      if (event.type === 'message') {
        setMessages((prev) => [
          ...prev,
          { role: 'ai', content: event.data.content },
        ]);
      }
    },
    [addComponent, updateComponentProps, deleteComponent]
  );

  const handleDone = useCallback(() => {
    setMessages((prev) => [...prev, { role: 'ai', content: '生成完成' }]);
  }, []);

  const handleError = useCallback((error: string) => {
    setMessages((prev) => [...prev, { role: 'ai', content: `错误: ${error}` }]);
  }, []);

  const handleCancel = useCallback(() => {
    setMessages((prev) => [...prev, { role: 'ai', content: '生成已取消' }]);
  }, []);

  const { isGenerating, startGeneration, cancelGeneration } = useSSE({
    onEvent: handleEvent,
    onDone: handleDone,
    onError: handleError,
    onCancel: handleCancel,
  });

  const handleSubmit = () => {
    if (!prompt.trim() || isGenerating) return;

    const userMessage = prompt.trim();
    setPrompt('');
    setMessages((prev) => [...prev, { role: 'user', content: userMessage }]);

    const currentDSL = getDSL();

    if (selectedId && componentMap[selectedId]) {
      // 修改选中的组件
      startGeneration('/api/ai/modify', {
        componentId: selectedId,
        componentInfo: componentMap[selectedId],
        prompt: userMessage,
      });
    } else {
      // 生成整屏
      startGeneration('/api/ai/generate', {
        prompt: userMessage,
        currentDSL,
      });
    }
  };

  const handleCancelGeneration = () => {
    cancelGeneration();
  };

  const handleClear = () => {
    setMessages([]);
  };

  return (
    <div
      className="h-64 border-t flex flex-col"
      style={{ borderColor: 'var(--border-primary)', backgroundColor: 'var(--bg-secondary)' }}
    >
      {/* 标题栏 */}
      <div className="flex items-center justify-between px-3 py-2 border-b" style={{ borderColor: 'var(--border-primary)' }}>
        <span className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
          AI 助手
        </span>
        <button
          onClick={handleClear}
          className="text-xs px-2 py-1 rounded"
          style={{ color: 'var(--text-tertiary)' }}
        >
          清空
        </button>
      </div>

      {/* 消息区域 */}
      <div className="flex-1 overflow-auto p-3">
        {messages.length === 0 ? (
          <div className="text-center py-4" style={{ color: 'var(--text-tertiary)' }}>
            {selectedId
              ? '输入指令修改选中组件...'
              : '描述你想要的大屏，AI 将为你生成...'}
          </div>
        ) : (
          messages.map((msg, idx) => (
            <div
              key={idx}
              className={`mb-2 p-2 rounded text-sm ${
                msg.role === 'user' ? 'ml-12' : 'mr-12'
              }`}
              style={{
                backgroundColor: msg.role === 'user' ? 'var(--accent)' : 'var(--bg-tertiary)',
                color: msg.role === 'user' ? '#fff' : 'var(--text-primary)',
              }}
            >
              {msg.content}
            </div>
          ))
        )}
        {isGenerating && (
          <div className="flex items-center gap-2 text-sm" style={{ color: 'var(--text-secondary)' }}>
            <div className="animate-spin w-4 h-4 border-2 border-t-transparent rounded-full" style={{ borderColor: 'var(--accent)', borderTopColor: 'transparent' }} />
            AI 生成中...
          </div>
        )}
      </div>

      {/* 输入区域 */}
      <div className="p-3 border-t flex gap-2" style={{ borderColor: 'var(--border-primary)' }}>
        <input
          type="text"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
          placeholder={selectedId ? '输入指令修改选中组件...' : '描述你想要的大屏...'}
          className="flex-1 px-3 py-2 rounded border text-sm"
          style={{
            backgroundColor: 'var(--bg-tertiary)',
            borderColor: 'var(--border-primary)',
            color: 'var(--text-primary)',
          }}
          disabled={isGenerating}
        />
        {isGenerating ? (
          <button
            onClick={handleCancelGeneration}
            className="px-4 py-2 rounded text-sm text-white"
            style={{ backgroundColor: 'var(--error)' }}
          >
            取消
          </button>
        ) : (
          <button
            onClick={handleSubmit}
            className="px-4 py-2 rounded text-sm text-white"
            style={{ backgroundColor: 'var(--accent)' }}
            disabled={!prompt.trim()}
          >
            发送
          </button>
        )}
      </div>
    </div>
  );
}
