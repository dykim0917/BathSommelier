export function formatTimer(totalSeconds: number): string {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}

export function formatDuration(minutes: number | null): string {
  if (minutes === null) return '시간 제한 없음';
  return `${minutes}분`;
}
