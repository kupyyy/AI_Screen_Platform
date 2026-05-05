import { useState, useEffect, useCallback, useRef } from 'react';
import type { ScaleMode } from '@/types';

interface UseScaleOptions {
  canvasWidth?: number;
  canvasHeight?: number;
  minScale?: number;
  maxScale?: number;
}

interface UseScaleReturn {
  scale: number;
  mode: ScaleMode;
  setScale: (scale: number) => void;
  setMode: (mode: ScaleMode) => void;
  zoomIn: () => void;
  zoomOut: () => void;
  fitToContainer: () => void;
  containerRef: React.RefObject<HTMLDivElement | null>;
}

export function useScale({
  canvasWidth = 1920,
  canvasHeight = 1080,
  minScale = 0.25,
  maxScale = 4,
}: UseScaleOptions = {}): UseScaleReturn {
  const [scale, setScaleState] = useState(1);
  const [mode, setMode] = useState<ScaleMode>('auto');
  const containerRef = useRef<HTMLDivElement>(null);
  const containerSizeRef = useRef({ width: 0, height: 0 });

  // 计算自适应缩放比例
  const calculateAutoScale = useCallback(
    (containerWidth: number, containerHeight: number) => {
      const scaleX = containerWidth / canvasWidth;
      const scaleY = containerHeight / canvasHeight;
      return Math.min(scaleX, scaleY, 1); // 最大不超过 100%
    },
    [canvasWidth, canvasHeight]
  );

  // 限制缩放范围
  const clampScale = useCallback(
    (value: number) => {
      return Math.max(minScale, Math.min(maxScale, value));
    },
    [minScale, maxScale]
  );

  // 设置缩放比例
  const setScale = useCallback(
    (newScale: number) => {
      const clamped = clampScale(newScale);
      setScaleState(clamped);
      setMode('manual');
    },
    [clampScale]
  );

  // 自适应到容器
  const fitToContainer = useCallback(() => {
    if (!containerRef.current) return;

    const { width, height } = containerRef.current.getBoundingClientRect();
    const autoScale = calculateAutoScale(width, height);
    setScaleState(autoScale);
    setMode('auto');
  }, [calculateAutoScale]);

  // 放大
  const zoomIn = useCallback(() => {
    setScale(scale + 0.1);
  }, [scale, setScale]);

  // 缩小
  const zoomOut = useCallback(() => {
    setScale(scale - 0.1);
  }, [scale, setScale]);

  // 监听容器大小变化
  useEffect(() => {
    if (!containerRef.current) return;

    const observer = new ResizeObserver((entries) => {
      const { width, height } = entries[0].contentRect;
      containerSizeRef.current = { width, height };

      if (mode === 'auto') {
        const autoScale = calculateAutoScale(width, height);
        setScaleState(autoScale);
      }
    });

    observer.observe(containerRef.current);

    return () => {
      observer.disconnect();
    };
  }, [mode, calculateAutoScale]);

  // Ctrl + 滚轮缩放
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleWheel = (e: WheelEvent) => {
      if (e.ctrlKey) {
        e.preventDefault();
        const delta = e.deltaY > 0 ? -0.1 : 0.1;
        setScale(scale + delta);
      }
    };

    container.addEventListener('wheel', handleWheel, { passive: false });

    return () => {
      container.removeEventListener('wheel', handleWheel);
    };
  }, [scale, setScale]);

  return {
    scale,
    mode,
    setScale,
    setMode,
    zoomIn,
    zoomOut,
    fitToContainer,
    containerRef,
  };
}
