import { initializeApp } from "firebase/app";
import { config } from "./config";
import { addDoc, collection, getFirestore } from 'firebase/firestore/lite'

const firebaseConfig = {
  apiKey: config.FIREBASE_API_KEY,
  authDomain: "typescript-discord-bot.firebaseapp.com",
  projectId: "typescript-discord-bot",
  storageBucket: "typescript-discord-bot.appspot.com",
  messagingSenderId: config.FIREBASE_MESSAGING_SENDER_ID,
  appId: config.FIREBASE_APP_ID
};


const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export async function createTicket(threadId: string, text: string) {
    try {
        await addDoc(collection(db, 'tickets'), {
            threadId,
            text,
            openedAt: Date()
        })
    }
    catch(error) {
        console.error("Error adding document", error);
    }
}