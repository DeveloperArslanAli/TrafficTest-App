export type Category =
  | 'TRAFFIC_REGULATORY'
  | 'WARNING_SIGNS'
  | 'TRAFFIC_SIGNALS'
  | 'GENERAL_KNOWLEDGE'
  | 'WARNING'
  | 'REGULATORY'
  | 'SIGNAL'
  | 'GENERAL';

export type ContentStatus =
  | 'DRAFT'
  | 'AI_GENERATED'
  | 'UNDER_REVIEW'
  | 'VERIFIED'
  | 'APPROVED'
  | 'PUBLISHED'
  | 'UNPUBLISHED'
  | 'ARCHIVED'
  | 'REJECTED';

export type Difficulty = 'EASY' | 'MEDIUM' | 'HARD';

export interface Question {
  id: string;
  questionCode?: string;
  category: Category;
  subCategory?: string | null;
  questionType?: string;
  difficulty?: Difficulty;
  text: string;
  options: string[];
  correctIndex: number;
  correctAnswer?: string;
  explanation?: string | null;
  imageUrl?: string | null;
  signCode?: string | null;
  isPublished: boolean;
  status?: ContentStatus;
  version?: number;
  countryId?: string | null;
  country?: Country | null;
  jurisdictionId?: string | null;
  signId?: string | null;
  sign?: {
    id?: string;
    canonicalCode: string;
    canonicalName: string;
  } | null;
  sourceId?: string | null;
  source?: {
    id: string;
    name: string;
    document?: string;
    tier?: number;
  } | null;
  createdAt: string;
  updatedAt: string;
}

export interface TrafficSignVariant {
  id: string;
  trafficSignId: string;
  countryId: string;
  country: {
    id: string;
    code: string;
    name: string;
    flagEmoji?: string;
  };
  jurisdictionId?: string | null;
  officialCode: string;
  officialName: string;
  localizedName?: string | null;
  description?: string | null;
  imageUrl?: string | null;
  imageHash?: string | null;
  shape?: string | null;
  meaning?: string | null;
  driverAction?: string | null;
  sourceId?: string | null;
  status: ContentStatus;
  createdAt: string;
  updatedAt: string;
}

export interface TrafficSign {
  id: string;
  canonicalCode: string;
  category: string;
  subCategory?: string | null;
  canonicalName: string;
  shortName?: string | null;
  meaning: string;
  driverAction?: string | null;
  shape?: string | null;
  primarySymbol?: string | null;
  prohibitionType?: string | null;
  isGlobal: boolean;
  status: ContentStatus;
  variants?: TrafficSignVariant[];
  _count?: {
    questions: number;
    variants?: number;
  };
  createdAt: string;
  updatedAt: string;
}

export interface DuplicateCandidate {
  id: string;
  candidateType: 'SIGN' | 'QUESTION';
  entityAId: string;
  entityBId: string;
  similarityScore: number;
  nameScore?: number;
  meaningScore?: number;
  symbolScore?: number;
  imageScore?: number;
  recommendation: 'LIKELY_DUPLICATE' | 'POSSIBLE_VARIANT' | 'DISTINCT';
  status: 'PENDING' | 'MERGED' | 'KEPT_SEPARATE' | 'MARKED_AS_VARIANT' | 'REJECTED';
  resolvedBy?: string | null;
  resolutionReason?: string | null;
  resolvedAt?: string | null;
  createdAt: string;
}

export interface Source {
  id: string;
  name: string;
  url?: string | null;
  authorityId?: string | null;
  authority?: {
    id: string;
    code: string;
    name: string;
    website?: string | null;
  } | null;
  countryId?: string | null;
  country?: Country | null;
  jurisdictionId?: string | null;
  document?: string | null;
  section?: string | null;
  page?: string | null;
  tier: number;
  verifiedAt?: string | null;
  contentVersion: number;
  status: string;
  _count?: {
    questions: number;
    signVariants: number;
  };
}

export interface Jurisdiction {
  id: string;
  countryId: string;
  code: string;
  name: string;
  type: string;
  status: string;
  _count?: {
    questions: number;
  };
}

export interface Country {
  id: string;
  code: string;
  name: string;
  isoCode?: string | null;
  flagEmoji?: string | null;
  status: string;
  jurisdictions?: Jurisdiction[];
  _count?: {
    questions: number;
    signVariants: number;
  };
}

export interface DashboardStats {
  canonicalSignsCount: number;
  signVariantsCount: number;
  totalActiveQuestions: number;
  publishedQuestions: number;
  draftQuestions: number;
  underReviewQuestions: number;
  duplicateCandidatesPending: number;
  legacyArchivedQuestions: number;
  activeLegacyQuestions: number;
  missingSourcesCount: number;
  categories: Record<string, number>;
  countryBreakdown: Record<string, { name: string; flag: string; count: number }>;
  dataIntegrity: {
    activeLegacyLeaked: boolean;
    zeroMissingSources: boolean;
    duplicateCandidatesZero: boolean;
  };
}

export interface LoginResponse {
  access_token: string;
  user: AdminUser;
}

export interface AdminUser {
  id: string;
  email: string;
  role: string;
  name?: string;
}

export interface PexelsPhoto {
  id: number;
  alt: string;
  photographer: string;
  photographerUrl: string;
  url: string;
  dimensions: { width: number; height: number };
  urls: {
    original: string;
    large2x: string;
    large: string;
    medium: string;
    small: string;
    thumbnail: string;
  };
}

export interface CuratedTheme {
  id: string;
  label: string;
  badge: string;
  query: string;
}
