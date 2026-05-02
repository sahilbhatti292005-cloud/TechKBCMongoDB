import { initializeApp } from "firebase/app";
import { getDatabase, ref, get } from "firebase/database";

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
const db = getDatabase(app);

async function check() {
  const snapshot = await get(ref(db, 'gameState'));
  console.log(JSON.stringify(snapshot.val(), null, 2));
  process.exit(0);
}

check();
