import React from 'react';
import { useAuth } from './hooks/useAuth';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import InvestmentsPage from './pages/InvestmentsPage';
import TransactionsPage from './pages/TransactionsPage';
import ProfilePage from './pages/ProfilePage';
import NewOrderPage from './pages/NewOrderPage';
import Layout from './components/Layout';
import ChatWidget from './components/ChatWidget';
import AccountsPage from './pages/AccountsPage';

export type Page = 'dashboard' | 'investments' | 'transactions' | 'profile' | 'new-order' | 'accounts';

const App: React.FC = () => {
  const { loggedInUser } = useAuth();
  const [currentPage, setCurrentPage] = React.useState<Page>('dashboard');

  if (!loggedInUser) {
    return <LoginPage />;
  }

  const renderPage = () => {
    switch (currentPage) {
      case 'dashboard':
        return <DashboardPage setCurrentPage={setCurrentPage} />;
      case 'investments':
        return <InvestmentsPage />;
      case 'transactions':
        return <TransactionsPage />;
      case 'profile':
        return <ProfilePage />;
      case 'new-order':
        return <NewOrderPage />;
      case 'accounts':
        return <AccountsPage />;
      default:
        return <DashboardPage setCurrentPage={setCurrentPage} />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 text-gray-800">
      <Layout currentPage={currentPage} setCurrentPage={setCurrentPage}>
        {renderPage()}
      </Layout>
      <ChatWidget />
    </div>
  );
};

export default App;
