// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyAioidH1IyJJPtQpLrbAzllvZ-BQbgJ0xQ",
  authDomain: "tax-genie-f1840.firebaseapp.com",
  projectId: "tax-genie-f1840",
  storageBucket: "tax-genie-f1840.appspot.com",
  messagingSenderId: "370816786830",
  appId: "1:370816786830:web:c17d7ccdf713f6406f84df",
  measurementId: "G-J6YZ72F1FC"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);