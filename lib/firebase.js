// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBDP7q5VHsfOM0DEw5B6qOaXeoeVAe6dcA",
  authDomain: "birthday-quiz-270698.firebaseapp.com",
  projectId: "birthday-quiz-270698",
  storageBucket: "birthday-quiz-270698.firebasestorage.app",
  messagingSenderId: "516739963095",
  appId: "1:516739963095:web:40ed6b38ec213ebfdc3892",
  measurementId: "G-LMPP1LH7E5"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
