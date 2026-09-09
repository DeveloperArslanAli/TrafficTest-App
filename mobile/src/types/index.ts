/** Question categories supported by the app */
export type QuestionCategory =
  | 'TRAFFIC_REGULATORY'
  | 'WARNING_SIGNS'
  | 'TRAFFIC_SIGNALS'
  | 'GENERAL_KNOWLEDGE'
  | 'WARNING'
  | 'REGULATORY'
  | 'SIGNAL'
  | 'GENERAL';

/** A single question as stored in the local bank */
export interface Question {
  id: string;
  questionCode?: string;
  category: QuestionCategory | string;
  subCategory?: string;
  questionType?: string;
  difficulty?: string;
  text: string;
  imageUrl?: string | null;
  signCode?: string | null;      // Standard road sign vector identifier (e.g. REG-STOP, REG-NO-U-TURN)
  options: string[];             // Always 4 options
  correctIndex: number;          // 0-based index into options[]
  explanation?: string | null;
  countryCode?: string;
  jurisdictionCode?: string;
  source?: string;
  sourceCitation?: string;
}

/** A single attempt recorded in quiz history */
export interface HistoryEntry {
  question: Question;
  selectedIndex: number;
  isCorrect: boolean;
}

/** User profile stored in MMKV */
export interface UserProfile {
  email: string;
  name?: string;
  totalAttempts: number;
  totalScore: number;     // Cumulative raw score across all attempts
}

/** Quiz session state returned by useQuiz */
export interface QuizState {
  questions: Question[];
  currentIndex: number;
  score: number;
  selectedAnswer: number | null;
  isAnswered: boolean;
  isFinished: boolean;
  history: HistoryEntry[];
  selectAnswer: (index: number) => void;
  nextQuestion: () => void;
  restartQuiz: () => void;
}

export interface CountryOption {
  code: string;
  name: string;
  flag: string;
  jurisdictions?: { code: string; name: string }[];
}
