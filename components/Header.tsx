
import React from 'react';
import { useAuth } from '../hooks/useAuth';
import { BankIcon, MenuIcon, LogoutIcon } from './icons';

interface HeaderProps {
  onMenuClick: () => void;
}

const Header: React.FC<HeaderProps> = ({ onMenuClick }) => {
  const { user, logout } = useAuth();

  return (
    <header className="bg-white shadow-sm">
      <div className="mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <button
              onClick={onMenuClick}
              className="lg:hidden text-gray-500 hover:text-gray-700 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500"
              aria-label="Ouvrir le menu"
            >
              <MenuIcon className="h-6 w-6" />
            </button>
            <div className="hidden lg:flex items-center">
              <BankIcon className="h-8 w-8 text-blue-800" />
              <span className="ml-2 text-xl font-bold text-blue-800">Profin Bank</span>
            </div>
          </div>
          <div className="flex items-center">
            <div className="text-right mr-4">
              <p className="text-sm font-semibold text-gray-800">{user?.name}</p>
              <p className="text-xs text-gray-500">{user?.clientType}</p>
            </div>
            <button
              onClick={logout}
              className="flex items-center p-2 rounded-full text-gray-500 hover:bg-red-100 hover:text-red-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors"
              aria-label="Déconnexion"
            >
              <LogoutIcon className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
