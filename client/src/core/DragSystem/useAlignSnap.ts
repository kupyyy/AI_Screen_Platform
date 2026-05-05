import { useState, useCallback } from 'react';
import { useEditorStore } from '@/stores/editorStore';
import type { ComponentPosition } from '@/types';

const SNAP_THRESHOLD = 5; // 吸附阈值 (px)

interface AlignLine {
  type: 'horizontal' | 'vertical';
  position: number;
}

interface SnapResult {
  x: number;
  y: number;
  alignLines: AlignLine[];
}

export function useAlignSnap() {
  const [alignLines, setAlignLines] = useState<AlignLine[]>([]);
  const componentMap = useEditorStore((state) => state.componentMap);

  // 计算组件的边缘坐标
  const getEdges = useCallback(
    (_id: string, position: ComponentPosition) => {
      const { x, y, width, height } = position;
      return {
        left: x,
        right: x + width,
        top: y,
        bottom: y + height,
        centerX: x + width / 2,
        centerY: y + height / 2,
      };
    },
    []
  );

  // 计算吸附位置
  const calculateSnap = useCallback(
    (dragId: string, position: ComponentPosition): SnapResult => {
      const dragEdges = getEdges(dragId, position);
      const lines: AlignLine[] = [];
      let snapX = position.x;
      let snapY = position.y;

      // 遍历其他组件
      Object.entries(componentMap).forEach(([id, comp]) => {
        if (id === dragId) return;

        const targetEdges = getEdges(id, comp.position);

        // 垂直对齐检查 (左右边缘 + 中心)
        const verticalChecks = [
          { drag: dragEdges.left, target: targetEdges.left },
          { drag: dragEdges.left, target: targetEdges.right },
          { drag: dragEdges.right, target: targetEdges.left },
          { drag: dragEdges.right, target: targetEdges.right },
          { drag: dragEdges.centerX, target: targetEdges.centerX },
        ];

        verticalChecks.forEach(({ drag, target }) => {
          if (Math.abs(drag - target) < SNAP_THRESHOLD) {
            snapX = position.x + (target - drag);
            lines.push({ type: 'vertical', position: target });
          }
        });

        // 水平对齐检查 (上下边缘 + 中心)
        const horizontalChecks = [
          { drag: dragEdges.top, target: targetEdges.top },
          { drag: dragEdges.top, target: targetEdges.bottom },
          { drag: dragEdges.bottom, target: targetEdges.top },
          { drag: dragEdges.bottom, target: targetEdges.bottom },
          { drag: dragEdges.centerY, target: targetEdges.centerY },
        ];

        horizontalChecks.forEach(({ drag, target }) => {
          if (Math.abs(drag - target) < SNAP_THRESHOLD) {
            snapY = position.y + (target - drag);
            lines.push({ type: 'horizontal', position: target });
          }
        });
      });

      // 网格吸附 (10px)
      const gridSize = 10;
      const gridSnapX = Math.round(snapX / gridSize) * gridSize;
      const gridSnapY = Math.round(snapY / gridSize) * gridSize;

      // 如果网格吸附距离更近，则使用网格吸附
      if (Math.abs(gridSnapX - snapX) < SNAP_THRESHOLD) {
        snapX = gridSnapX;
      }
      if (Math.abs(gridSnapY - snapY) < SNAP_THRESHOLD) {
        snapY = gridSnapY;
      }

      return { x: snapX, y: snapY, alignLines: lines };
    },
    [componentMap, getEdges]
  );

  // 拖拽过程中调用
  const handleDrag = useCallback(
    (dragId: string, position: ComponentPosition) => {
      const result = calculateSnap(dragId, position);
      setAlignLines(result.alignLines);
      return result;
    },
    [calculateSnap]
  );

  // 拖拽结束时调用
  const handleDragEnd = useCallback(() => {
    setAlignLines([]);
  }, []);

  return {
    alignLines,
    handleDrag,
    handleDragEnd,
  };
}
