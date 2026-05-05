import { useDraggable } from '@dnd-kit/core';

interface DraggableComponentProps {
  type: string;
  name: string;
  children: React.ReactNode;
}

export default function DraggableComponent({
  type,
  name,
  children,
}: DraggableComponentProps) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: `new-${type}`,
    data: {
      type: 'new',
      componentType: type,
    },
  });

  return (
    <div
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      className={`cursor-grab ${isDragging ? 'opacity-50' : ''}`}
      title={`拖拽添加 ${name}`}
    >
      {children}
    </div>
  );
}
