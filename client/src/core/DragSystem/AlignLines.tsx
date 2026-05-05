interface AlignLine {
  type: 'horizontal' | 'vertical';
  position: number;
}

interface AlignLinesProps {
  lines: AlignLine[];
}

export default function AlignLines({ lines }: AlignLinesProps) {
  if (lines.length === 0) return null;

  return (
    <div className="absolute inset-0 pointer-events-none" style={{ zIndex: 9999 }}>
      {lines.map((line, index) => {
        if (line.type === 'horizontal') {
          return (
            <div
              key={`h-${index}`}
              className="absolute left-0 right-0"
              style={{
                top: `${line.position}px`,
                height: '1px',
                backgroundColor: '#1890ff',
                boxShadow: '0 0 2px #1890ff',
              }}
            />
          );
        }

        return (
          <div
            key={`v-${index}`}
            className="absolute top-0 bottom-0"
            style={{
              left: `${line.position}px`,
              width: '1px',
              backgroundColor: '#1890ff',
              boxShadow: '0 0 2px #1890ff',
            }}
          />
        );
      })}
    </div>
  );
}
