import React, { useState } from 'react';
import { useAuth } from './components/SupabaseAuthProvider';
import Dashboard from './components/Dashboard';
import Calendar from './components/Calendar';
import JournalManager from './components/JournalManager';
import Login from './components/Login';
import Navigation from './components/Navigation';
import { AnimatePresence, motion } from 'framer-motion';

function App() {
  const { user, loading } = useAuth();
  const [activeTab, setActiveTab] = useState('calendar');

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        backgroundColor: '#050505',
        color: '#fff'
      }}>
        <div className="loader-container">
          <div className="loader-spinner"></div>
          <p>Loading your data...</p>
        </div>
        <style jsx>{`
          .loader-container { text-align: center; }
          .loader-spinner { 
            width: 40px; height: 40px; border: 3px solid rgba(255,255,255,0.1); 
            border-top-color: #3b82f6; border-radius: 50%; animation: spin 1s linear infinite; 
            margin: 0 auto 1rem;
          }
          @keyframes spin { to { transform: rotate(360deg); } }
        `}</style>
      </div>
    );
  }

  if (!user) {
    return <Login />;
  }

  const renderContent = () => {
    switch (activeTab) {
      case 'calendar':
        return <Calendar key="calendar" />;
      case 'analytics':
        return <Dashboard key="analytics" />;
      case 'settings':
        return <JournalManager key="settings" />;
      default:
        return <Calendar key="calendar" />;
    }
  };

  return (
    <div className="app-container">
      <header className="app-header glass-header">
        <div className="header-content">
          <div className="logo-section">
            <h1 className="logo-text">TradeJournal<span>Free</span></h1>
          </div>

          <div className="header-nav">
            <Navigation activeTab={activeTab} setActiveTab={setActiveTab} />
          </div>

          <div className="user-profile">
            <div className="profile-btn">
              {user.user_metadata.avatar_url || user.user_metadata.picture ? (
                <img src={user.user_metadata.avatar_url || user.user_metadata.picture} alt={user.email} className="user-avatar" />
              ) : (
                <div className="user-avatar-initial">
                  {user.email.charAt(0).toUpperCase()}
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      <main className="app-main">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="view-wrapper"
          >
            {renderContent()}
          </motion.div>
        </AnimatePresence>
      </main>

      <style jsx>{`
        .app-container {
          display: flex;
          flex-direction: column;
          min-height: 100vh;
          background: #050505;
          color: #fff;
          padding-top: 80px;
        }

        .glass-header {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          height: 80px;
          z-index: 1000;
          background: rgba(10, 10, 12, 0.7);
          backdrop-filter: blur(15px);
          border-bottom: 1px solid rgba(255, 255, 255, 0.05);
          display: flex;
          align-items: center;
        }

        .header-content {
          width: 100%;
          max-width: 1200px;
          margin: 0 auto;
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 0 1.5rem;
        }

        .logo-text {
          font-size: 1.25rem;
          font-weight: 800;
          letter-spacing: -0.02em;
        }

        .logo-text span {
          color: #3b82f6;
          font-weight: 400;
        }

        .header-nav {
          flex: 1;
          display: flex;
          justify-content: center;
        }

        .user-avatar {
          width: 36px;
          height: 36px;
          border-radius: 12px;
          border: 1px solid rgba(255, 255, 255, 0.1);
        }

        .user-avatar-initial {
          width: 36px;
          height: 36px;
          border-radius: 12px;
          background: linear-gradient(135deg, #3b82f6, #8b5cf6);
          color: white;
          display: flex;
          justify-content: center;
          align-items: center;
          font-weight: 700;
          font-size: 1rem;
        }

        .app-main {
          flex: 1;
          width: 100%;
          max-width: 1200px;
          margin: 0 auto;
          padding: 2rem 1.5rem;
        }

        @media (max-width: 768px) {
          .app-header {
            height: 70px;
          }
          .app-container {
            padding-top: 70px;
          }
          .logo-text {
            font-size: 1.1rem;
          }
          .header-nav {
            position: fixed;
            bottom: 0;
            left: 0;
            right: 0;
            background: rgba(10, 10, 12, 0.9);
            backdrop-filter: blur(15px);
            border-top: 1px solid rgba(255, 255, 255, 0.05);
            padding: 0.75rem;
            justify-content: space-around;
            height: 70px;
          }
        }
      `}</style>
    </div>
  );
}

export default App;
