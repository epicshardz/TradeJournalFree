import React from 'react';
import { Layout, Calendar as CalendarIcon, PieChart, Settings } from 'lucide-react';

const Navigation = ({ activeTab, setActiveTab }) => {
  const tabs = [
    { id: 'calendar', label: 'Calendar', icon: CalendarIcon },
    { id: 'analytics', label: 'Analytics', icon: PieChart },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <nav className="nav-container">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          className={`nav-item ${activeTab === tab.id ? 'active' : ''}`}
          onClick={() => setActiveTab(tab.id)}
        >
          <tab.icon size={20} className="nav-icon" />
          <span className="nav-label">{tab.label}</span>
          {activeTab === tab.id && <div className="indicator"></div>}
        </button>
      ))}

      <style jsx>{`
        .nav-container {
          display: flex;
          gap: 0.5rem;
          padding: 4px;
          background: rgba(255, 255, 255, 0.04);
          border-radius: 16px;
          border: 1px solid rgba(255, 255, 255, 0.05);
        }

        .nav-item {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding: 0.75rem 1.25rem;
          background: none;
          border: none;
          color: #94a3b8;
          font-weight: 600;
          font-size: 0.9rem;
          cursor: pointer;
          border-radius: 12px;
          transition: all 0.3s ease;
          position: relative;
        }

        .nav-item:hover {
          color: #fff;
          background: rgba(255, 255, 255, 0.03);
        }

        .nav-item.active {
          color: #fff;
          background: rgba(255, 255, 255, 0.08);
        }

        .nav-icon {
          transition: transform 0.3s ease;
        }

        .nav-item.active .nav-icon {
          color: #3b82f6;
          transform: scale(1.1);
        }

        .indicator {
          position: absolute;
          bottom: 6px;
          left: 50%;
          transform: translateX(-50%);
          width: 4px;
          height: 4px;
          background: #3b82f6;
          border-radius: 50%;
          box-shadow: 0 0 8px #3b82f6;
        }

        @media (max-width: 768px) {
          .nav-container {
            background: none;
            border: none;
            width: 100%;
            justify-content: space-around;
            gap: 0;
          }
          .nav-item {
            flex-direction: column;
            gap: 0.25rem;
            padding: 0.5rem;
            font-size: 0.75rem;
          }
          .nav-label {
            font-weight: 500;
          }
          .indicator {
            display: none;
          }
        }
      `}</style>
    </nav>
  );
};

export default Navigation;
