import React, { createContext, useContext, useState, ReactNode } from 'react';
import { TestProfile, TestAttempt, TestAnswer } from '../types';

interface TestContextType {
  saveTestAttempt: (attempt: TestAttempt) => void;
  getTestProfile: (userId: string) => TestProfile | null;
  getCurrentAttempt: () => TestAttempt | null;
  updateCurrentAttempt: (answers: TestAnswer[]) => void;
  startNewAttempt: (userId: string, courseId: string) => void;
}

const TestContext = createContext<TestContextType | undefined>(undefined);

export const TestProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [currentAttempt, setCurrentAttempt] = useState<TestAttempt | null>(null);
  const [testProfiles, setTestProfiles] = useState<Record<string, TestProfile>>({});

  const saveTestAttempt = (attempt: TestAttempt) => {
    const userId = attempt.userId;
    const profile = testProfiles[userId] || {
      userId,
      attempts: [],
      totalAttempts: 0,
      averageScore: 0
    };

    // Add the new attempt
    profile.attempts.push(attempt);
    profile.totalAttempts += 1;
    profile.lastAttemptDate = new Date();

    // Calculate new average score
    const totalScore = profile.attempts.reduce((sum, att) => sum + (att.score / att.maxScore) * 100, 0);
    profile.averageScore = totalScore / profile.totalAttempts;

    // Update profiles
    setTestProfiles({
      ...testProfiles,
      [userId]: profile
    });

    // Clear current attempt
    setCurrentAttempt(null);

    // In a real app, you would save this to a database
    localStorage.setItem('testProfiles', JSON.stringify(testProfiles));
  };

  const getTestProfile = (userId: string): TestProfile | null => {
    return testProfiles[userId] || null;
  };

  const getCurrentAttempt = (): TestAttempt | null => {
    return currentAttempt;
  };

  const updateCurrentAttempt = (answers: TestAnswer[]) => {
    if (currentAttempt) {
      setCurrentAttempt({
        ...currentAttempt,
        answers
      });
    }
  };

  const startNewAttempt = (userId: string, courseId: string) => {
    const newAttempt: TestAttempt = {
      id: Math.random().toString(36).substr(2, 9),
      userId,
      courseId,
      startTime: new Date(),
      endTime: new Date(),
      totalTime: 0,
      answers: [],
      score: 0,
      maxScore: 0,
      completed: false
    };
    setCurrentAttempt(newAttempt);
  };

  return (
    <TestContext.Provider value={{
      saveTestAttempt,
      getTestProfile,
      getCurrentAttempt,
      updateCurrentAttempt,
      startNewAttempt
    }}>
      {children}
    </TestContext.Provider>
  );
};

export const useTest = () => {
  const context = useContext(TestContext);
  if (context === undefined) {
    throw new Error('useTest must be used within a TestProvider');
  }
  return context;
};