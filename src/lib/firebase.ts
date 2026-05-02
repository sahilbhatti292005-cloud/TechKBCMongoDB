import { initializeApp } from "firebase/app";
import { getDatabase, ref, onValue } from "firebase/database";

const firebaseConfig = {
  apiKey: "AIzaSyA5Sb4fb93ABrCCn1MLsciUtkOzYFramjI",
  authDomain: "techkbc-d2cd8.firebaseapp.com",
  projectId: "techkbc-d2cd8",
  databaseURL: "https://techkbc-d2cd8-default-rtdb.firebaseio.com",
  storageBucket: "techkbc-d2cd8.firebasestorage.app",
  messagingSenderId: "102145872481",
  appId: "1:102145872481:web:20632c0ae4ab45d62f5020",
  measurementId: "G-44W7L653KZ"
};

const app = initializeApp(firebaseConfig);
export const db = getDatabase(app);

let serverTimeOffset = 0;
const offsetRef = ref(db, ".info/serverTimeOffset");
onValue(offsetRef, (snap) => {
  serverTimeOffset = snap.val() || 0;
});

export const getServerTime = () => Date.now() + serverTimeOffset;
