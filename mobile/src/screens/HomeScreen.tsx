import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  StatusBar,
  Image,
} from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../App';
import { useSyncBank } from '../hooks/useSyncBank';
import { QuestionRepository, CategoryCounts } from '../repositories/QuestionRepository';
import type { QuestionCategory } from '../types';

// ---- Country definition ----
interface CountryOption {
  code: string;
  name: string;
  flag: string;
  badge: string;
}

const COUNTRIES: CountryOption[] = [
  { code: 'GLOBAL', name: 'Global', flag: '🌐', badge: 'Vienna' },
  { code: 'PK', name: 'Pakistan', flag: '🇵🇰', badge: 'NHMP' },
  { code: 'SA', name: 'Saudi Arabia', flag: '🇸🇦', badge: 'Moroor' },
  { code: 'AE', name: 'UAE', flag: '🇦🇪', badge: 'RTA' },
  { code: 'US', name: 'USA', flag: '🇺🇸', badge: 'MUTCD' },
  { code: 'GB', name: 'UK', flag: '🇬🇧', badge: 'DfT' },
  { code: 'CA', name: 'Canada', flag: '🇨🇦', badge: 'TAC' },
  { code: 'AU', name: 'Australia', flag: '🇦🇺', badge: 'Austroads' },
];

// ---- Category card data ----
interface CategoryCard {
  label: string;
  category: QuestionCategory | 'ALL';
  tag: string;
  emoji: string;
  color: string;
  countKey: keyof CategoryCounts;
}

const CATEGORIES: CategoryCard[] = [
  {
    label: 'Warning Signs',
    category: 'WARNING_SIGNS',
    tag: 'WARNING',
    emoji: '⚠️',
    color: '#F59E0B',
    countKey: 'warning',
  },
  {
    label: 'Regulatory Signs',
    category: 'TRAFFIC_REGULATORY',
    tag: 'REGULATORY',
    emoji: '🛑',
    color: '#EF4444',
    countKey: 'regulatory',
  },
  {
    label: 'Traffic Signals',
    category: 'TRAFFIC_SIGNALS',
    tag: 'SIGNALS',
    emoji: '🚦',
    color: '#10B981',
    countKey: 'signals',
  },
  {
    label: 'General Knowledge',
    category: 'GENERAL_KNOWLEDGE',
    tag: 'KNOWLEDGE',
    emoji: '📋',
    color: '#6366F1',
    countKey: 'general',
  },
];

