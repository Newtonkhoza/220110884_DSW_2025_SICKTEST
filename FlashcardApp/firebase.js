import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

// Your Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCExGJjsj5sycygD8gP96oz-MGtDU5yqyQ",
  authDomain: "sicktest-aaefb.firebaseapp.com",
  projectId: "sicktest-aaefb",
  storageBucket: "sicktest-aaefb.firebasestorage.app",
  messagingSenderId: "215182803210",
  appId: "1:215182803210:web:84c59becc597e0868ffaf3",
  measurementId: "G-N908GV2K1N"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
export const db = getFirestore(app);
export const auth = getAuth(app);

export default app;