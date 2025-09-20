// src/lib/firebase.ts
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, addDoc, getDocs, doc, updateDoc, deleteDoc, query, orderBy } from 'firebase/firestore';


const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);

// Collection names
export const COLLECTIONS = {
  QUESTIONS: 'tcf-questions',
  SESSIONS: 'tcf-sessions'
};

// Types
export interface Question {
  id: string;
  type: 'writing' | 'audio';
  title: string;
  content: string;
  imageUrl?: string;
  timeLimit: number;
  wordLimit?: number;
  subtasks?: Array<{
    id: number;
    title: string;
    instruction: string;
    suggestedWordCount?: string;
    imageUrl?: string;
  }>;
  createdAt: string;
}

export interface StudentSession {
  id?: string;
  studentName: string;
  questionId: string;
  questionTitle: string;
  questionType: 'writing' | 'audio';
  subtasks?: Array<{
    id: number;
    title: string;
    response: string;
    wordCount: number;
    isCompleted: boolean;
  }>;
  audioResponse?: string;
  totalWordCount?: number;
  timeUsed: number;
  timeLimit: number;
  completedAt: string;
}

// Database operations with localStorage fallback
export const dbOperations = {


async saveQuestion(questionData: Omit<Question, 'id' | 'createdAt'>): Promise<string> {
  console.log('🔥 Attempting to save question to Firebase:', questionData);
  
  try {
    // Clean the data - remove undefined values
    const cleanData = {
      type: questionData.type,
      title: questionData.title,
      content: questionData.content,
      timeLimit: questionData.timeLimit,
      createdAt: new Date().toISOString(),
      ...(questionData.imageUrl && { imageUrl: questionData.imageUrl }),
      ...(questionData.wordLimit && { wordLimit: questionData.wordLimit }),
      ...(questionData.subtasks && { subtasks: questionData.subtasks })
    };
    
    console.log('🔥 Cleaned data being sent to Firebase:', cleanData);
    
    const docRef = await addDoc(collection(db, COLLECTIONS.QUESTIONS), cleanData);
    console.log('✅ Firebase save SUCCESS! Document ID:', docRef.id);
    return docRef.id;
  } catch (error) {
    console.error('❌ Firebase save FAILED:', error);
    console.warn('Falling back to localStorage');
    
    // Fallback to localStorage
    const questions = JSON.parse(localStorage.getItem('tcf-questions') || '[]');
    const newQuestion = {
      ...questionData,
      id: Date.now().toString(),
      createdAt: new Date().toISOString()
    };
    questions.push(newQuestion);
    localStorage.setItem('tcf-questions', JSON.stringify(questions));
    return newQuestion.id;
  }
},

  async getQuestions(): Promise<Question[]> {
    try {
      const q = query(collection(db, COLLECTIONS.QUESTIONS), orderBy('createdAt', 'desc'));
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as Question));
    } catch (error) {
      console.warn('Firebase error, using localStorage:', error);
      return JSON.parse(localStorage.getItem('tcf-questions') || '[]');
    }
  },

  // async updateQuestion(id: string, questionData: Partial<Question>): Promise<void> {
  //   try {
  //     await updateDoc(doc(db, COLLECTIONS.QUESTIONS, id), questionData);
  //   } catch (error) {
  //     console.warn('Firebase error, using localStorage:', error);
  //     const questions = JSON.parse(localStorage.getItem('tcf-questions') || '[]');
  //     const index = questions.findIndex((q: Question) => q.id === id);
  //     if (index !== -1) {
  //       questions[index] = { ...questions[index], ...questionData };
  //       localStorage.setItem('tcf-questions', JSON.stringify(questions));
  //     }
  //   }
  // },


  async updateQuestion(id: string, questionData: Partial<Question>): Promise<void> {
  console.log('🔥 Attempting to update question:', id, questionData);
  
  try {
    // Clean the update data - remove undefined values
    const cleanUpdateData: any = {};
    
    if (questionData.type !== undefined) cleanUpdateData.type = questionData.type;
    if (questionData.title !== undefined) cleanUpdateData.title = questionData.title;
    if (questionData.content !== undefined) cleanUpdateData.content = questionData.content;
    if (questionData.timeLimit !== undefined) cleanUpdateData.timeLimit = questionData.timeLimit;
    if (questionData.imageUrl !== undefined && questionData.imageUrl !== '') {
      cleanUpdateData.imageUrl = questionData.imageUrl;
    }
    if (questionData.wordLimit !== undefined && questionData.wordLimit !== null) {
      cleanUpdateData.wordLimit = questionData.wordLimit;
    }
    if (questionData.subtasks !== undefined && questionData.subtasks !== null) {
      cleanUpdateData.subtasks = questionData.subtasks;
    }
    
    console.log('🔥 Cleaned update data:', cleanUpdateData);
    
    await updateDoc(doc(db, COLLECTIONS.QUESTIONS, id), cleanUpdateData);
    console.log('✅ Firebase update SUCCESS!');
  } catch (error) {
    console.error('❌ Firebase update FAILED:', error);
    console.warn('Firebase error, using localStorage:', error);
    
    const questions = JSON.parse(localStorage.getItem('tcf-questions') || '[]');
    const index = questions.findIndex((q: Question) => q.id === id);
    if (index !== -1) {
      questions[index] = { ...questions[index], ...questionData };
      localStorage.setItem('tcf-questions', JSON.stringify(questions));
    }
  }
},




  async deleteQuestion(id: string): Promise<void> {
    try {
      await deleteDoc(doc(db, COLLECTIONS.QUESTIONS, id));
    } catch (error) {
      console.warn('Firebase error, using localStorage:', error);
      const questions = JSON.parse(localStorage.getItem('tcf-questions') || '[]');
      const filtered = questions.filter((q: Question) => q.id !== id);
      localStorage.setItem('tcf-questions', JSON.stringify(filtered));
    }
  },

  // Sessions
  async saveSession(sessionData: Omit<StudentSession, 'id'>): Promise<string> {
    try {
      const docRef = await addDoc(collection(db, COLLECTIONS.SESSIONS), {
        ...sessionData,
        completedAt: new Date().toISOString()
      });
      return docRef.id;
    } catch (error) {
      console.warn('Firebase error, using localStorage:', error);
      const sessions = JSON.parse(localStorage.getItem('tcf-sessions') || '[]');
      const newSession = {
        ...sessionData,
        id: Date.now().toString(),
        completedAt: new Date().toISOString()
      };
      sessions.push(newSession);
      localStorage.setItem('tcf-sessions', JSON.stringify(sessions));
      return newSession.id;
    }
  },

  async getSessions(): Promise<StudentSession[]> {
    try {
      const q = query(collection(db, COLLECTIONS.SESSIONS), orderBy('completedAt', 'desc'));
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as StudentSession));
    } catch (error) {
      console.warn('Firebase error, using localStorage:', error);
      return JSON.parse(localStorage.getItem('tcf-sessions') || '[]');
    }
  }
};