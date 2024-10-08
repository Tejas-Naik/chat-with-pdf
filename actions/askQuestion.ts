"use server";

import { Message } from "@/components/Chat";
import { adminDb } from "@/firebaseAdmin";
import { generateLangchainCompletion } from "@/lib/langchain";
import { auth } from "@clerk/nextjs/server";
// import {generateLangchainCompletion} from "@/lib/langchain"

const FREE_LIMIT = 3
const PRO_LIMIT = 100

// export async function askQuestion(id: string, question: string) {
//     auth().protect();
//     const {userId} = await auth();

//     const chatRef = adminDb
//         .collection("users")
//         .doc(userId!)
//         .collection("files")
//         .doc(id)
//         .collection("chat")

//     // Check how many user messages are there in the chat
//     const chatSnapshot = await chatRef.get();
//     const userMessages = chatSnapshot.docs.filter(
//         (doc) => doc.data().role === "human"
//     );

//     // TODO: Limit the PRO/FREE users

//     const userMessage: Message = {
//         role: 'human',
//         message: question,
//         createdAt: new Date(),
//     }

//     await chatRef.add(userMessage)

//     // Generate AI Response to question
//     const reply= await generateLangchainCompletion(id, question)

//         const aiMessage: Message = {
//         role: 'ai',
//         message: reply,
//         createdAt: new Date(),
//     }

//     await chatRef.add(aiMessage);

//     return {success: true, message: null}
// }
export async function askQuestion(id: string, question: string) {
  auth().protect();

  const { userId } = await auth();

  const chatRef = adminDb
    .collection("users")
    .doc(userId!)
    .collection("files")
    .doc(id)
    .collection("chat");

  // Check how many user messages are there in the chat
  const chatSnapshot = await chatRef.get();
  const userMessages = chatSnapshot.docs.filter(
    (doc) => doc.data().role === "human"
  );

  // TODO: Limit the PRO/FREE users

  const userMessage: Message = {
    role: "human",
    message: question,
    createdAt: new Date(),
  };

  await chatRef.add(userMessage);

  // Generate AI Response to question
  let reply;
  try {
    reply = await generateLangchainCompletion(id, question);
  } catch (error) {
    console.error("Error generating LangChain completion:", error);
    return { success: false, message: "Failed to generate response" };
  }

  if (!reply) {
    console.error("generateLangchainCompletion returned undefined");
    return { success: false, message: "Failed to generate response" };
  }

  const aiMessage: Message = {
    role: "ai",
    message: reply,
    createdAt: new Date(),
  };

  await chatRef.add(aiMessage);

  return { success: true, message: null };
}