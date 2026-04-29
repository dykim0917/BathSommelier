import React, { useMemo } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  buildAdminContentSectionSummaries,
  countPublishBlockers,
  type AdminContentSectionId,
  type AdminContentSectionSummary,
} from '@/src/admin/contentDashboard';
import {
  TYPE_SCALE,
  V2_ACCENT,
  V2_ACCENT_SOFT,
  V2_BG_BASE,
  V2_BG_BOTTOM,
  V2_BG_TOP,
  V2_BORDER,
  V2_DANGER,
  V2_SURFACE,
  V2_SURFACE_ELEVATED,
  V2_TEXT_MUTED,
  V2_TEXT_PRIMARY,
  V2_TEXT_SECONDARY,
  V2_WARNING,
} from '@/src/data/colors';
import { luxuryFonts } from '@/src/theme/luxury';
import { ui } from '@/src/theme/ui';

const SCREEN_HORIZONTAL_PADDING = 22;

const SECTION_ICONS: Record<AdminContentSectionId, keyof typeof FontAwesome.glyphMap> = {
  products: 'shopping-bag',
  care: 'heart',
  trip: 'map',
  audio: 'music',
};

function SectionCard({ section }: { section: AdminContentSectionSummary }) {
  const hasBlockers = section.publishBlockers.length > 0;

  return (
    <View style={[ui.glassCardV2, styles.sectionCard]}>
      <View style={styles.sectionHeader}>
        <View style={styles.iconBadge}>
          <FontAwesome name={SECTION_ICONS[section.id]} size={16} color={V2_ACCENT} />
        </View>
        <View style={styles.sectionTitleBlock}>
          <Text style={styles.sectionTitle}>{section.title}</Text>
          <Text style={styles.sectionSubtitle}>{section.subtitle}</Text>
        </View>
        <View style={[styles.statusPill, hasBlockers && styles.statusPillDanger]}>
          <Text style={[styles.statusText, hasBlockers && styles.statusTextDanger]}>
            {hasBlockers ? '확인 필요' : '정상'}
          </Text>
        </View>
      </View>

      <View style={styles.metricRow}>
        <View style={styles.metricBox}>
          <Text style={styles.metricValue}>{section.totalCount}</Text>
          <Text style={styles.metricLabel}>전체</Text>
        </View>
        <View style={styles.metricBox}>
          <Text style={styles.metricValue}>{section.activeCount}</Text>
          <Text style={styles.metricLabel}>Active</Text>
        </View>
        <View style={styles.metricBox}>
          <Text style={styles.metricValue}>{section.draftCount}</Text>
          <Text style={styles.metricLabel}>Draft</Text>
        </View>
        <View style={styles.metricBox}>
          <Text style={styles.metricValue}>{section.pausedCount}</Text>
          <Text style={styles.metricLabel}>Paused</Text>
        </View>
      </View>

      {hasBlockers ? (
        <View style={styles.blockerBox}>
          <Text style={styles.blockerText} numberOfLines={2}>
            {section.publishBlockers[0]}
          </Text>
        </View>
      ) : null}
    </View>
  );
}

