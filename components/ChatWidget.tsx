import React, { useState, useRef, useEffect } from 'react';
import { MessageSquareIcon, XIcon, SendIcon, RefreshCwIcon } from './icons';
import { ChatMessage } from '../types';
import { sendMessageToAI } from '../services/geminiService';

const initialMessages: ChatMessage[] = [
    {
        id: 1,
        text: "Bonjour! Je suis Profin, votre assistant IA. Comment puis-je vous aider aujourd'hui?",
        sender: 'ai',
        suggestions: [
            "Quel est mon solde actuel ?",
            "Quand ma prochaine obligation arrive à maturité ?",
            "Montrez-moi mes dernières transactions",
            "Quel est mon rendement total ?",
        ],
    },
];

const ChatWidget: React.FC = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState<ChatMessage[]>(initialMessages);
    const [inputValue, setInputValue] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(scrollToBottom, [messages]);

    const handleSendMessage = async (text?: string) => {
        const messageText = text || inputValue;
        if (messageText.trim() === '' || isLoading) return;

        const newUserMessage: ChatMessage = {
            id: Date.now(),
            text: messageText,
            sender: 'user',
        };
        setMessages(prev => [...prev, newUserMessage]);
        setInputValue('');
        setIsLoading(true);

        const aiResponse = await sendMessageToAI(messageText);

        const newAiMessage: ChatMessage = {
            id: Date.now() + 1,
            text: aiResponse.text || "Désolé, une erreur est survenue.",
            sender: 'ai',
        };
        setMessages(prev => [...prev, newAiMessage]);
        setIsLoading(false);
    };

    const handleNewConversation = () => {
        setMessages(initialMessages);
    };
    
    const handleSuggestionClick = (suggestion: string) => {
        handleSendMessage(suggestion);
    };

    return (
        <>
            {!isOpen && (
                <div className="fixed bottom-6 right-6 z-40">
                    <button
                        onClick={() => setIsOpen(true)}
                        className="bg-blue-800 text-white rounded-full p-4 shadow-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-transform hover:scale-110"
                        aria-label="Ouvrir le chat"
                    >
                        <MessageSquareIcon className="w-6 h-6" />
                    </button>
                </div>
            )}
            {isOpen && (
                <div className="fixed bottom-4 right-4 left-4 h-[75vh] rounded-lg bg-white shadow-xl flex flex-col z-50 animate-fade-in-up sm:left-auto sm:bottom-24 sm:right-6 sm:w-full sm:max-w-sm sm:h-[60vh]">
                    <header className="bg-blue-800 text-white p-4 flex justify-between items-center rounded-t-lg">
                        <div>
                            <h3 className="font-bold">Assistant Profin</h3>
                            <p className="text-xs text-blue-200">En ligne</p>
                        </div>
                        <div className="flex items-center space-x-2">
                            <button onClick={handleNewConversation} className="p-1 rounded-full hover:bg-blue-700" title="Nouvelle conversation">
                                <RefreshCwIcon className="w-4 h-4" />
                            </button>
                            <button onClick={() => setIsOpen(false)} className="p-1 rounded-full hover:bg-blue-700" title="Fermer">
                                <XIcon className="w-5 h-5" />
                            </button>
                        </div>
                    </header>
                    <div className="flex-1 p-4 overflow-y-auto bg-gray-50">
                        {messages.map(msg => (
                            <div key={msg.id} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'} mb-4`}>
                                <div className={`max-w-xs px-4 py-2 rounded-lg ${msg.sender === 'user' ? 'bg-blue-500 text-white rounded-br-none' : 'bg-gray-200 text-gray-800 rounded-bl-none'}`}>
                                    <p className="text-sm whitespace-pre-wrap">{msg.text}</p>
                                    {msg.sender === 'ai' && msg.suggestions && (
                                        <div className="mt-2 flex flex-wrap gap-2">
                                            {msg.suggestions.map((s, i) => (
                                                <button key={i} onClick={() => handleSuggestionClick(s)} className="text-xs bg-white border border-blue-500 text-blue-500 px-2 py-1 rounded-full hover:bg-blue-100">
                                                    {s}
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                        {isLoading && (
                             <div className="flex justify-start mb-4">
                                <div className="max-w-xs px-4 py-2 rounded-lg bg-gray-200 text-gray-800 rounded-bl-none">
                                    <div className="flex items-center space-x-2">
                                        <span className="text-sm">L'assistant écrit...</span>
                                        <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                                        <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse delay-150"></div>
                                        <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse delay-300"></div>
                                    </div>
                                </div>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>
                     <footer className="p-4 border-t border-gray-200 bg-white rounded-b-lg">
                        <div className="text-xs text-gray-400 mb-2 p-2 bg-yellow-50 border border-yellow-200 rounded-md">
                            <p><strong>Disclaimer:</strong> L'assistant n'a accès qu'à vos données personnelles. Ne partagez jamais vos mots de passe ou informations sensibles.</p>
                        </div>
                        <div className="flex items-center">
                            <input
                                type="text"
                                value={inputValue}
                                onChange={(e) => setInputValue(e.target.value)}
                                onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                                placeholder="Posez votre question..."
                                className="flex-1 px-4 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500"
                                maxLength={280}
                            />
                            <button onClick={() => handleSendMessage()} disabled={isLoading || !inputValue} className="ml-2 bg-blue-800 text-white rounded-full p-3 hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors">
                                <SendIcon className="w-5 h-5" />
                            </button>
                        </div>
                    </footer>
                </div>
            )}
        </>
    );
};

export default ChatWidget;