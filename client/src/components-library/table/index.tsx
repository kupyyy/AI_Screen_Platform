interface Column {
  key: string;
  title: string;
  width?: number;
}

interface TableProps {
  columns?: Column[];
  data?: Array<Record<string, any>>;
  headerBgColor?: string;
  headerTextColor?: string;
  bodyBgColor?: string;
  bodyTextColor?: string;
  borderColor?: string;
  showBorder?: boolean;
  striped?: boolean;
}

export default function Table({
  columns = [],
  data = [],
  headerBgColor = '#1f1f1f',
  headerTextColor = '#ffffff',
  bodyBgColor = 'transparent',
  bodyTextColor = '#a6a6a6',
  borderColor = '#303030',
  showBorder = true,
  striped = true,
}: TableProps) {
  return (
    <div className="w-full h-full overflow-auto">
      <table
        className="w-full"
        style={{
          borderCollapse: showBorder ? 'collapse' : 'separate',
          borderSpacing: showBorder ? 0 : '4px',
        }}
      >
        <thead>
          <tr>
            {columns.map((col) => (
              <th
                key={col.key}
                className="px-3 py-2 text-left text-sm font-medium"
                style={{
                  backgroundColor: headerBgColor,
                  color: headerTextColor,
                  width: col.width ? `${col.width}px` : undefined,
                  border: showBorder ? `1px solid ${borderColor}` : undefined,
                }}
              >
                {col.title}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row, rowIndex) => (
            <tr
              key={rowIndex}
              style={{
                backgroundColor:
                  striped && rowIndex % 2 === 1
                    ? 'rgba(255, 255, 255, 0.03)'
                    : bodyBgColor,
              }}
            >
              {columns.map((col) => (
                <td
                  key={col.key}
                  className="px-3 py-2 text-sm"
                  style={{
                    color: bodyTextColor,
                    border: showBorder ? `1px solid ${borderColor}` : undefined,
                  }}
                >
                  {row[col.key]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
