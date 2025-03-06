import { Question } from '../../types';
import { greenChemistryQuestions } from './green-chemistry';
import { evBatteryQuestions } from './ev-battery';
import { organicFoodQuestions } from './organic-food';
import { foodAnalysisQuestions } from './food-analysis';
import { csevbmQuestions } from './csevbm';

const QuizQuestions: Record<string, Question[]> = {
  'green-chemistry': greenChemistryQuestions,
  'ev-battery-management': evBatteryQuestions,
  'organic-food': organicFoodQuestions,
  'food-analysis': foodAnalysisQuestions,
  'csevbm': csevbmQuestions
};

export default QuizQuestions;