import { Question } from '../../types';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../../firebaseConfig';

// Function to transform Firestore data to Question type
const transformFirestoreData = (doc: any): Question => {
  const data = doc.data();
  return {
    id: data.id,
    text: data.question,
    options: [data.option1, data.option2, data.option3, data.option4],
    correctAnswer: data.answer, // Keep as string
  };
};

// Function to fetch questions for a specific course
const fetchQuestions = async (courseType: string): Promise<Question[]> => {
  const q = query(
    collection(db, "questions"),
    where("course", "==", courseType)
  );

  try {
    const querySnapshot = await getDocs(q);
    const questions = querySnapshot.docs.map(doc => transformFirestoreData(doc));
    return questions.sort((a, b) => a.id - b.id); // Sort by question ID
  } catch (error) {
    console.error(`Error fetching ${courseType} questions:`, error);
    return [];
  }
};

// Cache for storing fetched questions
let questionsCache: Record<string, Question[]> = {};

// Function to get questions with caching
export const getQuestions = async (courseId: string): Promise<Question[]> => {
  // If questions are already in cache, return them
  if (questionsCache[courseId]) {
    return questionsCache[courseId];
  }

  // Map courseId to Firestore course type
  const courseTypeMap: Record<string, string> = {
    'csevbm': 'CSEVBM',
    'green-chemistry': 'SGCEV',
    'ev-battery-management': 'EVBM',
    'organic-food': 'OFP',
    'food-analysis': 'FAPP'
  };

  const courseType = courseTypeMap[courseId];
  if (!courseType) {
    console.error(`Invalid course ID: ${courseId}`);
    return [];
  }

  // Fetch questions and store in cache
  const questions = await fetchQuestions(courseType);
  questionsCache[courseId] = questions;
  return questions;
};

// Default export for backward compatibility
const QuizQuestions: Record<string, Question[]> = {};
export default QuizQuestions;