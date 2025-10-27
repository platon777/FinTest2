import React from 'react';
import { useAuth } from '../hooks/useAuth';
import { ClientAccount, AccountStatus, AccountType } from '../types';
import Card from '../components/Card';
import { BankIcon, WalletIcon } from '../components/icons'; // Using existing icons for demo

const getAccountStatusColor = (status: AccountStatus) => {
    switch (status) {
        case AccountStatus.ACTIVE:
            return 'bg-green-100 text-green-800';
        case AccountStatus.SUSPENDED:
            return 'bg-yellow-100 text-yellow-800';
        case AccountStatus.CLOSED:
            return 'bg-red-100 text-red-800';
        default:
            return 'bg-gray-100 text-gray-800';
    }
};

const getAccountTypeIcon = (type: AccountType) => {
    switch(type) {
        case AccountType.INVESTMENT:
            return <BondsIcon className="w-6 h-6 text-white" />;
        case AccountType.CASH:
            return <BankIcon className="w-6 h-6 text-white" />;
        case AccountType.EPARGNE:
            return <WalletIcon className="w-6 h-6 text-white" />;
        default:
            return <WalletIcon className="w-6 h-6 text-white" />;
    }
};

const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat('fr-FR', { style: 'currency', currency }).format(amount);
};

const AccountCard: React.FC<{ account: ClientAccount }> = ({ account }) => {
    const availablePercentage = account.balance > 0 ? (account.availableBalance / account.balance) * 100 : 0;

    return (
        <Card className="flex flex-col justify-between transition-shadow hover:shadow-xl">
            <div>
                <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-blue-800 rounded-lg">
                            {getAccountTypeIcon(account.accountType)}
                        </div>
                        <div>
                            <h4 className="text-lg font-bold text-gray-800 capitalize">{account.accountType.toLowerCase()}</h4>
                            <p className="text-sm text-gray-500 font-mono">{account.accountNumber}</p>
                        </div>
                    </div>
                    <span className={`px-3 py-1 text-xs font-semibold rounded-full ${getAccountStatusColor(account.status)}`}>
                        {account.status}
                    </span>
                </div>
                
                <div className="mb-4">
                    <p className="text-sm text-gray-500">Solde Total</p>
                    <p className="text-3xl font-extrabold text-blue-900">{formatCurrency(account.balance, account.currency)}</p>
                </div>

                <div className="mb-4">
                    <div className="flex justify-between items-center mb-1">
                        <p className="text-sm font-medium text-gray-700">Solde Disponible</p>
                        <p className="text-sm font-semibold text-gray-800">{formatCurrency(account.availableBalance, account.currency)}</p>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2.5">
                        <div className="bg-green-500 h-2.5 rounded-full" style={{ width: `${availablePercentage}%` }}></div>
                    </div>
                </div>
            </div>
            
            <div className="pt-4 border-t border-gray-100 text-xs text-gray-500 flex justify-between">
                <span>Ouvert le: {new Date(account.openingDate).toLocaleDateString('fr-FR')}</span>
                <span className="font-semibold">{account.currency}</span>
            </div>
        </Card>
    );
};

const SkeletonCard: React.FC = () => (
    <div className="bg-white rounded-lg shadow-md p-6 animate-pulse">
        <div className="flex justify-between items-start mb-4">
            <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-gray-200 rounded-lg"></div>
                <div>
                    <div className="h-5 bg-gray-200 rounded w-28 mb-2"></div>
                    <div className="h-4 bg-gray-200 rounded w-36"></div>
                </div>
            </div>
            <div className="h-6 w-20 bg-gray-200 rounded-full"></div>
        </div>
        <div className="my-6 space-y-2">
            <div className="h-4 w-20 bg-gray-200 rounded"></div>
            <div className="h-8 w-40 bg-gray-200 rounded"></div>
        </div>
        <div className="my-6 space-y-2">
            <div className="flex justify-between h-4 mb-2">
                <div className="w-24 bg-gray-200 rounded"></div>
                <div className="w-28 bg-gray-200 rounded"></div>
            </div>
            <div className="h-2.5 w-full bg-gray-200 rounded-full"></div>
        </div>
        <div className="pt-4 mt-4 border-t border-gray-100 flex justify-between h-4">
            <div className="w-24 bg-gray-200 rounded"></div>
            <div className="w-10 bg-gray-200 rounded"></div>
        </div>
    </div>
);


const AccountsPage: React.FC = () => {
    const { accounts, isLoadingData } = useAuth();

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold text-gray-800">Mes Comptes</h1>
            
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {isLoadingData ? (
                    <>
                        <SkeletonCard />
                        <SkeletonCard />
                    </>
                ) : accounts.length > 0 ? (
                    accounts.map(account => (
                        <AccountCard key={account.accountId} account={account} />
                    ))
                ) : (
                    <p className="text-gray-500 text-center md:col-span-2 xl:col-span-3">Aucun compte à afficher pour ce profil.</p>
                )}
            </div>
        </div>
    );
};

// Dummy icons to avoid breaking the build if they are not in the icons file yet
const BondsIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M15 15H5" /><path d="M15 9.5H5" /><path d="M10.5 12.25 5 15" /><path d="M10.5 12.25 5 9.5" /><path d="M19.5 15H17" /><path d="M19.5 9.5H17" /><path d="M15 15a2.5 2.5 0 0 0 0-5.5" /><path d="m15 9.5.1-.1" /><path d="M15 9.5a2.5 2.5 0 0 1 0 5.5" />
  </svg>
);


export default AccountsPage;