export default function AdminContentDashboardScreen() {
  const insets = useSafeAreaInsets();
  const sections = useMemo(() => buildAdminContentSectionSummaries(), []);
  const blockerCount = countPublishBlockers(sections);
  const totalRows = sections.reduce((total, section) => total + section.totalCount, 0);
  const activeRows = sections.reduce((total, section) => total + section.activeCount, 0);

  return (
    <View style={[ui.screenShellV2, { paddingTop: insets.top }]}>
      <LinearGradient
        colors={[V2_BG_TOP, V2_BG_BASE, V2_BG_BOTTOM]}
        style={StyleSheet.absoluteFillObject}
      />
      <ScrollView
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 36 }]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Text style={styles.eyebrow}>ADMIN</Text>
          <Text style={styles.title}>콘텐츠 관리</Text>
          <Text style={styles.subtitle}>
            제품, 케어 루틴, 무드 루틴, 음악 데이터를 발행 단위로 점검합니다.
          </Text>
        </View>

        <View style={[ui.glassCardV2, styles.summaryPanel]}>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryValue}>{totalRows}</Text>
            <Text style={styles.summaryLabel}>관리 항목</Text>
          </View>
          <View style={styles.summaryDivider} />
          <View style={styles.summaryItem}>
            <Text style={styles.summaryValue}>{activeRows}</Text>
            <Text style={styles.summaryLabel}>Active</Text>
          </View>
          <View style={styles.summaryDivider} />
          <View style={styles.summaryItem}>
            <Text style={[styles.summaryValue, blockerCount > 0 && styles.warningValue]}>
              {blockerCount}
            </Text>
            <Text style={styles.summaryLabel}>Blocker</Text>
          </View>
        </View>

        <View style={styles.sectionList}>
          {sections.map((section) => (
            <SectionCard key={section.id} section={section} />
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingHorizontal: SCREEN_HORIZONTAL_PADDING,
    paddingTop: 18,
    gap: 16,
  },
  header: {
    gap: 8,
  },
  eyebrow: {
    color: V2_ACCENT,
    fontFamily: luxuryFonts.sans,
    fontSize: TYPE_SCALE.caption,
    fontWeight: '800',
    letterSpacing: 0,
  },
  title: {
    color: V2_TEXT_PRIMARY,
    fontFamily: luxuryFonts.display,
    fontSize: 28,
    fontWeight: '800',
    letterSpacing: 0,
  },
  subtitle: {
    color: V2_TEXT_SECONDARY,
    fontFamily: luxuryFonts.sans,
    fontSize: TYPE_SCALE.body,
    lineHeight: 21,
  },
  summaryPanel: {
    flexDirection: 'row',
    alignItems: 'stretch',
    padding: 16,
    borderRadius: 8,
  },
  summaryItem: {
    flex: 1,
    gap: 4,
  },
  summaryValue: {
    color: V2_TEXT_PRIMARY,
    fontFamily: luxuryFonts.display,
    fontSize: 24,
    fontWeight: '800',
  },
  warningValue: {
    color: V2_WARNING,
  },
  summaryLabel: {
    color: V2_TEXT_MUTED,
    fontFamily: luxuryFonts.sans,
    fontSize: TYPE_SCALE.caption,
    fontWeight: '700',
  },
  summaryDivider: {
    width: 1,
    backgroundColor: V2_BORDER,
    marginHorizontal: 12,
  },
  sectionList: {
    gap: 12,
  },
  sectionCard: {
    padding: 14,
    borderRadius: 8,
    gap: 14,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  iconBadge: {
    width: 34,
    height: 34,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: V2_ACCENT_SOFT,
    borderWidth: 1,
    borderColor: V2_BORDER,
  },
  sectionTitleBlock: {
    flex: 1,
    gap: 2,
  },
  sectionTitle: {
    color: V2_TEXT_PRIMARY,
    fontFamily: luxuryFonts.display,
    fontSize: TYPE_SCALE.title,
    fontWeight: '800',
  },
  sectionSubtitle: {
    color: V2_TEXT_MUTED,
    fontFamily: luxuryFonts.sans,
    fontSize: TYPE_SCALE.caption,
  },
  statusPill: {
    minHeight: 30,
    justifyContent: 'center',
    paddingHorizontal: 10,
    borderRadius: 999,
    backgroundColor: V2_ACCENT_SOFT,
    borderWidth: 1,
    borderColor: V2_BORDER,
  },
  statusPillDanger: {
    backgroundColor: 'rgba(194, 134, 118, 0.16)',
  },
  statusText: {
    color: V2_ACCENT,
    fontFamily: luxuryFonts.sans,
    fontSize: TYPE_SCALE.caption,
    fontWeight: '800',
  },
  statusTextDanger: {
    color: V2_DANGER,
  },
  metricRow: {
    flexDirection: 'row',
    gap: 8,
  },
  metricBox: {
    flex: 1,
    minHeight: 58,
    justifyContent: 'center',
    paddingHorizontal: 10,
    borderRadius: 8,
    backgroundColor: V2_SURFACE_ELEVATED,
    borderWidth: 1,
    borderColor: V2_BORDER,
  },
  metricValue: {
    color: V2_TEXT_PRIMARY,
    fontFamily: luxuryFonts.display,
    fontSize: TYPE_SCALE.title,
    fontWeight: '800',
  },
  metricLabel: {
    color: V2_TEXT_MUTED,
    fontFamily: luxuryFonts.sans,
    fontSize: 11,
    fontWeight: '700',
  },
  blockerBox: {
    padding: 10,
    borderRadius: 8,
    backgroundColor: V2_SURFACE,
    borderWidth: 1,
    borderColor: 'rgba(194, 134, 118, 0.38)',
  },
  blockerText: {
    color: V2_TEXT_SECONDARY,
    fontFamily: luxuryFonts.sans,
    fontSize: TYPE_SCALE.caption,
    lineHeight: 17,
  },
});
