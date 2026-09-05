import { db } from "../config/firebase";
import {
  collection,
  addDoc,
  onSnapshot,
  query,
  orderBy,
  serverTimestamp,
} from "firebase/firestore";

export function getChatCollectionRef(conversationId) {
  return collection(db, "chats", conversationId, "messages");
}

export async function saveMessageToFirestore(conversationId, messageData) {
  const colRef = getChatCollectionRef(conversationId);
  return addDoc(colRef, {
    ...messageData,
    createdAt: serverTimestamp(),
  });
}

export function subscribeToMessages(conversationId, callback) {
  const colRef = getChatCollectionRef(conversationId);
  const q = query(colRef, orderBy("createdAt", "asc"));
  return onSnapshot(q, (snapshot) => {
    const messages = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    callback(messages);
  });
}

