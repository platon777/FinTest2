import { GoogleGenAI, Chat } from "@google/genai";
import { ChatMessage, Portfolio, Subscription, Transaction, Instrument, SubscriptionStatus } from '../types';

// This is a MOCKED service. In a real application, you would initialize and use the Gemini API here.
// const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
// const chat: Chat = ai.chats.create({ model: 'gemini-2.5-flash' });

const getAIResponse = (
    message: string,
    portfolio: Portfolio | null,
    subscriptions: Subscription[],
    transactions: Transaction[],
    instruments: Instrument[]
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
    if (lowerCaseMessage.includes('prochaine obligation') || lowerCaseMessage.includes('prochain investissement') && lowerCaseMessage.includes('maturité')) {
        if (!subscriptions || subscriptions.length === 0) {
            return { text: "Vous n'avez aucun investissement actif." };
        }

        const activeSubscriptions = subscriptions.filter(s => s.status === SubscriptionStatus.ACTIVE);
        if (activeSubscriptions.length === 0) {
            return { text: "Vous n'avez aucun investissement actif." };
        }

        const nextSubscription = activeSubscriptions.sort((a, b) => {
            const dateA = a.effectiveMaturityDate ? new Date(a.effectiveMaturityDate).getTime() : Infinity;
            const dateB = b.effectiveMaturityDate ? new Date(b.effectiveMaturityDate).getTime() : Infinity;
            return dateA - dateB;
        })[0];
        
        const instrument = instruments.find(i => i.instrumentId === nextSubscription.instrumentId);
        
        if (nextSubscription && instrument && nextSubscription.effectiveMaturityDate) {
            return {
                text: `Votre prochain investissement, "${instrument.name}", arrive à maturité le ${new Date(nextSubscription.effectiveMaturityDate).toLocaleDateString('fr-FR')}.`
            };
        }
        return { text: "Vous n'avez aucun investissement actif avec une date de maturité définie." };
    }
    if (lowerCaseMessage.includes('dernières transactions')) {
        if (!transactions || transactions.length === 0) {
            return { text: "Aucune transaction récente à afficher." };
        }
        const lastTx = transactions.slice(0, 3).map(tx => `- ${new Date(tx.creationDate).toLocaleDateString('fr-FR')}: ${tx.description} (${tx.amount.toLocaleString('fr-FR', { style: 'currency', currency: tx.currency })} - ${tx.status})`).join('\n');
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
    subscriptions: Subscription[],
    transactions: Transaction[],
    instruments: Instrument[]
): Promise<Partial<ChatMessage>> => {
  console.log("Sending to AI:", message);

  // In a real app, you would make the API call here:
  // const response = await chat.sendMessage({ message: `User query: "${message}"\n\nPortfolio data: ${JSON.stringify...}` });
  // const aiText = response.text;
  
  // For this demo, we simulate a delay and a canned response.
  return new Promise(resolve => {
    setTimeout(() => {
      resolve(getAIResponse(message, portfolio, subscriptions, transactions, instruments));
    }, 1500);
  });
};
