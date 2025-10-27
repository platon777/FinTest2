import React, { useState, useMemo } from 'react';
import { useAuth } from '../hooks/useAuth';
import { Transaction, TransactionWorkflowStatus, DetailedTransactionType } from '../types';
import Card from '../components/Card';

const getStatusBadgeColor = (status: TransactionWorkflowStatus) => {
  switch (status) {
    case TransactionWorkflowStatus.EXECUTED:
    case TransactionWorkflowStatus.VALIDATED:
      return 'bg-green-100 text-green-800';
    case TransactionWorkflowStatus.PENDING_VALIDATION:
    case TransactionWorkflowStatus.DRAFT:
      return 'bg-yellow-100 text-yellow-800';
    case TransactionWorkflowStatus.REJECTED:
    case TransactionWorkflowStatus.CANCELLED:
    case TransactionWorkflowStatus.FAILED:
      return 'bg-red-100 text-red-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

const formatStatus = (status: TransactionWorkflowStatus) => {
    return status.replace(/_/g, ' ').toLowerCase();
};

const ITEMS_PER_PAGE = 10;

const TransactionsPage: React.FC = () => {
    const { transactions, isLoadingData, accounts } = useAuth();
    const [searchTerm, setSearchTerm] = useState('');
    const [filters, setFilters] = useState<{ type: 'all' | DetailedTransactionType, status: 'all' | TransactionWorkflowStatus }>({ type: 'all', status: 'all' });
    const [currentPage, setCurrentPage] = useState(1);

    const filteredTransactions = useMemo(() => {
        return [...transactions]
            .sort((a, b) => new Date(b.creationDate).getTime() - new Date(a.creationDate).getTime())
            .filter(tx => searchTerm === '' || tx.description.toLowerCase().includes(searchTerm.toLowerCase()))
            .filter(tx => filters.type === 'all' || tx.transactionType === filters.type)
            .filter(tx => filters.status === 'all' || tx.status === filters.status);
    }, [searchTerm, filters, transactions]);

    const totalPages = Math.ceil(filteredTransactions.length / ITEMS_PER_PAGE);
    const paginatedTransactions = filteredTransactions.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);
    
    React.useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm, filters]);

    const getAccountNumber = (accountId: number | null | undefined) => {
        if (!accountId) return 'N/A';
        return accounts.find(acc => acc.accountId === accountId)?.accountNumber || `Compte #${accountId}`;
    };

    const SkeletonRow = () => (
        <tr className="animate-pulse">
            <td className="px-6 py-4"><div className="h-4 bg-gray-200 rounded w-24"></div></td>
            <td className="px-6 py-4"><div className="h-4 bg-gray-200 rounded w-48"></div></td>
            <td className="px-6 py-4"><div className="h-4 bg-gray-200 rounded w-20"></div></td>
            <td className="px-6 py-4"><div className="h-4 bg-gray-200 rounded w-20"></div></td>
            <td className="px-6 py-4 text-right"><div className="h-4 bg-gray-200 rounded w-28 ml-auto"></div></td>
            <td className="px-6 py-4 text-center"><div className="h-6 w-24 mx-auto bg-gray-200 rounded-full"></div></td>
        </tr>
    );

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold text-gray-800">Historique des Transactions</h1>

            <Card>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <input
                        type="text"
                        placeholder="Rechercher par description..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    />
                    <select
                        value={filters.type}
                        onChange={(e) => setFilters(f => ({ ...f, type: e.target.value as any }))}
                        className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    >
                        <option value="all">Tous les types</option>
                        {Object.values(DetailedTransactionType).map(t => <option key={t} value={t}>{t}</option>)}
                    </select>
                    <select
                        value={filters.status}
                        onChange={(e) => setFilters(f => ({ ...f, status: e.target.value as any }))}
                        className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    >
                        <option value="all">Tous les statuts</option>
                        {Object.values(TransactionWorkflowStatus).map(s => <option key={s} value={s}>{formatStatus(s)}</option>)}
                    </select>
                     <button className="w-full bg-blue-800 text-white font-semibold py-2 px-4 rounded-md hover:bg-blue-700 transition-colors">
                        Exporter en CSV
                    </button>
                </div>
            </Card>

            <div className="bg-white rounded-lg shadow-md overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Compte Source</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Compte Dest.</th>
                            <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Montant</th>
                            <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Statut</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {isLoadingData ? (
                            Array.from({ length: ITEMS_PER_PAGE }).map((_, i) => <SkeletonRow key={i} />)
                        ) : (
                            paginatedTransactions.map((tx) => {
                                const isPositive = [DetailedTransactionType.DEPOSIT, DetailedTransactionType.INTEREST_PAYMENT, DetailedTransactionType.MATURITY_REIMBURSEMENT].includes(tx.transactionType);
                                const amount = isPositive ? tx.amount : -tx.amount;
                                return (
                                <tr key={tx.transactionId} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{new Date(tx.creationDate).toLocaleDateString('fr-FR')}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{tx.description}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 font-mono">{getAccountNumber(tx.sourceAccountId)}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 font-mono">{getAccountNumber(tx.destinationAccountId)}</td>
                                    <td className={`px-6 py-4 whitespace-nowrap text-sm font-semibold text-right ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
                                        {amount.toLocaleString('fr-FR', { style: 'currency', currency: tx.currency })}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-center">
                                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full capitalize ${getStatusBadgeColor(tx.status)}`}>
                                            {formatStatus(tx.status)}
                                        </span>
                                    </td>
                                </tr>
                            )})
                        )}
                    </tbody>
                </table>
            </div>

            {!isLoadingData && paginatedTransactions.length === 0 && <p className="text-gray-500 text-center">Aucune transaction trouvée.</p>}
            
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
