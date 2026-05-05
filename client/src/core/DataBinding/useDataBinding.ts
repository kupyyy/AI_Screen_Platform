import { useState, useEffect, useRef, useCallback } from 'react';
import type { DataBinding } from '@/types';

interface UseDataBindingOptions {
  binding?: DataBinding;
  initialData?: any;
}

export function useDataBinding({ binding, initialData }: UseDataBindingOptions) {
  const [data, setData] = useState<any>(initialData);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const wsRef = useRef<WebSocket | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  // 静态数据
  useEffect(() => {
    if (!binding || binding.type === 'static') {
      setData(binding?.config?.data || initialData);
      return;
    }
  }, [binding, initialData]);

  // API 数据源
  const fetchApiData = useCallback(async () => {
    if (!binding || binding.type !== 'api') return;

    const { url, method = 'GET', headers = {} } = binding.config;

    setLoading(true);
    setError(null);

    try {
      abortControllerRef.current = new AbortController();

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          ...headers,
        },
        signal: abortControllerRef.current.signal,
      });

      if (!response.ok) {
        throw new Error(`HTTP error: ${response.status}`);
      }

      const result = await response.json();
      setData(result);
    } catch (err: any) {
      if (err.name !== 'AbortError') {
        setError(err.message);
      }
    } finally {
      setLoading(false);
    }
  }, [binding]);

  // API 轮询
  useEffect(() => {
    if (!binding || binding.type !== 'api') return;

    fetchApiData();

    const interval = binding.config.interval;
    if (interval && interval > 0) {
      const timer = setInterval(fetchApiData, interval);
      return () => clearInterval(timer);
    }

    return () => {
      abortControllerRef.current?.abort();
    };
  }, [binding, fetchApiData]);

  // WebSocket 实时数据
  useEffect(() => {
    if (!binding || binding.type !== 'websocket') return;

    const { url, reconnectInterval = 5000 } = binding.config;

    const connect = () => {
      const ws = new WebSocket(url);
      wsRef.current = ws;

      ws.onopen = () => {
        console.log('WebSocket connected');
        setError(null);
      };

      ws.onmessage = (event) => {
        try {
          const result = JSON.parse(event.data);
          setData(result);
        } catch {
          setData(event.data);
        }
      };

      ws.onerror = (event) => {
        console.error('WebSocket error:', event);
        setError('WebSocket 连接错误');
      };

      ws.onclose = () => {
        console.log('WebSocket disconnected');
        // 自动重连
        if (reconnectInterval > 0) {
          setTimeout(connect, reconnectInterval);
        }
      };
    };

    connect();

    return () => {
      wsRef.current?.close();
      wsRef.current = null;
    };
  }, [binding]);

  return { data, loading, error };
}
