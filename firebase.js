// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import {getFirestore} from 'firebase/firestore';
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyCmdlABR5QTCvTWf08CRiPEa9P1rdgbo5s",
  authDomain: "aiflash-f6177.firebaseapp.com",
  projectId: "aiflash-f6177",
  storageBucket: "aiflash-f6177.appspot.com",
  messagingSenderId: "698108221684",
  appId: "1:698108221684:web:8ad5adb6fd49da8be726a1",
  measurementId: "G-8Q7BZHRL8S"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app)

export {db}