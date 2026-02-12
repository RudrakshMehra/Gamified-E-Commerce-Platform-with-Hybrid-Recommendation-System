import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyA5rgjjEVau18-JiymELmFRg509n5Fqho8",
  authDomain: "smart-health-4b69f.firebaseapp.com",
  projectId: "smart-health-4b69f",
  storageBucket: "smart-health-4b69f.appspot.com",
  messagingSenderId: "949355323513",
  appId: "1:949355323513:web:d7612fd778792e09f334a8"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
