import type { GridStyle } from '../types/copybook';

interface GridGuidesProps {
  size: number;
  style: GridStyle;
  strokeWidth?: number;
}

export function GridGuides({ size, style, strokeWidth = 1.2 }: GridGuidesProps) {
  const half = size / 2;
  const quarter = size / 4;
  const threeQuarter = (size * 3) / 4;
  const red = '#d94235';
  const dash = `${size * 0.045} ${size * 0.035}`;

  return (
    <g>
      <rect
        x={0}
        y={0}
        width={size}
        height={size}
        fill="white"
        stroke={red}
        strokeWidth={strokeWidth}
      />
      {style !== 'blank' && (
        <>
          {(style === 'tian' || style === 'mi' || style === 'cross' || style === 'hui') && (
            <>
              <line x1={half} y1={0} x2={half} y2={size} stroke={red} strokeWidth={strokeWidth * 0.8} strokeDasharray={dash} />
              <line x1={0} y1={half} x2={size} y2={half} stroke={red} strokeWidth={strokeWidth * 0.8} strokeDasharray={dash} />
            </>
          )}
          {style === 'mi' && (
            <>
              <line x1={0} y1={0} x2={size} y2={size} stroke={red} strokeWidth={strokeWidth * 0.8} strokeDasharray={dash} />
              <line x1={size} y1={0} x2={0} y2={size} stroke={red} strokeWidth={strokeWidth * 0.8} strokeDasharray={dash} />
            </>
          )}
          {style === 'hui' && (
            <rect
              x={quarter}
              y={quarter}
              width={half}
              height={half}
              fill="none"
              stroke={red}
              strokeWidth={strokeWidth * 0.8}
              strokeDasharray={dash}
            />
          )}
          {style === 'cross' && (
            <circle cx={half} cy={half} r={size * 0.018} fill={red} opacity={0.5} />
          )}
          {style === 'tian' && (
            <>
              <line x1={quarter} y1={0} x2={quarter} y2={size} stroke={red} strokeWidth={strokeWidth * 0.35} strokeDasharray={dash} opacity={0.35} />
              <line x1={threeQuarter} y1={0} x2={threeQuarter} y2={size} stroke={red} strokeWidth={strokeWidth * 0.35} strokeDasharray={dash} opacity={0.35} />
            </>
          )}
        </>
      )}
    </g>
  );
}
