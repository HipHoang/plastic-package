import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyDO6bPPWCFYu0oxcjDkkjlJNrGqXxX1vBA",
  authDomain: "test-iot-f4c0d.firebaseapp.com",
  databaseURL: "https://test-iot-f4c0d-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "test-iot-f4c0d",
  storageBucket: "test-iot-f4c0d.firebasestorage.app",
  messagingSenderId: "912199020004",
  appId: "1:912199020004:web:46912085d4c0a60452abf1",
  measurementId: "G-YHFRXNEBZ1"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);

