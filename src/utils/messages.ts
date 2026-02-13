/**
 * Returns a motivational message based on current time of day.
 */
export function getTimeBasedMessage(): string {
  const hour = new Date().getHours();

  if (hour >= 5 && hour < 9) return '상쾌한 아침이에요!\n좋은 하루 보내세요 ☀️';
  if (hour >= 9 && hour < 12) return '활기찬 오전을 시작하세요! 💪';
  if (hour >= 12 && hour < 17) return '오후도 힘내세요!\n나를 위한 시간을 보냈어요 🌿';
  if (hour >= 17 && hour < 21)
    return '하루 수고했어요,\n편안한 저녁 되세요 🌙';
  return '꿀잠 주무세요 💤';
}
