import React from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';
import Card from '../components/Card';
import { Transaction, Bond, TransactionType } from '../types';
import { Page } from '../App';
import { useAuth } from '../hooks/useAuth';

const SkeletonLoader: React.FC<{ className?: string }> = ({ className }) => (
    <div className={`bg-gray-200 rounded-md animate-pulse ${className}`} />
);

const PortfolioOverviewCard: React.FC = () => {
    const { portfolio, isLoadingData } = useAuth();
    
    if (isLoadingData || !portfolio) {
        return (
            <Card title="Vue d'ensemble du portefeuille">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                    <SkeletonLoader className="h-20" />
                    <SkeletonLoader className="h-20" />
                    <SkeletonLoader className="h-20" />
                </div>
                <SkeletonLoader className="h-64" />
            </Card>
        );
    }
    
    const returnColor = portfolio.totalReturnAmount >= 0 ? 'text-green-600' : 'text-red-600';

    return (
        <Card title="Vue d'ensemble du portefeuille">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-500">Valeur totale</p>
                    <p className="text-2xl font-bold text-blue-800">
                        {portfolio.totalValue.toLocaleString('fr-FR', { style: 'currency', currency: 'USD' })}
                    </p>
                </div>
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-500">Rendement total</p>
                    <p className={`text-2xl font-bold ${returnColor}`}>
                        {portfolio.totalReturnAmount >= 0 ? '+' : ''}{portfolio.totalReturnAmount.toLocaleString('fr-FR', { style: 'currency', currency: 'USD' })} ({portfolio.totalReturnPercentage}%)
                    </p>
                </div>
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-500">Obligations actives</p>
                    <p className="text-2xl font-bold text-blue-800">{portfolio.activeBondsCount}</p>
                </div>
            </div>
            <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={portfolio.evolution}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="month" />
                        <YAxis tickFormatter={(value) => `${value / 1000}k`} />
                        <Tooltip formatter={(value: number) => [value.toLocaleString('fr-FR', { style: 'currency', currency: 'USD' }), "Valeur"]}/>
                        <Bar dataKey="value" fill="#1E3A8A" />
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </Card>
    );
};

const TransactionItem: React.FC<{ tx: Transaction }> = ({ tx }) => {
    const isPositive = tx.type === TransactionType.DEPOSIT;
    return (
        <div className="flex justify-between items-center py-3 border-b border-gray-100 last:border-b-0">
            <div>
                <p className="font-semibold text-gray-800">{tx.description}</p>
                <p className="text-sm text-gray-500">{new Date(tx.date).toLocaleDateString('fr-FR')}</p>
            </div>
            <div className="text-right">
                <p className={`font-bold ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
                    {tx.amount.toLocaleString('fr-FR', { style: 'currency', currency: 'USD' })}
                </p>
                <p className="text-xs text-gray-400">{tx.status}</p>
            </div>
        </div>
    );
};

const RecentTransactionsCard: React.FC<{ setCurrentPage: (page: Page) => void; }> = ({ setCurrentPage }) => {
    const { transactions, isLoadingData } = useAuth();
    return (
        <Card title="Dernières transactions">
            {isLoadingData ? (
                <div className="space-y-4">
                    <SkeletonLoader className="h-12" />
                    <SkeletonLoader className="h-12" />
                    <SkeletonLoader className="h-12" />
                </div>
            ) : (
                <>
                    <div className="space-y-2">
                        {transactions.slice(0, 5).map(tx => <TransactionItem key={tx.id} tx={tx} />)}
                    </div>
                    <button onClick={() => setCurrentPage('transactions')} className="mt-4 text-sm font-semibold text-blue-600 hover:underline w-full text-center">
                        Voir toutes les transactions
                    </button>
                </>
            )}
        </Card>
    );
};

const ActiveBondsCard: React.FC = () => {
    const { bonds, isLoadingData } = useAuth();
    return (
        <Card title="Obligations actives">
            {isLoadingData ? (
                 <div className="space-y-4">
                    <SkeletonLoader className="h-16" />
                    <SkeletonLoader className="h-16" />
                </div>
            ) : (
                <div className="space-y-4">
                    {bonds.filter(b => b.status === 'Active').map((bond: Bond) => (
                        <div key={bond.id} className="p-3 bg-gray-50 rounded-lg">
                            <div className="flex justify-between items-start">
                                <div>
                                    <p className="font-bold text-blue-800">{bond.name}</p>
                                    <p className="text-sm text-gray-600">Montant: {bond.investedAmount.toLocaleString('fr-FR', { style: 'currency', currency: 'USD' })}</p>
                                </div>
                                <div className="text-right">
                                    <p className="font-semibold text-green-600">{bond.yieldRate}%</p>
                                    <p className="text-xs text-gray-500">Maturité: {new Date(bond.maturityDate).toLocaleDateString('fr-FR')}</p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </Card>
    );
};

interface DashboardPageProps {
  setCurrentPage: (page: Page) => void;
}

const DashboardPage: React.FC<DashboardPageProps> = ({ setCurrentPage }) => {
  const { activeAccount } = useAuth();
  
  return (
    <div className="space-y-6">
        <h1 className="text-3xl font-bold text-gray-800">Bonjour, {activeAccount?.name} !</h1>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
                <PortfolioOverviewCard />
            </div>
            <div className="lg:col-span-1 space-y-6">
                <RecentTransactionsCard setCurrentPage={setCurrentPage} />
                <ActiveBondsCard />
            </div>
        </div>
    </div>
  );
};

export default DashboardPage;
