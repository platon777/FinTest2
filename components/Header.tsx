
import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { BankIcon, MenuIcon, LogoutIcon, ChevronDownIcon, CheckIcon } from './icons';

interface HeaderProps {
  onMenuClick: () => void;
}

const Header: React.FC<HeaderProps> = ({ onMenuClick }) => {
  const { logout, activeAccount, availableAccounts, switchAccount } = useAuth();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
        if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
            setIsDropdownOpen(false);
        }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
        document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleAccountSwitch = (accountId: string) => {
    switchAccount(accountId);
    setIsDropdownOpen(false);
  }

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
            <div className="relative" ref={dropdownRef}>
              <button 
                onClick={() => setIsDropdownOpen(prev => !prev)}
                className="flex items-center p-2 rounded-md hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
              >
                <div className="text-right mr-2">
                  <p className="text-sm font-semibold text-gray-800">{activeAccount?.name}</p>
                  <p className="text-xs text-gray-500">{activeAccount?.type}</p>
                </div>
                <ChevronDownIcon className={`h-4 w-4 text-gray-500 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`}/>
              </button>
              {isDropdownOpen && availableAccounts.length > 1 && (
                <div className="absolute right-0 mt-2 w-64 bg-white rounded-md shadow-lg py-1 z-10 border border-gray-200">
                  <div className="px-4 py-2 border-b">
                    <p className="text-sm font-semibold">Changer de compte</p>
                  </div>
                  {availableAccounts.map(account => (
                    <button 
                      key={account.id} 
                      onClick={() => handleAccountSwitch(account.id)}
                      className="w-full text-left flex items-center justify-between px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      <div>
                        <p className="font-medium">{account.name}</p>
                        <p className="text-xs text-gray-500">{account.type}</p>
                      </div>
                      {account.id === activeAccount?.id && <CheckIcon className="w-5 h-5 text-blue-600" />}
                    </button>
                  ))}
                </div>
              )}
            </div>
            
            <button
              onClick={logout}
              className="flex items-center p-2 rounded-full text-gray-500 hover:bg-red-100 hover:text-red-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors ml-2"
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