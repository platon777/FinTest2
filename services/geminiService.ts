

import { GoogleGenAI, Chat } from "@google/genai";
import { ChatMessage, Portfolio, Bond, Transaction, BondStatus } from '../types';

// This is a MOCKED service. In a real application, you would initialize and use the Gemini API here.
// const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
// const chat: Chat = ai.chats.create({ model: 'gemini-2.5-flash' });

const getAIResponse = (
    message: string,
    portfolio: Portfolio | null,
    bonds: Bond[],
    transactions: Transaction[]
): Partial<ChatMessage> => {
    const lowerCaseMessage = message.toLowerCase();

    if (lowerCaseMessage.includes('solde actuel') || lowerCaseMessage.includes('valeur totale')) {
        if (!portfolio) {
            return { text: "Je n'ai pas pu récupérer les informations du portefeuille." };
        }
        return {
            text: `La valeur totale de votre portefeuille est de ${portfolio.totalValue.toLocaleString('fr-FR', { style: 'currency', currency: 'USD' })}.`
        };
    }
    if (lowerCaseMessage.includes('prochaine obligation') && lowerCaseMessage.includes('maturité')) {
        if (!bonds || bonds.length === 0) {
            return { text: "Vous n'avez aucune obligation active." };
        }
        const nextBond = [...bonds]
            .filter(b => b.status === BondStatus.ACTIVE)
            .sort((a, b) => new Date(a.maturityDate).getTime() - new Date(b.maturityDate).getTime())[0];
        if (nextBond) {
            return {
                text: `Votre prochaine obligation, "${nextBond.name}", arrive à maturité le ${new Date(nextBond.maturityDate).toLocaleDateString('fr-FR')}.`
            };
        }
        return { text: "Vous n'avez aucune obligation active arrivant à maturité." };
    }
    if (lowerCaseMessage.includes('dernières transactions')) {
        if (!transactions || transactions.length === 0) {
            return { text: "Aucune transaction récente à afficher." };
        }
        const lastTx = transactions.slice(0, 3).map(tx => `- ${new Date(tx.date).toLocaleDateString('fr-FR')}: ${tx.description} (${tx.amount.toLocaleString('fr-FR', { style: 'currency', currency: 'USD' })} - ${tx.status})`).join('\n');
        return {
            text: `Voici vos 3 dernières transactions :\n${lastTx}`
        };
    }
    if (lowerCaseMessage.includes('rendement total')) {
        if (!portfolio) {
            return { text: "Je n'ai pas pu récupérer les informations du portefeuille." };
        }
        return {
            text: `Votre rendement total est de ${portfolio.totalReturnPercentage}% ce qui correspond à ${portfolio.totalReturnAmount.toLocaleString('fr-FR', { style: 'currency', currency: 'USD' })}.`
        };
    }
    return {
        text: "Je suis désolé, je ne peux pas répondre à cette question pour le moment. Vous pouvez essayer une des suggestions ci-dessous."
    };
};


export const sendMessageToAI = async (
    message: string,
    portfolio: Portfolio | null,
    bonds: Bond[],
    transactions: Transaction[]
): Promise<Partial<ChatMessage>> => {
  console.log("Sending to AI:", message);

  // In a real app, you would make the API call here:
  // const response = await chat.sendMessage({ message: `User query: "${message}"\n\nPortfolio data: ${JSON.stringify...}` });
  // const aiText = response.text;
  
  // For this demo, we simulate a delay and a canned response.
  return new Promise(resolve => {
    setTimeout(() => {
      resolve(getAIResponse(message, portfolio, bonds, transactions));
    }, 1500);
  });
};