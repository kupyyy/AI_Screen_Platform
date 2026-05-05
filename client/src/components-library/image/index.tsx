interface ImageProps {
  src?: string;
  fit?: 'contain' | 'cover' | 'fill' | 'none';
  borderRadius?: number;
  opacity?: number;
}

export default function Image({
  src = '',
  fit = 'contain',
  borderRadius = 0,
  opacity = 1,
}: ImageProps) {
  if (!src) {
    return (
      <div
        className="w-full h-full flex items-center justify-center"
        style={{
          backgroundColor: 'var(--bg-tertiary)',
          borderRadius: `${borderRadius}px`,
        }}
      >
        <span style={{ color: 'var(--text-tertiary)', fontSize: '14px' }}>
          请选择图片
        </span>
      </div>
    );
  }

  return (
    <div
      className="w-full h-full overflow-hidden"
      style={{ borderRadius: `${borderRadius}px` }}
    >
      <img
        src={src}
        alt=""
        className="w-full h-full"
        style={{
          objectFit: fit,
          opacity,
        }}
      />
    </div>
  );
}
