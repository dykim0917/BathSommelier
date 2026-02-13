import { StyleSheet } from 'react-native';
import {
  APP_BG_BASE,
  CARD_BORDER,
  CARD_SHADOW,
  CARD_SURFACE,
  PILL_ACTIVE_BG,
  PILL_BG,
  PILL_BORDER,
  TEXT_PRIMARY,
  TYPE_BODY,
  TYPE_HEADING_MD,
  TYPE_TITLE,
} from '@/src/data/colors';

export const ui = StyleSheet.create({
  screenShell: {
    flex: 1,
    backgroundColor: APP_BG_BASE,
  },
  glassCard: {
    backgroundColor: CARD_SURFACE,
    borderWidth: 1,
    borderColor: CARD_BORDER,
    borderRadius: 18,
    shadowColor: CARD_SHADOW,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 12,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: TYPE_TITLE,
    fontWeight: '700',
    color: TEXT_PRIMARY,
  },
  titleHero: {
    fontSize: TYPE_HEADING_MD,
    fontWeight: '800',
    color: TEXT_PRIMARY,
    letterSpacing: 0.2,
  },
  bodyText: {
    fontSize: TYPE_BODY,
    color: TEXT_PRIMARY,
  },
  pillButton: {
    backgroundColor: PILL_BG,
    borderWidth: 1,
    borderColor: PILL_BORDER,
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  pillButtonActive: {
    backgroundColor: PILL_ACTIVE_BG,
    borderColor: PILL_BORDER,
  },
  tabBarStyle: {
    backgroundColor: CARD_SURFACE,
    borderTopColor: CARD_BORDER,
    borderTopWidth: 1,
    height: 74,
    paddingTop: 8,
  },
});
