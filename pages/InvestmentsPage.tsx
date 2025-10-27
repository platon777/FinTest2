import React, { useState, useMemo } from 'react';
import { useAuth } from '../hooks/useAuth';
import { Subscription, SubscriptionStatus, Instrument } from '../types';
import Card from '../components/Card';

const getStatusBadgeColor = (status: SubscriptionStatus) => {
  switch (status) {
    case SubscriptionStatus.ACTIVE:
      return 'bg-green-100 text-green-800';
    case SubscriptionStatus.MATURED:
      return 'bg-blue-100 text-blue-800';
    case SubscriptionStatus.REDEEMED:
      return 'bg-orange-100 text-orange-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

const SubscriptionCard: React.FC<{ subscription: Subscription; instrument: Instrument }> = ({ subscription, instrument }) => {
    const maturityDate = instrument.maturityDate ? new Date(instrument.maturityDate) : null;
    const subscriptionDate = new Date(subscription.subscriptionDate);
    const today = new Date();

    let progress = 0;
    if(maturityDate){
        const totalDuration = maturityDate.getTime() - subscriptionDate.getTime();
        if (totalDuration > 0) {
            const elapsedDuration = today.getTime() - subscriptionDate.getTime();
            progress = Math.min(100, Math.max(0, (elapsedDuration / totalDuration) * 100));
        } else if (today >= maturityDate) {
            progress = 100;
        }
    }
    
    return (
        <Card className="transition-shadow hover:shadow-lg">
            <div className="flex justify-between items-start">
                <div>
                    <h4 className="text-xl font-bold text-blue-800">{instrument.name}</h4>
                    <p className="text-sm text-gray-500">Souscription ID: {subscription.subscriptionId}</p>
                </div>
                <span className={`px-3 py-1 text-xs font-semibold rounded-full ${getStatusBadgeColor(subscription.status)}`}>
                    {subscription.status}
                </span>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-4">
                <div>
                    <p className="text-sm text-gray-500">Montant Investi</p>
                    <p className="font-semibold">{subscription.investedAmount.toLocaleString('fr-FR', { style: 'currency', currency: instrument.currency })}</p>
                </div>
                <div>
                    <p className="text-sm text-gray-500">Taux à la souscription</p>
                    <p className="font-semibold text-green-600">{subscription.rateOnSubscription}%</p>
                </div>
                <div>
                    <p className="text-sm text-gray-500">Valeur Actuelle</p>
                    <p className="font-semibold">{subscription.currentValue.toLocaleString('fr-FR', { style: 'currency', currency: instrument.currency })}</p>
                </div>
                <div>
                    <p className="text-sm text-gray-500">Souscription</p>
                    <p className="font-semibold">{subscriptionDate.toLocaleDateString('fr-FR')}</p>
                </div>
                {maturityDate && (
                    <div>
                        <p className="text-sm text-gray-500">Maturité</p>
                        <p className="font-semibold">{maturityDate.toLocaleDateString('fr-FR')}</p>
                    </div>
                )}
            </div>
            {maturityDate && (
                <div className="mt-4">
                    <p className="text-sm text-gray-500 mb-1">Progression vers la maturité</p>
                    <div className="w-full bg-gray-200 rounded-full h-2.5">
                        <div className="bg-blue-600 h-2.5 rounded-full" style={{ width: `${progress}%` }}></div>
                    </div>
                </div>
            )}
        </Card>
    );
}

const SkeletonCard: React.FC = () => (
    <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex justify-between items-start mb-4">
            <div className="w-3/4 space-y-2">
                <div className="h-6 bg-gray-200 rounded w-1/2 animate-pulse"></div>
                <div className="h-4 bg-gray-200 rounded w-1/4 animate-pulse"></div>
            </div>
            <div className="h-6 w-20 bg-gray-200 rounded-full animate-pulse"></div>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-4">
            <div className="space-y-2"><div className="h-4 w-20 bg-gray-200 rounded animate-pulse"></div><div className="h-5 w-24 bg-gray-200 rounded animate-pulse"></div></div>
            <div className="space-y-2"><div className="h-4 w-20 bg-gray-200 rounded animate-pulse"></div><div className="h-5 w-16 bg-gray-200 rounded animate-pulse"></div></div>
            <div className="space-y-2"><div className="h-4 w-24 bg-gray-200 rounded animate-pulse"></div><div className="h-5 w-28 bg-gray-200 rounded animate-pulse"></div></div>
        </div>
        <div className="mt-6">
            <div className="h-4 w-40 bg-gray-200 rounded mb-2 animate-pulse"></div>
            <div className="h-2.5 w-full bg-gray-200 rounded-full animate-pulse"></div>
        </div>
    </div>
);


const InvestmentsPage: React.FC = () => {
    const { subscriptions, instruments, isLoadingData } = useAuth();
    const [statusFilter, setStatusFilter] = useState<SubscriptionStatus | 'all'>('all');
    const [sortKey, setSortKey] = useState<'maturityDate' | 'rateOnSubscription' | 'investedAmount'>('maturityDate');

    const filteredAndSortedSubscriptions = useMemo(() => {
        return [...subscriptions]
            .filter(sub => statusFilter === 'all' || sub.status === statusFilter)
            .sort((a, b) => {
                const instrumentA = instruments.find(i => i.instrumentId === a.instrumentId);
                const instrumentB = instruments.find(i => i.instrumentId === b.instrumentId);

                if (sortKey === 'maturityDate') {
                    const dateA = instrumentA?.maturityDate ? new Date(instrumentA.maturityDate).getTime() : 0;
                    const dateB = instrumentB?.maturityDate ? new Date(instrumentB.maturityDate).getTime() : 0;
                    if (!dateA) return 1; // Put subscriptions without maturity date at the end
                    if (!dateB) return -1;
                    return dateA - dateB;
                }
                return b[sortKey] - a[sortKey];
            });
    }, [statusFilter, sortKey, subscriptions, instruments]);

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-gray-800">Mes Investissements</h1>
      
      <Card>
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div>
                <label htmlFor="statusFilter" className="text-sm font-medium text-gray-700 mr-2">Filtrer par statut:</label>
                <select id="statusFilter" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value as SubscriptionStatus | 'all')} className="p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500">
                    <option value="all">Tous</option>
                    {Object.values(SubscriptionStatus).map(status => (
                        <option key={status} value={status}>{status}</option>
                    ))}
                </select>
            </div>
            <div>
                <label htmlFor="sortKey" className="text-sm font-medium text-gray-700 mr-2">Trier par:</label>
                <select id="sortKey" value={sortKey} onChange={(e) => setSortKey(e.target.value as any)} className="p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500">
                    <option value="maturityDate">Date de maturité</option>
                    <option value="rateOnSubscription">Taux de rendement</option>
                    <option value="investedAmount">Montant investi</option>
                </select>
            </div>
        </div>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {isLoadingData ? (
            <>
                <SkeletonCard />
                <SkeletonCard />
            </>
        ) : filteredAndSortedSubscriptions.length > 0 ? (
            filteredAndSortedSubscriptions.map(sub => {
                const instrument = instruments.find(i => i.instrumentId === sub.instrumentId);
                if (!instrument) return null;
                return <SubscriptionCard key={sub.subscriptionId} subscription={sub} instrument={instrument}/>
            })
        ) : (
            <p className="text-gray-500 text-center lg:col-span-2">Aucun investissement ne correspond à vos critères.</p>
        )}
      </div>

    </div>
  );
};

export default InvestmentsPage;
