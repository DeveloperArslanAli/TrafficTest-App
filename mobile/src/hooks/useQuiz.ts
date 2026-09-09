import { useState, useCallback, useMemo } from 'react';
import { QuestionRepository } from '../repositories/QuestionRepository';
import type { Question, HistoryEntry, QuizState } from '../types';

/**
 * useQuiz
 *
 * Anti-Rote / Anti-Ratta randomized quiz session manager.
 * Supports configurable category, country scope, and dynamic question counts.
 *
 * @param category - Optional category filter ('WARNING', 'REGULATORY', etc.)
 * @param country - Optional country code ('PK', 'SA', 'US', etc.)
 * @param sessionLimit - Max questions for this quiz session (default: 0 = unlimited / all active questions)
 */
export function useQuiz(
  category?: string,
  country?: string,
  sessionLimit: number = 0,
): QuizState {
  const activeCountry = country || QuestionRepository.getSelectedCountry();

  // ---- Build randomized question pool ----
  const questions = useMemo<Question[]>(() => {
    return QuestionRepository.getRandomPracticeBatch({
      category: category && category !== 'ALL' ? category : undefined,
      countryCode: activeCountry,
      limit: sessionLimit > 0 ? sessionLimit : undefined,
    });
  }, [category, activeCountry, sessionLimit]);

  // ---- Session state ----
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [score, setScore] = useState<number>(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [isAnswered, setIsAnswered] = useState<boolean>(false);
  const [isFinished, setIsFinished] = useState<boolean>(false);
  const [history, setHistory] = useState<HistoryEntry[]>([]);

  // ---- Actions ----
  const selectAnswer = useCallback(
    (index: number) => {
      if (isAnswered || isFinished) return;
      const current = questions[currentIndex];
      if (!current) return;

      const isCorrect = index === current.correctIndex;

      setSelectedAnswer(index);
      setIsAnswered(true);

      if (isCorrect) {
        setScore((prev) => prev + 1);
      }

      setHistory((prev) => [
        ...prev,
        { question: current, selectedIndex: index, isCorrect },
      ]);
    },
    [isAnswered, isFinished, questions, currentIndex],
  );

  const nextQuestion = useCallback(() => {
    if (!isAnswered) return;

    const nextIndex = currentIndex + 1;
    if (nextIndex >= questions.length) {
      setIsFinished(true);
    } else {
      setCurrentIndex(nextIndex);
      setSelectedAnswer(null);
      setIsAnswered(false);
    }
  }, [isAnswered, currentIndex, questions.length]);

  const restartQuiz = useCallback(() => {
    setCurrentIndex(0);
    setScore(0);
    setSelectedAnswer(null);
    setIsAnswered(false);
    setIsFinished(false);
    setHistory([]);
  }, []);

  return {
    questions,
    currentIndex,
    score,
    selectedAnswer,
    isAnswered,
    isFinished,
    history,
    selectAnswer,
    nextQuestion,
    restartQuiz,
  };
}

export default useQuiz;
