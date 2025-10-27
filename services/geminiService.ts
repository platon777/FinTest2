
import { GoogleGenAI, Chat } from "@google/genai";
import { ChatMessage } from '../types';
import { mockPortfolio, mockBonds, mockTransactions } from '../data/mock';

// This is a MOCKED service. In a real application, you would initialize and use the Gemini API here.
// const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
// const chat: Chat = ai.chats.create({ model: 'gemini-2.5-flash' });

const getAIResponse = (message: string): Partial<ChatMessage> => {
    const lowerCaseMessage = message.toLowerCase();

    if (lowerCaseMessage.includes('solde actuel') || lowerCaseMessage.includes('valeur totale')) {
        return {
            text: `La valeur totale de votre portefeuille est de ${mockPortfolio.totalValue.toLocaleString('fr-FR', { style: 'currency', currency: 'USD' })}.`
        };
    }
    if (lowerCaseMessage.includes('prochaine obligation') && lowerCaseMessage.includes('maturité')) {
        const nextBond = [...mockBonds]
            .filter(b => b.status === 'Active')
            .sort((a, b) => new Date(a.maturityDate).getTime() - new Date(b.maturityDate).getTime())[0];
        if (nextBond) {
            return {
                text: `Votre prochaine obligation, "${nextBond.name}", arrive à maturité le ${new Date(nextBond.maturityDate).toLocaleDateString('fr-FR')}.`
            };
        }
        return { text: "Vous n'avez aucune obligation active arrivant à maturité." };
    }
    if (lowerCaseMessage.includes('dernières transactions')) {
        const lastTx = mockTransactions.slice(0, 3).map(tx => `- ${tx.date}: ${tx.description} (${tx.amount.toLocaleString('fr-FR', { style: 'currency', currency: 'USD' })} - ${tx.status})`).join('\n');
        return {
            text: `Voici vos 3 dernières transactions :\n${lastTx}`
        };
    }
    if (lowerCaseMessage.includes('rendement total')) {
        return {
            text: `Votre rendement total est de ${mockPortfolio.totalReturnPercentage}% ce qui correspond à ${mockPortfolio.totalReturnAmount.toLocaleString('fr-FR', { style: 'currency', currency: 'USD' })}.`
        };
    }
    return {
        text: "Je suis désolé, je ne peux pas répondre à cette question pour le moment. Vous pouvez essayer une des suggestions ci-dessous."
    };
};


export const sendMessageToAI = async (message: string): Promise<Partial<ChatMessage>> => {
  console.log("Sending to AI:", message);

  // In a real app, you would make the API call here:
  // const response = await chat.sendMessage({ message: `User query: "${message}"\n\nPortfolio data: ${JSON.stringify...}` });
  // const aiText = response.text;
  
  // For this demo, we simulate a delay and a canned response.
  return new Promise(resolve => {
    setTimeout(() => {
      resolve(getAIResponse(message));
    }, 1500);
  });
};
