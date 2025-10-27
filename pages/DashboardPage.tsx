import React from 'react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar
} from 'recharts';
import Card from '../components/Card';
import { mockPortfolio, mockTransactions, mockBonds, mockUser } from '../data/mock';
import { Transaction, Bond, TransactionType, BondStatus } from '../types';
import { Page } from '../App';

const PortfolioOverviewCard: React.FC = () => {
    const data = mockPortfolio;
    const returnColor = data.totalReturnAmount >= 0 ? 'text-green-600' : 'text-red-600';

    return (
        <Card title="Vue d'ensemble du portefeuille">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-500">Valeur totale</p>
                    <p className="text-2xl font-bold text-blue-800">
                        {data.totalValue.toLocaleString('fr-FR', { style: 'currency', currency: 'USD' })}
                    </p>
                </div>
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-500">Rendement total</p>
                    <p className={`text-2xl font-bold ${returnColor}`}>
                        {data.totalReturnAmount >= 0 ? '+' : ''}{data.totalReturnAmount.toLocaleString('fr-FR', { style: 'currency', currency: 'USD' })} ({data.totalReturnPercentage}%)
                    </p>
                </div>
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-500">Obligations actives</p>
                    <p className="text-2xl font-bold text-blue-800">{data.activeBondsCount}</p>
                </div>
            </div>
            <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={data.evolution}>
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

const RecentTransactionsCard: React.FC<{ setCurrentPage: (page: Page) => void; }> = ({ setCurrentPage }) => (
    <Card title="Dernières transactions">
        <div className="space-y-2">
            {mockTransactions.slice(0, 5).map(tx => <TransactionItem key={tx.id} tx={tx} />)}
        </div>
        <button onClick={() => setCurrentPage('transactions')} className="mt-4 text-sm font-semibold text-blue-600 hover:underline w-full text-center">
            Voir toutes les transactions
        </button>
    </Card>
);

const ActiveBondsCard: React.FC = () => {
    const activeBonds = mockBonds.filter(b => b.status === BondStatus.ACTIVE);
    return(
    <Card title="Obligations actives">
        <div className="space-y-4">
            {activeBonds.map((bond: Bond) => (
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
    </Card>
)};

interface DashboardPageProps {
  setCurrentPage: (page: Page) => void;
}

const DashboardPage: React.FC<DashboardPageProps> = ({ setCurrentPage }) => {
  return (
    <div className="space-y-6">
        <h1 className="text-3xl font-bold text-gray-800">Bonjour, {mockUser.name} !</h1>
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