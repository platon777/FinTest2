import React, { useState, useMemo } from 'react';
import Card from '../components/Card';
import { useAuth } from '../hooks/useAuth';
import { InstrumentStatus } from '../types';

const NewOrderPage: React.FC = () => {
    const { instruments, accounts, isLoadingData } = useAuth();
    
    const [selectedInstrumentId, setSelectedInstrumentId] = useState('');
    const [selectedAccountId, setSelectedAccountId] = useState('');
    const [amount, setAmount] = useState('');
    const [notes, setNotes] = useState('');
    const [showConfirmation, setShowConfirmation] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    
    const availableInstruments = useMemo(() => {
        return instruments.filter(inst => inst.status === InstrumentStatus.AVAILABLE);
    }, [instruments]);

    const investmentAccounts = useMemo(() => {
        return accounts.filter(acc => acc.accountType === 'INVESTISSEMENT');
    }, [accounts]);

    const selectedInstrument = instruments.find(i => i.instrumentId === parseInt(selectedInstrumentId));

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        // Simulate API call to create a SUBSCRIPTION transaction
        setTimeout(() => {
            console.log({
                instrumentId: selectedInstrumentId,
                accountId: selectedAccountId,
                amount: parseFloat(amount),
                notes,
            });
            setIsSubmitting(false);
            setShowConfirmation(true);
            // Reset form
            setSelectedInstrumentId('');
            setSelectedAccountId('');
            setAmount('');
            setNotes('');
        }, 1500);
    };

    if (isLoadingData) {
        return (
            <div className="max-w-2xl mx-auto">
                <div className="h-8 bg-gray-200 rounded w-1/2 mb-6 animate-pulse"></div>
                <div className="bg-white p-6 rounded-lg shadow-md space-y-6 animate-pulse">
                    {[...Array(4)].map((_, i) => (
                        <div key={i}>
                            <div className="h-4 bg-gray-200 rounded w-1/4 mb-2"></div>
                            <div className="h-10 bg-gray-200 rounded"></div>
                        </div>
                    ))}
                    <div className="flex justify-end">
                        <div className="h-10 bg-gray-200 rounded w-32"></div>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="max-w-2xl mx-auto">
            <h1 className="text-3xl font-bold text-gray-800 mb-6">Passer un nouvel ordre de souscription</h1>
            <Card>
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label htmlFor="investmentAccount" className="block text-sm font-medium text-gray-700">Compte d'investissement source</label>
                        <select
                            id="investmentAccount"
                            value={selectedAccountId}
                            onChange={(e) => setSelectedAccountId(e.target.value)}
                            required
                            className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                        >
                            <option value="" disabled>Sélectionner un compte</option>
                            {investmentAccounts.map(acc => (
                                <option key={acc.accountId} value={acc.accountId}>
                                    {acc.accountNumber} ({acc.availableBalance.toLocaleString('fr-FR', {style: 'currency', currency: acc.currency})})
                                </option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label htmlFor="instrument" className="block text-sm font-medium text-gray-700">Instrument financier</label>
                        <select
                            id="instrument"
                            value={selectedInstrumentId}
                            onChange={(e) => setSelectedInstrumentId(e.target.value)}
                            required
                            className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                        >
                            <option value="" disabled>Sélectionner un instrument</option>
                            {availableInstruments.map(inst => (
                                <option key={inst.instrumentId} value={inst.instrumentId}>
                                    {inst.name} ({inst.annualYieldRate}% - Min: {inst.minInvestment} {inst.currency})
                                </option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label htmlFor="amount" className="block text-sm font-medium text-gray-700">Montant à investir ({selectedInstrument?.currency || 'USD'})</label>
                        <input
                            type="number"
                            id="amount"
                            value={amount}
                            onChange={(e) => setAmount(e.target.value)}
                            required
                            min={selectedInstrument?.minInvestment || 0}
                            className="mt-1 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                            placeholder={`ex: ${selectedInstrument?.minInvestment || '5000'}`}
                        />
                    </div>
                    
                    <div>
                        <label htmlFor="notes" className="block text-sm font-medium text-gray-700">Notes additionnelles</label>
                        <textarea
                            id="notes"
                            rows={4}
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            className="mt-1 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                            placeholder="Instructions spécifiques pour votre conseiller..."
                        />
                    </div>
                    <div className="text-right">
                        <button
                            type="submit"
                            disabled={isSubmitting || !selectedAccountId || !selectedInstrumentId}
                            className="inline-flex justify-center py-2 px-6 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-800 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-gray-400"
                        >
                            {isSubmitting ? 'Soumission...' : "Soumettre l'ordre"}
                        </button>
                    </div>
                </form>
            </Card>

            {showConfirmation && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white p-8 rounded-lg shadow-xl text-center max-w-sm">
                        <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100">
                             <svg className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                            </svg>
                        </div>
                        <h3 className="text-lg leading-6 font-medium text-gray-900 mt-4">Ordre de souscription transmis !</h3>
                        <div className="mt-2 px-7 py-3">
                            <p className="text-sm text-gray-500">
                                Votre ordre a été transmis pour validation. Vous pouvez suivre son statut dans la page des transactions.
                            </p>
                        </div>
                        <div className="items-center px-4 py-3">
                            <button
                                onClick={() => setShowConfirmation(false)}
                                className="px-4 py-2 bg-blue-800 text-white text-base font-medium rounded-md w-full shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                Fermer
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default NewOrderPage;