export default function HomeScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { isSyncing, lastSynced } = useSyncBank();

  const [selectedCountry, setSelectedCountry] = useState<string>(() =>
    QuestionRepository.getSelectedCountry(),
  );

  const [counts, setCounts] = useState<CategoryCounts>(() =>
    QuestionRepository.getCategoryCounts(selectedCountry),
  );

  const refreshCounts = useCallback(() => {
    const active = QuestionRepository.getSelectedCountry();
    setSelectedCountry(active);
    setCounts(QuestionRepository.getCategoryCounts(active));
  }, []);

  // Update counts whenever screen gains focus or sync finishes
  useFocusEffect(
    useCallback(() => {
      refreshCounts();
    }, [refreshCounts]),
  );

  useEffect(() => {
    refreshCounts();
  }, [isSyncing, refreshCounts]);

  const handleCountrySelect = (code: string) => {
    QuestionRepository.setSelectedCountry(code);
    setSelectedCountry(code);
    setCounts(QuestionRepository.getCategoryCounts(code));
  };

  const handleCategoryPress = (category: QuestionCategory | 'ALL') => {
    const categoryParam = category === 'ALL' ? undefined : category;
    try {
      if (navigation && typeof navigation.navigate === 'function') {
        navigation.navigate('Quiz', {
          category: categoryParam,
          countryCode: selectedCountry,
        });
      }
    } catch (e) {
      console.warn('[HomeScreen] Navigation failed:', e);
    }
  };

  const formatLastSynced = (): string => {
    if (!lastSynced) return 'Offline Ready';
    return lastSynced.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const activeCountryMeta =
    COUNTRIES.find((c) => c.code === selectedCountry) || COUNTRIES[0];

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#1A3C5E" />

      {/* Header */}
      <View style={styles.header}>
        <Image
          source={require('../../assets/icon.png')}
          style={styles.headerLogo}
          resizeMode="contain"
        />
        <Text style={styles.headerTitle}>TrafficTest</Text>
        <Text style={styles.headerSubtitle}>
          Global Official Highway Code & License Prep
        </Text>
      </View>

      {/* Country Selection Bar */}
      <View style={styles.countryBar}>
        <View style={styles.countryHeaderRow}>
          <Text style={styles.countryBarTitle}>SELECT JURISDICTION</Text>
          <View style={styles.countryActiveTag}>
            <Text style={styles.countryActiveText}>
              {activeCountryMeta.flag} {activeCountryMeta.name} ({activeCountryMeta.badge})
            </Text>
          </View>
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.countryScroll}
        >
          {COUNTRIES.map((c) => {
            const isSelected = c.code === selectedCountry;
            return (
              <TouchableOpacity
                key={c.code}
                style={[
                  styles.countryChip,
                  isSelected && styles.countryChipActive,
                ]}
                onPress={() => handleCountrySelect(c.code)}
                activeOpacity={0.75}
              >
                <Text style={styles.countryChipFlag}>{c.flag}</Text>
                <Text
                  style={[
                    styles.countryChipText,
                    isSelected && styles.countryChipTextActive,
                  ]}
                >
                  {c.name}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* Sync status bar */}
      <View style={[styles.syncBar, isSyncing && styles.syncBarActive]}>
        <Text style={styles.syncIcon}>{isSyncing ? '🔄' : '🛡️'}</Text>
        <Text style={styles.syncText}>
          {isSyncing
            ? 'Updating official question bank…'
            : `Authoritative Question Bank • Total ${counts.total} Available (${formatLastSynced()})`}
        </Text>
      </View>

      {/* Category cards */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.sectionTitle}>
          Practice Categories ({activeCountryMeta.name})
        </Text>

        {counts.total === 0 ? (
          <View style={styles.emptyCard}>
            <Text style={styles.emptyEmoji}>🌍</Text>
            <Text style={styles.emptyTitle}>No Regional Questions Yet</Text>
            <Text style={styles.emptySubtitle}>
              Official questions for {activeCountryMeta.name} are currently being curated. Switch to Global (Vienna Convention) to practice universal road rules.
            </Text>
            <TouchableOpacity
              style={styles.switchGlobalBtn}
              onPress={() => handleCountrySelect('GLOBAL')}
            >
              <Text style={styles.switchGlobalBtnText}>Switch to Global Standard 🌐</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <>
            <View style={styles.cardGrid}>
              {CATEGORIES.map((card) => {
                const count = counts[card.countKey];
                return (
                  <TouchableOpacity
                    key={card.category}
                    style={[styles.card, styles.halfCard, { borderTopColor: card.color }]}
                    onPress={() => handleCategoryPress(card.category)}
                    activeOpacity={0.85}
                  >
                    <Text style={styles.cardEmoji}>{card.emoji}</Text>
                    <Text style={styles.cardLabel}>{card.label}</Text>
                    <Text style={styles.cardDescription}>
                      {count} {count === 1 ? 'Question' : 'Questions'}
                    </Text>
                    <View style={[styles.cardTag, { backgroundColor: card.color }]}>
                      <Text style={styles.cardTagText}>{card.tag}</Text>
                    </View>
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* All questions card – full width */}
            <TouchableOpacity
              style={[styles.card, styles.fullCard, { borderTopColor: '#1A3C5E' }]}
              onPress={() => handleCategoryPress('ALL')}
              activeOpacity={0.85}
            >
              <View style={styles.fullCardInner}>
                <Text style={styles.cardEmoji}>🗂️</Text>
                <View style={styles.fullCardText}>
                  <Text style={styles.cardLabel}>Comprehensive Practice</Text>
                  <Text style={styles.cardDescription}>
                    Complete balanced pool of all {counts.total} official questions
                  </Text>
                </View>
                <View style={[styles.cardTag, { backgroundColor: '#1A3C5E' }]}>
                  <Text style={styles.cardTagText}>START →</Text>
                </View>
              </View>
            </TouchableOpacity>
          </>
        )}

        {/* Bottom padding */}
        <View style={{ height: 32 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F1F5F9',
  },
  header: {
    backgroundColor: '#1A3C5E',
    paddingTop: 56,
    paddingBottom: 28,
    alignItems: 'center',
  },
  headerLogo: {
    width: 72,
    height: 72,
    borderRadius: 18,
    marginBottom: 12,
  },
  headerTitle: {
    fontSize: 26,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
  headerSubtitle: {
    fontSize: 13,
    color: '#93C5FD',
    marginTop: 4,
    fontWeight: '500',
  },
  syncBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E0F2FE',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#BAE6FD',
  },
  syncBarActive: {
    backgroundColor: '#FEF9C3',
    borderBottomColor: '#FDE047',
  },
  syncIcon: {
    fontSize: 14,
    marginRight: 6,
  },
  syncText: {
    fontSize: 12,
    color: '#374151',
    fontWeight: '500',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: 14,
    marginTop: 4,
  },
  cardGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 12,
    marginBottom: 12,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 16,
    borderTopWidth: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 3,
  },
  halfCard: {
    width: '47%',
    minHeight: 150,
    justifyContent: 'space-between',
  },
  fullCard: {
    width: '100%',
    marginBottom: 4,
  },
  fullCardInner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  fullCardText: {
    flex: 1,
  },
  cardEmoji: {
    fontSize: 28,
    marginBottom: 6,
  },
  cardLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: 4,
  },
  cardDescription: {
    fontSize: 11,
    color: '#64748B',
    marginBottom: 8,
    lineHeight: 15,
  },
  cardTag: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  cardTagText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
  countryBar: {
    backgroundColor: '#0F2744',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#1E3A5F',
  },
  countryHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  countryBarTitle: {
    fontSize: 11,
    fontWeight: '700',
    color: '#94A3B8',
    letterSpacing: 0.8,
  },
  countryActiveTag: {
    backgroundColor: '#1E3A5F',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  countryActiveText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#38BDF8',
  },
  countryScroll: {
    flexDirection: 'row',
    gap: 8,
    paddingVertical: 2,
  },
  countryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#1E293B',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#334155',
  },
  countryChipActive: {
    backgroundColor: '#0284C7',
    borderColor: '#38BDF8',
  },
  countryChipFlag: {
    fontSize: 14,
  },
  countryChipText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#CBD5E1',
  },
  countryChipTextActive: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  emptyCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 24,
    alignItems: 'center',
    marginTop: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 3,
  },
  emptyEmoji: {
    fontSize: 40,
    marginBottom: 10,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: 6,
  },
  emptySubtitle: {
    fontSize: 13,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: 16,
  },
  switchGlobalBtn: {
    backgroundColor: '#1A3C5E',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
  },
  switchGlobalBtnText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 13,
  },
});
