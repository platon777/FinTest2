
import React, { useState, useMemo } from 'react';
import { mockBonds } from '../data/mock';
import { Bond, BondStatus } from '../types';
import Card from '../components/Card';

const getStatusBadgeColor = (status: BondStatus) => {
  switch (status) {
    case BondStatus.ACTIVE:
      return 'bg-green-100 text-green-800';
    case BondStatus.PENDING:
      return 'bg-yellow-100 text-yellow-800';
    case BondStatus.MATURED:
      return 'bg-blue-100 text-blue-800';
    case BondStatus.CANCELED:
        return 'bg-red-100 text-red-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

const BondCard: React.FC<{ bond: Bond }> = ({ bond }) => {
    const maturityDate = new Date(bond.maturityDate);
    const subscriptionDate = new Date(bond.subscriptionDate);
    const today = new Date();

    const totalDuration = maturityDate.getTime() - subscriptionDate.getTime();
    const elapsedDuration = today.getTime() - subscriptionDate.getTime();
    const progress = Math.min(100, Math.max(0, (elapsedDuration / totalDuration) * 100));

    return (
        <Card className="transition-shadow hover:shadow-lg">
            <div className="flex justify-between items-start">
                <div>
                    <h4 className="text-xl font-bold text-blue-800">{bond.name}</h4>
                    <p className="text-sm text-gray-500">ID: {bond.id}</p>
                </div>
                <span className={`px-3 py-1 text-xs font-semibold rounded-full ${getStatusBadgeColor(bond.status)}`}>
                    {bond.status}
                </span>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-4">
                <div>
                    <p className="text-sm text-gray-500">Montant Investi</p>
                    <p className="font-semibold">{bond.investedAmount.toLocaleString('fr-FR', { style: 'currency', currency: 'USD' })}</p>
                </div>
                <div>
                    <p className="text-sm text-gray-500">Taux Annuel</p>
                    <p className="font-semibold text-green-600">{bond.yieldRate}%</p>
                </div>
                <div>
                    <p className="text-sm text-gray-500">Rendement Attendu</p>
                    <p className="font-semibold">{bond.expectedReturn.toLocaleString('fr-FR', { style: 'currency', currency: 'USD' })}</p>
                </div>
                <div>
                    <p className="text-sm text-gray-500">Souscription</p>
                    <p className="font-semibold">{new Date(bond.subscriptionDate).toLocaleDateString('fr-FR')}</p>
                </div>
                <div>
                    <p className="text-sm text-gray-500">Maturité</p>
                    <p className="font-semibold">{new Date(bond.maturityDate).toLocaleDateString('fr-FR')}</p>
                </div>
            </div>
            <div className="mt-4">
                <p className="text-sm text-gray-500 mb-1">Progression vers la maturité</p>
                <div className="w-full bg-gray-200 rounded-full h-2.5">
                    <div className="bg-blue-600 h-2.5 rounded-full" style={{ width: `${progress}%` }}></div>
                </div>
            </div>
        </Card>
    );
}

const BondsPage: React.FC = () => {
    const [statusFilter, setStatusFilter] = useState<BondStatus | 'all'>('all');
    const [sortKey, setSortKey] = useState<'maturityDate' | 'yieldRate' | 'investedAmount'>('maturityDate');

    const filteredAndSortedBonds = useMemo(() => {
        return mockBonds
            .filter(bond => statusFilter === 'all' || bond.status === statusFilter)
            .sort((a, b) => {
                if(sortKey === 'maturityDate') {
                    return new Date(a.maturityDate).getTime() - new Date(b.maturityDate).getTime();
                }
                return b[sortKey] - a[sortKey];
            });
    }, [statusFilter, sortKey]);

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-gray-800">Mes Obligations</h1>
      
      <Card>
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div>
                <label htmlFor="statusFilter" className="text-sm font-medium text-gray-700 mr-2">Filtrer par statut:</label>
                <select id="statusFilter" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value as BondStatus | 'all')} className="p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500">
                    <option value="all">Tous</option>
                    {Object.values(BondStatus).map(status => (
                        <option key={status} value={status}>{status}</option>
                    ))}
                </select>
            </div>
            <div>
                <label htmlFor="sortKey" className="text-sm font-medium text-gray-700 mr-2">Trier par:</label>
                <select id="sortKey" value={sortKey} onChange={(e) => setSortKey(e.target.value as any)} className="p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500">
                    <option value="maturityDate">Date de maturité</option>
                    <option value="yieldRate">Taux de rendement</option>
                    <option value="investedAmount">Montant investi</option>
                </select>
            </div>
        </div>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filteredAndSortedBonds.map(bond => (
            <BondCard key={bond.id} bond={bond} />
        ))}
        {filteredAndSortedBonds.length === 0 && (
            <p className="text-gray-500 text-center lg:col-span-2">Aucune obligation ne correspond à vos critères.</p>
        )}
      </div>

    </div>
  );
};

export default BondsPage;
