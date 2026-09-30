export function toSRTTime(seconds) {
  const totalMs = Math.max(0, Math.floor(seconds * 1000));
  const ms = totalMs % 1000;
  const totalSec = Math.floor(totalMs / 1000);
  const h = String(Math.floor(totalSec / 3600)).padStart(2, '0');
  const m = String(Math.floor((totalSec % 3600) / 60)).padStart(2, '0');
  const s = String(totalSec % 60).padStart(2, '0');
  return `${h}:${m}:${s},${String(ms).padStart(3, '0')}`;
}

export function segmentsToSRT(segments) {
  return segments
    .map((seg, i) => {
      const text = seg.text.trim();
      return `${i + 1}\n${toSRTTime(seg.start)} --> ${toSRTTime(seg.end)}\n${text}\n`;
    })
    .join('\n');
}