import { useState, useCallback } from 'react';
import {
  DndContext,
  DragOverlay,
  useSensor,
  useSensors,
  PointerSensor,
  type DragStartEvent,
  type DragEndEvent,
} from '@dnd-kit/core';
import { useEditorStore } from '@/stores/editorStore';
import { componentRegistry } from '@/components-library';
import { v4 as uuidv4 } from 'uuid';
import type { DSLComponent } from '@/types';

interface DndProviderProps {
  children: React.ReactNode;
}

export default function DndProvider({ children }: DndProviderProps) {
  const [activeId, setActiveId] = useState<string | null>(null);
  const [activeType, setActiveType] = useState<'component' | 'new'>('component');
  const addComponent = useEditorStore((state) => state.addComponent);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  const handleDragStart = useCallback((event: DragStartEvent) => {
    const { active } = event;
    setActiveId(active.id as string);
    setActiveType(active.data.current?.type || 'component');
  }, []);

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      const { active, over } = event;
      setActiveId(null);

      if (!over) return;

      // 从组件面板拖到画布
      if (active.data.current?.type === 'new' && over.id === 'canvas') {
        const componentType = active.data.current.componentType as string;
        const meta = componentRegistry.getMeta(componentType);

        if (meta) {
          const newComp: DSLComponent = {
            id: uuidv4(),
            type: componentType,
            name: meta.name,
            parentId: null,
            childIds: [],
            position: {
              x: 100,
              y: 100,
              width: meta.defaultSize.width,
              height: meta.defaultSize.height,
              zIndex: Date.now(),
            },
            props: { ...meta.defaultProps },
          };
          addComponent(newComp);
        }
      }
    },
    [addComponent]
  );

  return (
    <DndContext
      sensors={sensors}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      {children}
      <DragOverlay>
        {activeId && activeType === 'new' ? (
          <div
            className="px-4 py-2 rounded shadow-lg"
            style={{
              backgroundColor: 'var(--accent)',
              color: '#fff',
              opacity: 0.8,
            }}
          >
            拖放到画布
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}
