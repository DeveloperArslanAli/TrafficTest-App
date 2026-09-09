import React from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Platform,
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../App';
import type { HistoryEntry } from '../types';
import { storage } from '../utils/storage';

type ResultRouteProp = RouteProp<RootStackParamList, 'Result'>;
type ResultNavProp = NativeStackNavigationProp<RootStackParamList, 'Result'>;

const PASS_THRESHOLD = 0.8; // 80%

export default function ResultScreen() {
  const navigation = useNavigation<ResultNavProp>();
  const route = useRoute<ResultRouteProp>();
  const { history, score, total } = route.params;

  const percentage = total > 0 ? score / total : 0;
  const passed = percentage >= PASS_THRESHOLD;
  const incorrectEntries = history.filter((h) => !h.isCorrect);
  const correctCount = history.filter((h) => h.isCorrect).length;

  // Persist attempt stats to MMKV
  React.useEffect(() => {
    const prevAttempts = storage.getNumber('total_attempts') ?? 0;
    const prevScore = storage.getNumber('total_score') ?? 0;
    const prevQuestions = storage.getNumber('total_questions_attempted') ?? 0;
    storage.set('total_attempts', prevAttempts + 1);
    storage.set('total_score', prevScore + score);
    storage.set('total_questions_attempted', prevQuestions + total);
  }, [score, total]);

  const handleRetry = () => {
    navigation.goBack();
  };

  const handleHome = () => {
    navigation.navigate('Home');
  };

  return (
    <View style={styles.container}>
      {/* Result header */}
      <View style={[styles.header, passed ? styles.headerPass : styles.headerFail]}>
        <Text style={styles.resultEmoji}>{passed ? '🏆' : '📚'}</Text>
        <Text style={styles.resultTitle}>{passed ? 'You Passed!' : 'Keep Practicing'}</Text>
        <Text style={styles.scoreDisplay}>
          {score} / {total}
        </Text>
        <Text style={styles.percentageText}>{Math.round(percentage * 100)}%</Text>
        <View style={styles.badge}>
          <Text style={styles.badgeText}>
            {passed ? '✅ PASS' : '❌ FAIL'} — Threshold: {PASS_THRESHOLD * 100}%
          </Text>
        </View>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Summary stats */}
        <View style={styles.statsRow}>
          <View style={[styles.statCard, styles.statCorrect]}>
            <Text style={styles.statNumber}>{correctCount}</Text>
            <Text style={styles.statLabel}>Correct</Text>
          </View>
          <View style={[styles.statCard, styles.statIncorrect]}>
            <Text style={styles.statNumber}>{incorrectEntries.length}</Text>
            <Text style={styles.statLabel}>Incorrect</Text>
          </View>
          <View style={[styles.statCard, styles.statTotal]}>
            <Text style={styles.statNumber}>{total}</Text>
            <Text style={styles.statLabel}>Total</Text>
          </View>
        </View>

        {/* Progress bar */}
        <View style={styles.progressTrack}>
          <View style={[styles.progressFill, { width: `${percentage * 100}%`, backgroundColor: passed ? '#10B981' : '#EF4444' }]} />
        </View>

        {/* Wrong answers breakdown */}
        {incorrectEntries.length > 0 ? (
          <>
            <Text style={styles.sectionTitle}>Questions to Review ({incorrectEntries.length})</Text>
            {incorrectEntries.map((entry: HistoryEntry, idx: number) => (
              <View key={entry.question.id} style={styles.reviewCard}>
                <View style={styles.reviewHeader}>
                  <Text style={styles.reviewNumber}>Q{idx + 1}</Text>
                  <View style={[styles.categoryTag, { backgroundColor: getCategoryColor(entry.question.category) }]}>
                    <Text style={styles.categoryTagText}>{entry.question.category}</Text>
                  </View>
                </View>
                <Text style={styles.reviewQuestion}>{entry.question.text}</Text>
                <View style={styles.reviewAnswerRow}>
                  <Text style={styles.reviewAnswerLabel}>Your answer: </Text>
                  <Text style={styles.reviewAnswerWrong}>
                    {entry.question.options[entry.selectedIndex]}
                  </Text>
                </View>
                <View style={styles.reviewAnswerRow}>
                  <Text style={styles.reviewAnswerLabel}>Correct answer: </Text>
                  <Text style={styles.reviewAnswerCorrect}>
                    {entry.question.options[entry.question.correctIndex]}
                  </Text>
                </View>
                {entry.question.explanation ? (
                  <Text style={styles.reviewExplanation}>💡 {entry.question.explanation}</Text>
                ) : null}
              </View>
            ))}
          </>
        ) : (
          <View style={styles.perfectCard}>
            <Text style={styles.perfectEmoji}>🎯</Text>
            <Text style={styles.perfectText}>Perfect score! No wrong answers.</Text>
          </View>
        )}

        {/* Action buttons */}
        <View style={styles.actionsContainer}>
          <TouchableOpacity style={styles.retryButton} onPress={handleRetry} activeOpacity={0.85}>
            <Text style={styles.retryButtonText}>🔄  Try Again</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.homeButton} onPress={handleHome} activeOpacity={0.85}>
            <Text style={styles.homeButtonText}>🏠  Home</Text>
          </TouchableOpacity>
        </View>

        <View style={{ height: 32 }} />
      </ScrollView>
    </View>
  );
}

