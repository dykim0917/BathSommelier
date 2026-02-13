import { TemperatureRange } from '@/src/engine/types';

export function formatTemperature(range: TemperatureRange): string {
  if (range.min === range.max) {
    return `${range.recommended}°C`;
  }
  return `${range.recommended}°C`;
}

export function formatTemperatureRange(range: TemperatureRange): string {
  if (range.min === range.max) {
    return `${range.min}°C`;
  }
  return `${range.min}~${range.max}°C`;
}
