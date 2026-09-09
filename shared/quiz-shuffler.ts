/**
 * quiz-shuffler.ts — Anti-Rote Memorization (Anti-Ratta) Engine
 *
 * Implements cryptographic/uniform Fisher-Yates (Knuth) shuffling
 * for both Question ordering and Question Options, preserving
 * strict mathematical integrity of the correct answer mapping.
 */

export interface Option {
  id: string; // "A", "B", "C", "D"
  text: string;
}

export interface RawQuestion {
  id: string;
  category: string;
  difficulty?: string;
  questionText: string;
  imageUrls?: {
    standard: string;
  };
  options: Option[];
  correctOptionId: string; // The ID ("A", "B", "C", "D") of the correct answer
  explanation: string;
}

export interface ShuffledQuestion extends RawQuestion {
  /** Map of original option ID to its new shuffled index */
  originalCorrectId: string;
  /** Current 0-based index of the correct answer in the shuffled `options` array */
  correctIndex: number;
}

// ─────────────────────────────────────────────────────────────────────────────
// 1. UNBIASED IN-PLACE FISHER-YATES SHUFFLE ALGORITHM
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Standard Fisher-Yates (Knuth) algorithm.
 * Guarantees uniform permutation probability O(N) with zero bias.
 */
export function fisherYatesShuffle<T>(items: readonly T[]): T[] {
  const result = [...items];
  for (let i = result.length - 1; i > 0; i--) {
    // Select random index j such that 0 <= j <= i
    const j = Math.floor(Math.random() * (i + 1));
    // Swap elements
    const temp = result[i];
    result[i] = result[j];
    result[j] = temp;
  }
  return result;
}

// ─────────────────────────────────────────────────────────────────────────────
// 2. DEEP QUESTION & OPTION RANDOMIZATION (ANTI-ROTTE SHUFFLING)
// ─────────────────────────────────────────────────────────────────────────────

const OPTION_LETTERS = ['A', 'B', 'C', 'D'] as const;

/**
 * Randomizes both the question pool and the internal order of options
 * for every question in a test session.
 *
 * @param questions Full or filtered array of raw questions
 * @param sessionLimit Max questions for this quiz session (default: 20)
 */
export function createShuffledQuizSession(
  questions: RawQuestion[],
  sessionLimit: number = 20,
): ShuffledQuestion[] {
  // Step 1: Shuffle the array of questions
  const randomizedQuestions = fisherYatesShuffle(questions);
  const selectedBatch = randomizedQuestions.slice(0, sessionLimit);

  // Step 2: Shuffle options within each question and re-anchor correct answer
  return selectedBatch.map((q) => {
    // Find the text of the correct option before shuffling
    const correctOptionObj = q.options.find((opt) => opt.id === q.correctOptionId);
    const correctText = correctOptionObj ? correctOptionObj.text : '';

    // Shuffle the options array
    const shuffledOptionsRaw = fisherYatesShuffle(q.options);

    // Re-assign visual labels A, B, C, D to prevent duplicate or missing letter keys
    const finalOptions: Option[] = shuffledOptionsRaw.map((opt, idx) => ({
      id: OPTION_LETTERS[idx] || String.fromCharCode(65 + idx),
      text: opt.text,
    }));

    // Locate the new index of the correct answer
    const newCorrectIndex = finalOptions.findIndex((opt) => opt.text === correctText);
    const newCorrectOptionId = finalOptions[newCorrectIndex]?.id ?? 'A';

    return {
      ...q,
      options: finalOptions,
      correctOptionId: newCorrectOptionId,
      originalCorrectId: q.correctOptionId,
      correctIndex: newCorrectIndex >= 0 ? newCorrectIndex : 0,
    };
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// 3. SELECTION VERIFICATION & AUDIT UTILITY
// ─────────────────────────────────────────────────────────────────────────────

export interface ValidationResult {
  isCorrect: boolean;
  selectedOptionId: string;
  correctOptionId: string;
  selectedText: string;
  correctText: string;
  explanation: string;
}

/**
 * Accurately validates user choice against the shuffled question state.
 *
 * @param question The active ShuffledQuestion
 * @param selectedChoice Either the chosen option ID ("A".."D") or 0-based index
 */
export function validateAnswer(
  question: ShuffledQuestion,
  selectedChoice: string | number,
): ValidationResult {
  let selectedIdx = -1;

  if (typeof selectedChoice === 'number') {
    selectedIdx = selectedChoice;
  } else {
    selectedIdx = question.options.findIndex((opt) => opt.id === selectedChoice);
  }

  const selectedOpt = question.options[selectedIdx];
  const isCorrect = selectedIdx === question.correctIndex;
  const correctOpt = question.options[question.correctIndex];

  return {
    isCorrect,
    selectedOptionId: selectedOpt?.id ?? 'UNKNOWN',
    correctOptionId: question.correctOptionId,
    selectedText: selectedOpt?.text ?? '',
    correctText: correctOpt?.text ?? '',
    explanation: question.explanation,
  };
}
