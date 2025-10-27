
import React, { useState } from 'react';
import Card from '../components/Card';

const NewOrderPage: React.FC = () => {
    const [investmentType, setInvestmentType] = useState('obligations');
    const [amount, setAmount] = useState('');
    const [executionDate, setExecutionDate] = useState('');
    const [notes, setNotes] = useState('');
    const [showConfirmation, setShowConfirmation] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        // Simulate API call
        setTimeout(() => {
            console.log({
                investmentType,
                amount,
                executionDate,
                notes,
            });
            setIsSubmitting(false);
            setShowConfirmation(true);
            // Reset form
            setInvestmentType('obligations');
            setAmount('');
            setExecutionDate('');
            setNotes('');
        }, 1500);
    };

    return (
        <div className="max-w-2xl mx-auto">
            <h1 className="text-3xl font-bold text-gray-800 mb-6">Passer un nouvel ordre</h1>
            <Card>
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label htmlFor="investmentType" className="block text-sm font-medium text-gray-700">Type d'investissement</label>
                        <select
                            id="investmentType"
                            value={investmentType}
                            onChange={(e) => setInvestmentType(e.target.value)}
                            className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                        >
                            <option value="obligations">Obligations</option>
                            <option value="sp500">Fonds S&P 500</option>
                            <option value="actions">Actions individuelles</option>
                        </select>
                    </div>
                    <div>
                        <label htmlFor="amount" className="block text-sm font-medium text-gray-700">Montant à investir (USD)</label>
                        <input
                            type="number"
                            id="amount"
                            value={amount}
                            onChange={(e) => setAmount(e.target.value)}
                            required
                            min="100"
                            className="mt-1 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                            placeholder="ex: 5000"
                        />
                    </div>
                    <div>
                        <label htmlFor="executionDate" className="block text-sm font-medium text-gray-700">Date d'exécution souhaitée</label>
                        <input
                            type="date"
                            id="executionDate"
                            value={executionDate}
                            onChange={(e) => setExecutionDate(e.target.value)}
                            required
                            min={new Date().toISOString().split("T")[0]}
                            className="mt-1 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
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
                            disabled={isSubmitting}
                            className="inline-flex justify-center py-2 px-6 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-800 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-blue-400"
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
                        <h3 className="text-lg leading-6 font-medium text-gray-900 mt-4">Ordre transmis avec succès !</h3>
                        <div className="mt-2 px-7 py-3">
                            <p className="text-sm text-gray-500">
                                Votre ordre a été transmis au conseiller et au back office. Vous serez notifié lorsque l'ordre sera exécuté.
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
