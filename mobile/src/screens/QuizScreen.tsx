import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Image } from 'expo-image';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../App';
import { useQuiz } from '../hooks/useQuiz';
import RoadSignGraphic from '../components/RoadSignGraphic';
import type { Question } from '../types';

type QuizRouteProp = RouteProp<RootStackParamList, 'Quiz'>;
type QuizNavProp = NativeStackNavigationProp<RootStackParamList, 'Quiz'>;

const OPTION_LABELS = ['A', 'B', 'C', 'D'];



function formatCategoryLabel(cat?: string): string {
  if (!cat || cat === 'ALL') return 'Comprehensive Practice';
  switch (cat) {
    case 'TRAFFIC_REGULATORY':
    case 'REGULATORY':
      return 'Regulatory Signs';
    case 'WARNING_SIGNS':
    case 'WARNING':
      return 'Warning Signs';
    case 'TRAFFIC_SIGNALS':
    case 'SIGNAL':
      return 'Traffic Signals';
    case 'GENERAL_KNOWLEDGE':
    case 'GENERAL':
      return 'General Knowledge';
    default:
      return cat.replace(/_/g, ' ');
  }
}

export default function QuizScreen() {
  const navigation = useNavigation<QuizNavProp>();
  const route = useRoute<QuizRouteProp>();
  const { category, countryCode, sessionLimit } = route.params ?? {};

  const {
    questions,
    currentIndex,
    score,
    selectedAnswer,
    isAnswered,
    isFinished,
    history,
    selectAnswer,
    nextQuestion,
  } = useQuiz(category, countryCode, sessionLimit ?? 0);

  const [imageLoading, setImageLoading] = useState(false);
  const [imageError, setImageError] = useState(false);

  // Reset image error state on question change
  React.useEffect(() => {
    setImageError(false);
    setImageLoading(false);
  }, [currentIndex]);

  // Navigate to results when finished
  React.useEffect(() => {
    if (isFinished) {
      navigation.replace('Result', { history, score, total: questions.length });
    }
  }, [isFinished, navigation, history, score, questions.length]);

  const handleExit = () => {
    Alert.alert(
      'Exit Quiz',
      'Are you sure you want to exit? Your progress will be lost.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Exit',
          style: 'destructive',
          onPress: () => navigation.goBack(),
        },
      ],
    );
  };

  if (questions.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyEmoji}>📭</Text>
        <Text style={styles.emptyTitle}>No Questions Found</Text>
        <Text style={styles.emptyText}>
          The question bank is empty or not yet downloaded.{'\n'}Please connect to the internet and restart the app.
        </Text>
        <TouchableOpacity style={styles.emptyButton} onPress={() => navigation.goBack()}>
          <Text style={styles.emptyButtonText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const currentQuestion = questions[currentIndex];
  const progress = (currentIndex + 1) / questions.length;

  // Clean question text (remove debug scenario tags)
  const cleanQuestionText = currentQuestion.text
    ? currentQuestion.text.replace(/\s*\(Scenario\s*#\d+\)/gi, '').trim()
    : '';

  const signCode = currentQuestion.signCode || null;

  const getOptionStyle = (index: number) => {
    if (!isAnswered) return styles.optionButton;
    if (index === currentQuestion.correctIndex) return [styles.optionButton, styles.optionCorrect];
    if (index === selectedAnswer && index !== currentQuestion.correctIndex)
      return [styles.optionButton, styles.optionWrong];
    return [styles.optionButton, styles.optionNeutral];
  };

  const getOptionTextStyle = (index: number) => {
    if (!isAnswered) return styles.optionText;
    if (index === currentQuestion.correctIndex) return [styles.optionText, styles.optionTextHighlight];
    if (index === selectedAnswer) return [styles.optionText, styles.optionTextHighlight];
    return styles.optionText;
  };

  return (
    <View style={styles.container}>
      {/* Top bar */}
      <View style={styles.topBar}>
        <TouchableOpacity onPress={handleExit} style={styles.exitButton}>
          <Text style={styles.exitText}>✕ Exit</Text>
        </TouchableOpacity>
        <Text style={styles.scoreText}>Score: {score}/{currentIndex + (isAnswered ? 1 : 0)}</Text>
      </View>

      {/* Progress bar */}
      <View style={styles.progressContainer}>
        <View style={[styles.progressBar, { width: `${progress * 100}%` }]} />
      </View>
      <Text style={styles.progressLabel}>
        Question {currentIndex + 1} of {questions.length}
        {`  •  ${formatCategoryLabel(category)}`}
      </Text>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Question visual: Crisp vector road sign for sign questions; scenario photography/illustration for General Knowledge */}
        {signCode || currentQuestion.category !== 'GENERAL_KNOWLEDGE' ? (
          <View style={styles.signVectorContainer}>
            <RoadSignGraphic
              signCode={signCode || currentQuestion.questionCode}
              category={currentQuestion.category}
              questionText={cleanQuestionText}
              size={140}
            />
          </View>
        ) : currentQuestion.imageUrl && !imageError ? (
          <View style={styles.imageContainer}>
            {imageLoading && (
              <ActivityIndicator
                style={StyleSheet.absoluteFill}
                size="large"
                color="#1A3C5E"
              />
            )}
            <Image
              source={{ uri: currentQuestion.imageUrl }}
              style={styles.questionImage}
              contentFit="contain"
              onLoadStart={() => setImageLoading(true)}
              onLoadEnd={() => setImageLoading(false)}
              onError={() => setImageError(true)}
              transition={200}
            />
          </View>
        ) : (
          <View style={styles.signVectorContainer}>
            <RoadSignGraphic
              signCode={signCode || currentQuestion.questionCode}
              category={currentQuestion.category}
              questionText={cleanQuestionText}
              size={140}
            />
          </View>
        )}

        {/* Question text */}
        <View style={styles.questionCard}>
          <Text style={styles.questionText}>{cleanQuestionText}</Text>
        </View>

        {/* Options */}
        <View style={styles.optionsContainer}>
          {currentQuestion.options.map((option, index) => (
            <TouchableOpacity
              key={`${currentIndex}-${index}`}
              style={getOptionStyle(index)}
              onPress={() => selectAnswer(index)}
              disabled={isAnswered}
              activeOpacity={0.8}
            >
              <View style={styles.optionLabelContainer}>
                <Text style={styles.optionLabel}>{OPTION_LABELS[index]}</Text>
              </View>
              <Text style={getOptionTextStyle(index)}>{option}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Explanation & Authoritative Citation */}
        {isAnswered && (currentQuestion.explanation || currentQuestion.sourceCitation || currentQuestion.source) ? (
          <View style={styles.explanationCard}>
            {currentQuestion.explanation ? (
              <>
                <Text style={styles.explanationTitle}>💡 Explanation</Text>
                <Text style={styles.explanationText}>{currentQuestion.explanation}</Text>
              </>
            ) : null}

            {(currentQuestion.sourceCitation || currentQuestion.source) ? (
              <View style={styles.citationBox}>
                <Text style={styles.citationBadge}>🏛️ OFFICIAL SOURCE CITATION</Text>
                <Text style={styles.citationText}>
                  {currentQuestion.sourceCitation || currentQuestion.source}
                </Text>
              </View>
            ) : null}
          </View>
        ) : null}

        <View style={{ height: 80 }} />
      </ScrollView>

      {/* Next button */}
      <View style={styles.nextContainer}>
        <TouchableOpacity
          style={[styles.nextButton, !isAnswered && styles.nextButtonDisabled]}
          onPress={nextQuestion}
          disabled={!isAnswered}
          activeOpacity={0.85}
        >
          <Text style={styles.nextButtonText}>
            {currentIndex + 1 === questions.length ? 'View Results →' : 'Next Question →'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F1F5F9',
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
  },
  emptyEmoji: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 24,
  },
  emptyButton: {
    backgroundColor: '#1A3C5E',
    borderRadius: 10,
    paddingHorizontal: 24,
    paddingVertical: 12,
  },
  emptyButtonText: {
    color: '#FFF',
    fontWeight: '700',
    fontSize: 15,
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#1A3C5E',
    paddingTop: 16,
    paddingBottom: 12,
    paddingHorizontal: 16,
  },
  exitButton: {
    backgroundColor: 'rgba(255,255,255,0.15)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  exitText: {
    color: '#FFF',
    fontWeight: '600',
    fontSize: 13,
  },
  scoreText: {
    color: '#93C5FD',
    fontWeight: '700',
    fontSize: 14,
  },
  progressContainer: {
    height: 5,
    backgroundColor: '#CBD5E1',
  },
  progressBar: {
    height: 5,
    backgroundColor: '#10B981',
  },
  progressLabel: {
    fontSize: 12,
    color: '#64748B',
    textAlign: 'right',
    paddingHorizontal: 16,
    paddingVertical: 6,
    fontWeight: '500',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingTop: 8,
  },

  // Image & Vector container
  imageContainer: {
    width: '100%',
    height: 180,
    backgroundColor: '#E2E8F0',
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  questionImage: { width: '100%', height: '100%' },
  signVectorContainer: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    paddingVertical: 14,
    paddingHorizontal: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },

  // Question
  questionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  questionText: { fontSize: 16, fontWeight: '600', color: '#1E293B', lineHeight: 24 },

  // Options
  optionsContainer: { gap: 10 },
  optionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    padding: 14,
    borderWidth: 2,
    borderColor: '#E2E8F0',
    gap: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 3,
    elevation: 1,
  },
  optionCorrect: {
    borderColor: '#10B981',
    backgroundColor: '#ECFDF5',
  },
  optionWrong: {
    borderColor: '#EF4444',
    backgroundColor: '#FEF2F2',
  },
  optionNeutral: {
    borderColor: '#E2E8F0',
    opacity: 0.6,
  },
  optionLabelContainer: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#1A3C5E',
    alignItems: 'center',
    justifyContent: 'center',
  },
  optionLabel: { color: '#FFF', fontWeight: '700', fontSize: 12 },
  optionText: { flex: 1, fontSize: 14, color: '#374151', lineHeight: 20 },
  optionTextHighlight: { fontWeight: '700' },

  // Explanation
  explanationCard: {
    backgroundColor: '#FEF9C3',
    borderRadius: 10,
    padding: 14,
    marginTop: 14,
    borderLeftWidth: 4,
    borderLeftColor: '#F59E0B',
  },
  explanationTitle: { fontSize: 13, fontWeight: '700', color: '#92400E', marginBottom: 4 },
  explanationText: { fontSize: 13, color: '#713F12', lineHeight: 19 },
  citationBox: {
    marginTop: 10,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#FDE68A',
  },
  citationBadge: {
    fontSize: 10,
    fontWeight: '800',
    color: '#B45309',
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  citationText: {
    fontSize: 12,
    color: '#78350F',
    fontWeight: '500',
    lineHeight: 16,
  },

  // Next button
  nextContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 16,
    backgroundColor: '#F1F5F9',
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
  },
  nextButton: {
    backgroundColor: '#1A3C5E',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
  },
  nextButtonDisabled: { backgroundColor: '#94A3B8' },
  nextButtonText: { color: '#FFF', fontWeight: '700', fontSize: 16 },
});
