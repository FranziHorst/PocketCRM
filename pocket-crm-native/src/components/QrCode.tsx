import React, { useMemo } from 'react';
import Svg, { Path, Rect } from 'react-native-svg';
import qrcode from 'qrcode-generator';
import { c } from '../theme';

const MARGIN = 2; // Ruhezone, ohne die viele Scanner den Code nicht erkennen

// Fehlerkorrektur 'L': Der Code wird nur vom Bildschirm abgescannt, kann also
// nicht verschmutzen. Weniger Korrekturdaten = weniger Module = besser lesbar.
export function QrCode({ value, size = 240 }: { value: string; size?: number }) {
  const { path, total } = useMemo(() => {
    const qr = qrcode(0, 'L');
    qr.addData(value);
    qr.make();
    const count = qr.getModuleCount();
    let path = '';
    for (let row = 0; row < count; row += 1) {
      for (let col = 0; col < count; col += 1) {
        if (qr.isDark(row, col)) path += `M${col + MARGIN} ${row + MARGIN}h1v1h-1z`;
      }
    }
    return { path, total: count + MARGIN * 2 };
  }, [value]);

  return (
    <Svg width={size} height={size} viewBox={`0 0 ${total} ${total}`}>
      <Rect x={0} y={0} width={total} height={total} fill={c.surface} />
      <Path d={path} fill={c.text} />
    </Svg>
  );
}
