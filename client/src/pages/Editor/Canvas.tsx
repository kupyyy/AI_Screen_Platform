import { useDroppable } from '@dnd-kit/core';
import { useEditorStore } from '@/stores/editorStore';
import { componentRegistry } from '@/components-library';
import { useScale } from '@/hooks/useScale';
import { useAlignSnap } from '@/core/DragSystem/useAlignSnap';
import AlignLines from '@/core/DragSystem/AlignLines';
import { Rnd } from 'react-rnd';

export default function Canvas() {
  const {
    componentMap,
    rootComponentIds,
    selectedId,
    selectComponent,
    moveComponent,
    showGrid,
    gridSize,
    mode,
  } = useEditorStore();

  const { scale, containerRef } = useScale({
    canvasWidth: 1920,
    canvasHeight: 1080,
  });

  const { alignLines, handleDrag, handleDragEnd } = useAlignSnap();

  const { setNodeRef, isOver } = useDroppable({
    id: 'canvas',
  });

  // 渲染单个组件
  const renderComponent = (compId: string) => {
    const comp = componentMap[compId];
    if (!comp) return null;

    const isSelected = selectedId === compId;
    const ComponentImpl = componentRegistry.getComponent(comp.type);

    if (!ComponentImpl) {
      return (
        <Rnd
          key={compId}
          size={{ width: comp.position.width, height: comp.position.height }}
          position={{ x: comp.position.x, y: comp.position.y }}
          scale={scale}
          onDrag={(_e, d) => {
            handleDrag(compId, { ...comp.position, x: d.x, y: d.y });
          }}
          onDragStop={(_e, d) => {
            const snapResult = handleDrag(compId, { ...comp.position, x: d.x, y: d.y });
            moveComponent(compId, { x: snapResult.x, y: snapResult.y });
            handleDragEnd();
          }}
          onResizeStop={(_e, _direction, ref, _delta, position) => {
            moveComponent(compId, {
              width: parseInt(ref.style.width),
              height: parseInt(ref.style.height),
              x: position.x,
              y: position.y,
            });
          }}
          onClick={(e: React.MouseEvent) => {
            e.stopPropagation();
            selectComponent(compId);
          }}
          bounds="parent"
          minWidth={50}
          minHeight={30}
          disableDragging={mode === 'preview'}
          enableResizing={mode === 'edit'}
        >
          <div
            className={`w-full h-full flex items-center justify-center ${isSelected ? 'component-selected' : ''}`}
            style={{
              backgroundColor: 'var(--bg-tertiary)',
              border: '1px solid var(--border-primary)',
            }}
          >
            <span className="text-sm" style={{ color: 'var(--text-tertiary)' }}>
              未知组件: {comp.type}
            </span>
          </div>
        </Rnd>
      );
    }

    return (
      <Rnd
        key={compId}
        size={{ width: comp.position.width, height: comp.position.height }}
        position={{ x: comp.position.x, y: comp.position.y }}
        scale={scale}
        onDrag={(_e, d) => {
          handleDrag(compId, { ...comp.position, x: d.x, y: d.y });
        }}
        onDragStop={(_e, d) => {
          const snapResult = handleDrag(compId, { ...comp.position, x: d.x, y: d.y });
          moveComponent(compId, { x: snapResult.x, y: snapResult.y });
          handleDragEnd();
        }}
        onResizeStop={(_e, _direction, ref, _delta, position) => {
          moveComponent(compId, {
            width: parseInt(ref.style.width),
            height: parseInt(ref.style.height),
            x: position.x,
            y: position.y,
          });
        }}
        onClick={(e: React.MouseEvent) => {
          e.stopPropagation();
          selectComponent(compId);
        }}
        bounds="parent"
        minWidth={50}
        minHeight={30}
        disableDragging={mode === 'preview'}
        enableResizing={mode === 'edit'}
      >
        <div
          className={`w-full h-full overflow-hidden ${isSelected ? 'component-selected' : ''}`}
          style={{
            border: '1px solid var(--border-primary)',
          }}
        >
          <ComponentImpl {...comp.props} />

          {/* 渲染子组件 */}
          {comp.childIds.map((childId) => renderComponent(childId))}
        </div>
      </Rnd>
    );
  };

  return (
    <div
      ref={containerRef}
      className="w-full h-full overflow-auto"
      style={{ backgroundColor: 'var(--bg-primary)' }}
      onClick={() => selectComponent(null)}
    >
      {/* 缩放容器 */}
      <div
        ref={setNodeRef}
        className="relative"
        style={{
          width: 1920,
          height: 1080,
          transform: `scale(${scale})`,
          transformOrigin: 'top left',
          margin: '20px auto',
          backgroundColor: '#0a0a1a',
          outline: isOver ? '2px solid var(--accent)' : 'none',
        }}
      >
        {/* 网格背景 */}
        {showGrid && (
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              backgroundImage: `radial-gradient(circle, var(--border-primary) 1px, transparent 1px)`,
              backgroundSize: `${gridSize}px ${gridSize}px`,
              opacity: 0.3,
            }}
          />
        )}

        {/* 对齐基准线 */}
        <AlignLines lines={alignLines} />

        {/* 根层级组件 */}
        {rootComponentIds.map((id) => renderComponent(id))}
      </div>
    </div>
  );
}
