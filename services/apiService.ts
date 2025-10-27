import { mockDatabase } from '../data/mock';
import { User, Portfolio, Subscription, Transaction, ClientAccount, Instrument } from '../types';

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

export const getSubscriptions = (accountId: string): Promise<Subscription[]> => {
    return new Promise(resolve => {
        setTimeout(() => {
            const data = mockDatabase[accountId];
            resolve(data ? data.subscriptions : []);
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

export const getAccounts = (accountId: string): Promise<ClientAccount[]> => {
    return new Promise(resolve => {
        setTimeout(() => {
            const data = mockDatabase[accountId];
            resolve(data ? data.accounts : []);
        }, API_DELAY);
    });
};

export const getInstruments = (accountId: string): Promise<Instrument[]> => {
    return new Promise(resolve => {
        setTimeout(() => {
            // In a real app, this would likely be a global endpoint, 
            // but we fetch it per-user here for simplicity with the mock structure.
            const data = mockDatabase[accountId];
            resolve(data ? data.instruments : []);
        }, API_DELAY);
    });
};
