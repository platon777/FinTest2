import React from 'react';
import { Page } from '../App';
import { useAuth } from '../hooks/useAuth';
import {
  BankIcon, XIcon, LogoutIcon, DashboardIcon, TrendingUpIcon, TransactionsIcon, ProfileIcon, NewOrderIcon, WalletIcon
} from './icons';

interface SidebarProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  currentPage: Page;
  setCurrentPage: (page: Page) => void;
}

const navItems = [
  { page: 'dashboard' as Page, label: 'Dashboard', Icon: DashboardIcon },
  { page: 'accounts' as Page, label: 'Mes Comptes', Icon: WalletIcon },
  { page: 'investments' as Page, label: 'Mes Investissements', Icon: TrendingUpIcon },
  { page: 'transactions' as Page, label: 'Transactions', Icon: TransactionsIcon },
  { page: 'profile' as Page, label: 'Profil KYC', Icon: ProfileIcon },
  { page: 'new-order' as Page, label: 'Nouvel Ordre', Icon: NewOrderIcon },
];

const Sidebar: React.FC<SidebarProps> = ({ isOpen, setIsOpen, currentPage, setCurrentPage }) => {
  const { logout } = useAuth();

  const handleNavClick = (page: Page) => {
    setCurrentPage(page);
    if (window.innerWidth < 1024) {
      setIsOpen(false);
    }
  };

  const NavLink: React.FC<{
      page: Page;
      label: string;
      Icon: React.FC<React.SVGProps<SVGSVGElement>>;
  }> = ({ page, label, Icon }) => (
    <button
      onClick={() => handleNavClick(page)}
      className={`flex items-center w-full px-4 py-3 text-sm font-medium rounded-lg transition-colors ${
        currentPage === page
          ? 'bg-blue-800 text-white'
          : 'text-gray-300 hover:bg-blue-600 hover:text-white'
      }`}
    >
      <Icon className="w-5 h-5 mr-3" />
      <span>{label}</span>
    </button>
  );

  return (
    <>
      <div
        className={`fixed inset-0 bg-black bg-opacity-50 z-20 lg:hidden transition-opacity ${
          isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={() => setIsOpen(false)}
      />
      <div
        className={`fixed top-0 left-0 h-full bg-blue-900 text-white w-64 p-4 z-30 transform transition-transform lg:relative lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex justify-between items-center mb-8">
          <div className="flex items-center">
            <BankIcon className="h-8 w-8 text-white" />
            <span className="ml-2 text-xl font-bold">Profin Bank</span>
          </div>
          <button onClick={() => setIsOpen(false)} className="lg:hidden p-1 rounded-full hover:bg-blue-700">
            <XIcon className="w-6 h-6" />
          </button>
        </div>
        <nav className="flex flex-col justify-between" style={{height: 'calc(100% - 80px)'}}>
          <ul className="space-y-2">
            {navItems.map(item => <li key={item.page}><NavLink {...item} /></li>)}
          </ul>
          <button
            onClick={logout}
            className="flex items-center w-full px-4 py-3 text-sm font-medium rounded-lg transition-colors text-gray-300 hover:bg-red-700 hover:text-white mt-auto"
          >
            <LogoutIcon className="w-5 h-5 mr-3" />
            <span>Déconnexion</span>
          </button>
        </nav>
      </div>
    </>
  );
};

export default Sidebar;
