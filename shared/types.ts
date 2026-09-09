/**
 * Shared TypeScript types for RoadWise Driver platform.
 * Used by both the Admin panel (web) and can be referenced by Mobile.
 *
 * Keep in sync with prisma/schema.prisma and NestJS DTOs.
 */

// ─── Enums ───────────────────────────────────────────────────────────────────

export type Role = 'USER' | 'ADMIN';

export type Category = 'WARNING' | 'REGULATORY' | 'SIGNAL' | 'GENERAL';

// ─── Core Entities ───────────────────────────────────────────────────────────

export interface User {
  id: string;
  email: string;
  role: Role;
  createdAt: string;
}

export interface Question {
  id: string;
  category: Category;
  text: string;
  imageUrl: string | null;
  signCode?: string | null;
  options: string[];         // Always 4 items
  correctIndex: number;      // 0–3
  explanation: string | null;
  isPublished: boolean;
  createdAt: string;
  updatedAt: string;
}

/** Lightweight version sent to mobile (no admin-only fields) */
export interface QuestionPublic {
  id: string;
  category: Category;
  text: string;
  imageUrl: string | null;
  options: string[];
  correctIndex: number;
  explanation: string | null;
}

export interface AppSetting {
  id: 'single_row';
  questionBankVersion: number;
  updatedAt: string;
}

export interface AuditLog {
  id: string;
  adminId: string;
  action: string;
  questionId: string | null;
  createdAt: string;
}

// ─── API Payloads ─────────────────────────────────────────────────────────────

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  access_token: string;
  user: Pick<User, 'id' | 'email' | 'role'>;
}

export interface RegisterRequest {
  email: string;
  password: string;
}

export interface VersionResponse {
  version: number;
}

export interface BankResponse {
  questions: QuestionPublic[];
}

export interface CreateQuestionRequest {
  category: Category;
  text: string;
  options: string;          // JSON.stringify of string[4]
  correctIndex: number;
  explanation?: string;
  isPublished?: boolean;
  // image: File (multipart, not in JSON body)
}

export interface TogglePublishRequest {
  isPublished: boolean;
}

// ─── Quiz Session (Mobile) ────────────────────────────────────────────────────

export interface QuizAnswer {
  questionId: string;
  selectedIndex: number;
  isCorrect: boolean;
}

export interface QuizSession {
  questions: QuestionPublic[];
  currentIndex: number;
  score: number;
  history: QuizAnswer[];
  isFinished: boolean;
}

// ─── Category Color Map (used by Admin Table + Mobile UI) ─────────────────────

export const CATEGORY_COLORS: Record<Category, string> = {
  WARNING: '#fa8c16',      // orange
  REGULATORY: '#1677ff',   // blue
  SIGNAL: '#52c41a',       // green
  GENERAL: '#8c8c8c',      // gray
};

export const CATEGORY_LABELS: Record<Category, string> = {
  WARNING: '⚠️ Warning',
  REGULATORY: '🔵 Regulatory',
  SIGNAL: '🟢 Signal',
  GENERAL: '⬜ General',
};

// ─── Constants (shared across all layers) ────────────────────────────────────

/** Redis key for the global question bank version counter */
export const REDIS_VERSION_KEY = 'question_bank_version';

/** MMKV keys used by mobile app */
export const MMKV_KEYS = {
  QUESTION_BANK: 'question_bank',
  QUESTION_BANK_VERSION: 'question_bank_version',
  AUTH_TOKEN: 'auth_token',
  AUTH_USER: 'auth_user',
  BOOKMARKS: 'bookmarks',
  LAST_SYNCED: 'last_synced',
} as const;

/** AppSetting singleton row ID */
export const APP_SETTING_ID = 'single_row';

/** Pass mark percentage for quiz (80%) */
export const PASS_PERCENTAGE = 80;

/** Number of questions per quiz session */
export const QUIZ_SESSION_SIZE = 20;
