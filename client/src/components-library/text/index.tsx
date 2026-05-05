interface TextProps {
  content?: string;
  fontSize?: number;
  fontWeight?: 'normal' | 'bold' | 'lighter';
  color?: string;
  textAlign?: 'left' | 'center' | 'right';
  lineHeight?: number;
}

export default function Text({
  content = '请输入文本',
  fontSize = 16,
  fontWeight = 'normal',
  color = '#ffffff',
  textAlign = 'left',
  lineHeight = 1.5,
}: TextProps) {
  return (
    <div
      className="w-full h-full flex items-center"
      style={{
        fontSize: `${fontSize}px`,
        fontWeight,
        color,
        textAlign,
        lineHeight,
        justifyContent: textAlign === 'center' ? 'center' : textAlign === 'right' ? 'flex-end' : 'flex-start',
      }}
    >
      {content}
    </div>
  );
}
