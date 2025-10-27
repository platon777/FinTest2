import { mockDatabase } from '../data/mock';
import { User, Portfolio, Bond, Transaction } from '../types';

const API_DELAY = 300; // ms

// This service simulates API calls.
// In a real application, you would replace the logic here with actual API fetches.

export const getUserData = (accountId: string): Promise<User | null> => {
    return new Promise(resolve => {
        setTimeout(() => {
            const data = mockDatabase[accountId];
            resolve(data ? data.user : null);
        }, API_DELAY);
    });
};

export const getPortfolio = (accountId: string): Promise<Portfolio | null> => {
    return new Promise(resolve => {
        setTimeout(() => {
            const data = mockDatabase[accountId];
            resolve(data ? data.portfolio : null);
        }, API_DELAY);
    });
};

export const getBonds = (accountId: string): Promise<Bond[]> => {
    return new Promise(resolve => {
        setTimeout(() => {
            const data = mockDatabase[accountId];
            resolve(data ? data.bonds : []);
        }, API_DELAY);
    });
};

export const getTransactions = (accountId: string): Promise<Transaction[]> => {
    return new Promise(resolve => {
        setTimeout(() => {
            const data = mockDatabase[accountId];
            resolve(data ? data.transactions : []);
        }, API_DELAY);
    });
};
