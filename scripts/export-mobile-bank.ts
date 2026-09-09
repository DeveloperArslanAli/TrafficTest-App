import * as fs from 'fs';
import * as path from 'path';

interface QuestionRaw {
  id: string;
  category: 'warning' | 'regulatory' | 'signals' | 'general';
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  questionText: string;
  imageUrls?: { standard: string };
  options: { id: string; text: string }[];
  correctOptionId: string;
  explanation: string;
}

const categoryMapping: Record<string, string> = {
  warning: 'WARNING',
  regulatory: 'REGULATORY',
  signals: 'SIGNAL',
  general: 'GENERAL',
};

const jsonPath = path.resolve(__dirname, '../shared/question-bank-800.json');
const rawQuestions: QuestionRaw[] = JSON.parse(fs.readFileSync(jsonPath, 'utf-8'));

const mobileQuestions = rawQuestions.map((q) => {
  const optionTexts = q.options.map((opt) => opt.text);
  const correctIdx = q.options.findIndex((opt) => opt.id === q.correctOptionId);

  // Extract sign code if standard image key exists
  let signCode: string | undefined = undefined;
  if (q.imageUrls?.standard) {
    const filename = q.imageUrls.standard.split('/').pop()?.replace('.webp', '') || '';
    if (filename.includes('curve_right')) signCode = 'CURVE_RIGHT';
    else if (filename.includes('curve_left')) signCode = 'CURVE_LEFT';
    else if (filename.includes('stop_sign')) signCode = 'STOP_SIGN';
    else if (filename.includes('yield_sign')) signCode = 'YIELD_SIGN';
    else if (filename.includes('flashing_yellow')) signCode = 'TRAFFIC_LIGHT_YELLOW';
    else if (filename.includes('green_arrow')) signCode = 'TRAFFIC_LIGHT_GREEN_ARROW';
    else if (filename.includes('pedestrian')) signCode = 'PEDESTRIAN_CROSSING';
    else if (filename.includes('slippery')) signCode = 'SLIPPERY_ROAD';
    else if (filename.includes('speed_limit_50')) signCode = 'SPEED_LIMIT_50';
    else if (filename.includes('do_not_enter')) signCode = 'NO_ENTRY';
  }

  return {
    id: q.id,
    category: categoryMapping[q.category] || 'GENERAL',
    text: q.questionText,
    imageUrl: q.imageUrls?.standard || undefined,
    signCode: signCode || undefined,
    options: optionTexts,
    correctIndex: correctIdx >= 0 ? correctIdx : 0,
    explanation: q.explanation || undefined,
  };
});

const mobileOutPath = path.resolve(__dirname, '../mobile/src/utils/fullBank.json');
fs.writeFileSync(mobileOutPath, JSON.stringify(mobileQuestions, null, 2), 'utf-8');
console.log(`✅ Converted and wrote ${mobileQuestions.length} questions to ${mobileOutPath}`);
