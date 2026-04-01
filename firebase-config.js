// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyDo9y8PSxuVJS8gXQ9xJQ_0wV0APqZWMrw",
  authDomain: "project-ame-56cb4.firebaseapp.com",
  projectId: "project-ame-56cb4",
  storageBucket: "project-ame-56cb4.firebasestorage.app",
  messagingSenderId: "706853534890",
  appId: "1:706853534890:web:e1b8060a08bcb9ef68e4d3",
  measurementId: "G-51FN2FGMQK"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
