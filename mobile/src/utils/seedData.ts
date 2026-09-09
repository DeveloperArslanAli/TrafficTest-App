import type { Question } from '../types';
import fullBankData from './fullBank.json';

export const INITIAL_QUESTION_BANK: Question[] = fullBankData as unknown as Question[];
