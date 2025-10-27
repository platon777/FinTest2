
import React, { useState, useMemo } from 'react';
import { mockTransactions } from '../data/mock';
import { Transaction, TransactionStatus, TransactionType } from '../types';
import Card from '../components/Card';

const getStatusBadgeColor = (status: TransactionStatus) => {
  switch (status) {
    case TransactionStatus.VALIDATED:
      return 'bg-green-100 text-green-800';
    case TransactionStatus.PENDING:
      return 'bg-yellow-100 text-yellow-800';
    case TransactionStatus.REJECTED:
      return 'bg-red-100 text-red-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

const ITEMS_PER_PAGE = 5;

const TransactionsPage: React.FC = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [filters, setFilters] = useState<{ type: 'all' | TransactionType, status: 'all' | TransactionStatus }>({ type: 'all', status: 'all' });
    const [currentPage, setCurrentPage] = useState(1);

    const filteredTransactions = useMemo(() => {
        return mockTransactions
            .filter(tx => searchTerm === '' || tx.description.toLowerCase().includes(searchTerm.toLowerCase()))
            .filter(tx => filters.type === 'all' || tx.type === filters.type)
            .filter(tx => filters.status === 'all' || tx.status === filters.status);
    }, [searchTerm, filters]);

    const totalPages = Math.ceil(filteredTransactions.length / ITEMS_PER_PAGE);
    const paginatedTransactions = filteredTransactions.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold text-gray-800">Historique des Transactions</h1>

            <Card>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <input
                        type="text"
                        placeholder="Rechercher par description..."
                        value={searchTerm}
                        onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
                        className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    />
                    <select
                        value={filters.type}
                        onChange={(e) => { setFilters(f => ({ ...f, type: e.target.value as any })); setCurrentPage(1); }}
                        className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    >
                        <option value="all">Tous les types</option>
                        {Object.values(TransactionType).map(t => <option key={t} value={t}>{t}</option>)}
                    </select>
                    <select
                        value={filters.status}
                        onChange={(e) => { setFilters(f => ({ ...f, status: e.target.value as any })); setCurrentPage(1); }}
                        className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    >
                        <option value="all">Tous les statuts</option>
                        {Object.values(TransactionStatus).map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                     <button className="w-full bg-blue-800 text-white font-semibold py-2 px-4 rounded-md hover:bg-blue-700 transition-colors">
                        Exporter en CSV
                    </button>
                </div>
            </Card>

            {/* Mobile View */}
            <div className="lg:hidden space-y-4">
                {paginatedTransactions.map(tx => (
                    <Card key={tx.id} className="p-4">
                        <div className="flex justify-between items-start">
                            <p className="font-bold">{tx.description}</p>
                            <span className={`text-xs font-semibold px-2 py-1 rounded-full ${getStatusBadgeColor(tx.status)}`}>{tx.status}</span>
                        </div>
                        <p className={`text-lg font-bold ${tx.amount > 0 ? 'text-green-600' : 'text-red-600'}`}>
                            {tx.amount.toLocaleString('fr-FR', { style: 'currency', currency: 'USD' })}
                        </p>
                        <div className="text-sm text-gray-500 mt-2 flex justify-between">
                            <span>{new Date(tx.date).toLocaleDateString('fr-FR')}</span>
                            <span>{tx.type}</span>
                        </div>
                    </Card>
                ))}
            </div>

            {/* Desktop View */}
            <div className="hidden lg:block bg-white rounded-lg shadow-md overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                            <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Montant</th>
                            <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Statut</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {paginatedTransactions.map((tx) => (
                            <tr key={tx.id} className="hover:bg-gray-50">
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{new Date(tx.date).toLocaleDateString('fr-FR')}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{tx.type}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{tx.description}</td>
                                <td className={`px-6 py-4 whitespace-nowrap text-sm font-semibold text-right ${tx.amount > 0 ? 'text-green-600' : 'text-red-600'}`}>
                                    {tx.amount.toLocaleString('fr-FR', { style: 'currency', currency: 'USD' })}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-center">
                                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadgeColor(tx.status)}`}>
                                        {tx.status}
                                    </span>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {paginatedTransactions.length === 0 && <p className="text-gray-500 text-center">Aucune transaction trouvée.</p>}
            
            {totalPages > 1 && (
                 <div className="flex justify-center items-center space-x-2 mt-6">
                    <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1} className="p-2 rounded-md bg-white border disabled:opacity-50">Précédent</button>
                    <span className="text-sm">Page {currentPage} sur {totalPages}</span>
                    <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages} className="p-2 rounded-md bg-white border disabled:opacity-50">Suivant</button>
                </div>
            )}
        </div>
    );
};

export default TransactionsPage;
