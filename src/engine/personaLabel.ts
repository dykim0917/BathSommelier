import { PERSONA_DEFINITIONS } from './personas';
import { PersonaCode } from './types';

export function toPersonaLabel(code: PersonaCode | string): string {
  const persona = PERSONA_DEFINITIONS.find((item) => item.code === code);
  return persona?.nameKo ?? '맞춤 케어';
}
