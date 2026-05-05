import { useState, useCallback, useRef } from 'react';
import { useAuthStore } from '@/stores/authStore';

interface SSEEvent {
  type: string;
  data: any;
}

interface UseSSEOptions {
  onEvent?: (event: SSEEvent) => void;
  onDone?: () => void;
  onError?: (error: string) => void;
  onCancel?: () => void;
}

interface UseSSEReturn {
  isGenerating: boolean;
  events: SSEEvent[];
  startGeneration: (url: string, body: any) => void;
  cancelGeneration: () => void;
  clearEvents: () => void;
}

export function useSSE({
  onEvent,
  onDone,
  onError,
  onCancel,
}: UseSSEOptions = {}): UseSSEReturn {
  const [isGenerating, setIsGenerating] = useState(false);
  const [events, setEvents] = useState<SSEEvent[]>([]);
  const abortControllerRef = useRef<AbortController | null>(null);
  const requestIdRef = useRef<string>('');
  const accessToken = useAuthStore((state) => state.accessToken);

  const clearEvents = useCallback(() => {
    setEvents([]);
  }, []);

  const cancelGeneration = useCallback(async () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }

    // 通知后端取消
    if (requestIdRef.current) {
      try {
        await fetch(`/api/ai/cancel/${requestIdRef.current}`, {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        });
      } catch {
        // 忽略取消请求的错误
      }
    }

    setIsGenerating(false);
    onCancel?.();
  }, [accessToken, onCancel]);

  const startGeneration = useCallback(
    async (url: string, body: any) => {
      // 如果正在生成，先取消
      if (isGenerating) {
        await cancelGeneration();
      }

      setIsGenerating(true);
      setEvents([]);

      const requestId = Date.now().toString();
      requestIdRef.current = requestId;

      const abortController = new AbortController();
      abortControllerRef.current = abortController;

      try {
        const response = await fetch(url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${accessToken}`,
            'X-Request-Id': requestId,
          },
          body: JSON.stringify(body),
          signal: abortController.signal,
        });

        if (!response.ok) {
          throw new Error(`HTTP error: ${response.status}`);
        }

        const reader = response.body?.getReader();
        if (!reader) {
          throw new Error('无法读取响应流');
        }

        const decoder = new TextDecoder();
        let buffer = '';

        while (true) {
          const { done, value } = await reader.read();

          if (done) {
            break;
          }

          buffer += decoder.decode(value, { stream: true });

          // 解析 SSE 事件
          const lines = buffer.split('\n');
          buffer = lines.pop() || '';

          let eventType = '';
          let eventData = '';

          for (const line of lines) {
            if (line.startsWith('event: ')) {
              eventType = line.substring(7);
            } else if (line.startsWith('data: ')) {
              eventData = line.substring(6);

              if (eventType && eventData) {
                try {
                  const parsedData = JSON.parse(eventData);
                  const event: SSEEvent = {
                    type: eventType,
                    data: parsedData,
                  };

                  setEvents((prev) => [...prev, event]);
                  onEvent?.(event);

                  // 检查是否完成
                  if (eventType === 'done') {
                    onDone?.();
                  }

                  if (eventType === 'error') {
                    onError?.(parsedData.message);
                  }
                } catch {
                  // 忽略解析错误
                }

                eventType = '';
                eventData = '';
              }
            }
          }
        }
      } catch (error: any) {
        if (error.name !== 'AbortError') {
          onError?.(error.message);
        }
      } finally {
        setIsGenerating(false);
        abortControllerRef.current = null;
        requestIdRef.current = '';
      }
    },
    [isGenerating, accessToken, cancelGeneration, onEvent, onDone, onError]
  );

  return {
    isGenerating,
    events,
    startGeneration,
    cancelGeneration,
    clearEvents,
  };
}