function getCategoryColor(category: string): string {
  switch (category) {
    case 'WARNING': return '#F59E0B';
    case 'REGULATORY': return '#EF4444';
    case 'SIGNAL': return '#10B981';
    case 'GENERAL': return '#6366F1';
    default: return '#64748B';
  }
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F1F5F9' },

  header: {
    paddingTop: Platform.OS === 'android' ? 48 : 56,
    paddingBottom: 28,
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  headerPass: { backgroundColor: '#064E3B' },
  headerFail: { backgroundColor: '#7F1D1D' },

  resultEmoji: { fontSize: 52, marginBottom: 8 },
  resultTitle: { fontSize: 22, fontWeight: '800', color: '#FFF', marginBottom: 6 },
  scoreDisplay: { fontSize: 48, fontWeight: '900', color: '#FFF', lineHeight: 56 },
  percentageText: { fontSize: 18, color: 'rgba(255,255,255,0.8)', fontWeight: '600', marginBottom: 10 },
  badge: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
  },
  badgeText: { color: '#FFF', fontWeight: '700', fontSize: 12 },

  scrollView: { flex: 1 },
  scrollContent: { padding: 16 },

  statsRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 12,
    marginTop: 4,
  },
  statCard: {
    flex: 1,
    borderRadius: 12,
    padding: 14,
    alignItems: 'center',
  },
  statCorrect: { backgroundColor: '#ECFDF5' },
  statIncorrect: { backgroundColor: '#FEF2F2' },
  statTotal: { backgroundColor: '#EFF6FF' },
  statNumber: { fontSize: 28, fontWeight: '800', color: '#1E293B' },
  statLabel: { fontSize: 11, color: '#64748B', fontWeight: '600', marginTop: 2 },

  progressTrack: {
    height: 8,
    backgroundColor: '#E2E8F0',
    borderRadius: 4,
    marginBottom: 20,
    overflow: 'hidden',
  },
  progressFill: { height: 8, borderRadius: 4 },

  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: 10,
  },

  reviewCard: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
    borderLeftWidth: 4,
    borderLeftColor: '#EF4444',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 1,
  },
  reviewHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 6 },
  reviewNumber: { fontSize: 12, fontWeight: '700', color: '#94A3B8' },
  categoryTag: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 6 },
  categoryTagText: { fontSize: 10, fontWeight: '700', color: '#FFF' },
  reviewQuestion: { fontSize: 14, fontWeight: '600', color: '#1E293B', marginBottom: 8, lineHeight: 20 },
  reviewAnswerRow: { flexDirection: 'row', flexWrap: 'wrap', marginBottom: 2 },
  reviewAnswerLabel: { fontSize: 12, color: '#64748B' },
  reviewAnswerWrong: { fontSize: 12, color: '#DC2626', fontWeight: '700' },
  reviewAnswerCorrect: { fontSize: 12, color: '#059669', fontWeight: '700' },
  reviewExplanation: { fontSize: 12, color: '#78350F', marginTop: 6, lineHeight: 17, fontStyle: 'italic' },

  perfectCard: {
    backgroundColor: '#ECFDF5',
    borderRadius: 12,
    padding: 24,
    alignItems: 'center',
    marginBottom: 16,
  },
  perfectEmoji: { fontSize: 40, marginBottom: 8 },
  perfectText: { fontSize: 16, fontWeight: '700', color: '#065F46' },

  actionsContainer: { flexDirection: 'row', gap: 12, marginTop: 8 },
  retryButton: {
    flex: 1,
    backgroundColor: '#1A3C5E',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
  },
  retryButtonText: { color: '#FFF', fontWeight: '700', fontSize: 15 },
  homeButton: {
    flex: 1,
    backgroundColor: '#FFF',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#1A3C5E',
  },
  homeButtonText: { color: '#1A3C5E', fontWeight: '700', fontSize: 15 },
});
