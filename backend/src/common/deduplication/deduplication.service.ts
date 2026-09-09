import { Injectable } from '@nestjs/common';
import * as crypto from 'crypto';

export interface SimilarityResult {
  similarityScore: number;
  nameScore: number;
  meaningScore: number;
  symbolScore: number;
  imageScore: number;
  recommendation: 'LIKELY_DUPLICATE' | 'POSSIBLE_VARIANT' | 'DISTINCT';
}

@Injectable()
export class DeduplicationService {
  private readonly stopWords = new Set([
    'what', 'does', 'this', 'sign', 'mean', 'indicate', 'a', 'an', 'the',
    'is', 'are', 'was', 'were', 'it', 'its', 'of', 'when', 'you', 'see', 'to', 'in', 'on', 'at', 'for', 'by',
    'do', 'should', 'driver', 'must', 'road', 'ahead', 'symbol', 'which', 'following', 'how'
  ]);

  /**
   * Normalize text: lowercase, remove punctuation, remove stop words, sort tokens
   */
  normalizeText(text: string): string {
    return text
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, '')
      .split(/\s+/)
      .filter((t) => t.length > 0 && !this.stopWords.has(t))
      .sort()
      .join(' ');
  }

  /**
   * Generates a lexical fingerprint from normalized text.
   */
  generateQuestionFingerprint(text: string): string {
    const norm = this.normalizeText(text);
    return crypto.createHash('sha256').update(norm).digest('hex').slice(0, 24);
  }

  /**
   * Generates a semantic fingerprint incorporating category, sign code, question type, and text.
   */
  generateSemanticFingerprint(category: string, signCode: string | null | undefined, type: string | null | undefined, text: string): string {
    const norm = this.normalizeText(text);
    const base = `${category || 'GEN'}:${signCode || 'NONE'}:${type || 'IDENT'}:${norm}`;
    return crypto.createHash('sha256').update(base).digest('hex').slice(0, 24);
  }

  /**
   * Computes Jaccard similarity between two token sets.
   */
  tokenJaccardSimilarity(textA: string, textB: string): number {
    const tokensA = new Set(this.normalizeText(textA).split(/\s+/).filter(Boolean));
    const tokensB = new Set(this.normalizeText(textB).split(/\s+/).filter(Boolean));

    if (tokensA.size === 0 && tokensB.size === 0) return 1.0;
    if (tokensA.size === 0 || tokensB.size === 0) return 0.0;

    let intersectionCount = 0;
    tokensA.forEach((t) => {
      if (tokensB.has(t)) intersectionCount++;
    });

    const unionCount = tokensA.size + tokensB.size - intersectionCount;
    return unionCount === 0 ? 1.0 : intersectionCount / unionCount;
  }

  /**
   * Computes standard Levenshtein distance similarity (0.0 to 1.0).
   */
  levenshteinSimilarity(s1: string, s2: string): number {
    const str1 = s1.toLowerCase().trim();
    const str2 = s2.toLowerCase().trim();

    if (str1 === str2) return 1.0;
    if (str1.length === 0 || str2.length === 0) return 0.0;

    const matrix: number[][] = [];
    for (let i = 0; i <= str1.length; i++) {
      matrix[i] = [i];
    }
    for (let j = 0; j <= str2.length; j++) {
      matrix[0][j] = j;
    }

    for (let i = 1; i <= str1.length; i++) {
      for (let j = 1; j <= str2.length; j++) {
        const cost = str1[i - 1] === str2[j - 1] ? 0 : 1;
        matrix[i][j] = Math.min(
          matrix[i - 1][j] + 1,
          matrix[i][j - 1] + 1,
          matrix[i - 1][j - 1] + cost,
        );
      }
    }

    const dist = matrix[str1.length][str2.length];
    const maxLen = Math.max(str1.length, str2.length);
    return Math.max(0, 1 - dist / maxLen);
  }

  /**
   * Compares two sign candidates across name, meaning, symbol, and image.
   */
  compareSigns(
    signA: { name: string; meaning: string; symbol?: string | null; imageHash?: string | null },
    signB: { name: string; meaning: string; symbol?: string | null; imageHash?: string | null },
  ): SimilarityResult {
    const nameScore = Math.max(
      this.levenshteinSimilarity(signA.name, signB.name),
      this.tokenJaccardSimilarity(signA.name, signB.name),
    );

    const meaningScore = Math.max(
      this.levenshteinSimilarity(signA.meaning, signB.meaning),
      this.tokenJaccardSimilarity(signA.meaning, signB.meaning),
    );

    const symbolScore =
      signA.symbol && signB.symbol
        ? this.levenshteinSimilarity(signA.symbol, signB.symbol)
        : nameScore;

    const imageScore =
      signA.imageHash && signB.imageHash
        ? signA.imageHash === signB.imageHash
          ? 1.0
          : 0.0
        : 0.5;

    // Weighted aggregate score
    const similarityScore =
      nameScore * 0.35 + meaningScore * 0.35 + symbolScore * 0.2 + imageScore * 0.1;

    let recommendation: 'LIKELY_DUPLICATE' | 'POSSIBLE_VARIANT' | 'DISTINCT' = 'DISTINCT';
    if (similarityScore >= 0.85 || (nameScore >= 0.9 && meaningScore >= 0.85)) {
      recommendation = 'LIKELY_DUPLICATE';
    } else if (similarityScore >= 0.65 || meaningScore >= 0.75) {
      recommendation = 'POSSIBLE_VARIANT';
    }

    return {
      similarityScore: Math.round(similarityScore * 100) / 100,
      nameScore: Math.round(nameScore * 100) / 100,
      meaningScore: Math.round(meaningScore * 100) / 100,
      symbolScore: Math.round(symbolScore * 100) / 100,
      imageScore: Math.round(imageScore * 100) / 100,
      recommendation,
    };
  }

  /**
   * Compares two question candidates.
   */
  compareQuestions(textA: string, textB: string): SimilarityResult {
    const nameScore = this.levenshteinSimilarity(textA, textB);
    const meaningScore = this.tokenJaccardSimilarity(textA, textB);
    const similarityScore = nameScore * 0.4 + meaningScore * 0.6;

    let recommendation: 'LIKELY_DUPLICATE' | 'POSSIBLE_VARIANT' | 'DISTINCT' = 'DISTINCT';
    if (similarityScore >= 0.85) {
      recommendation = 'LIKELY_DUPLICATE';
    } else if (similarityScore >= 0.65) {
      recommendation = 'POSSIBLE_VARIANT';
    }

    return {
      similarityScore: Math.round(similarityScore * 100) / 100,
      nameScore: Math.round(nameScore * 100) / 100,
      meaningScore: Math.round(meaningScore * 100) / 100,
      symbolScore: 1.0,
      imageScore: 1.0,
      recommendation,
    };
  }
}
