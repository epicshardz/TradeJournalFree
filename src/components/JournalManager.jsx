import React, { useState } from 'react';
import { useAuth } from './SupabaseAuthProvider';
import { LogOut, Plus, Trash2, CheckCircle, Wallet } from 'lucide-react';
import { formatCurrency } from '../utils/dateHelpers';

const JournalManager = () => {
  const { user, logout, journals, activeJournalId, setActiveJournalId, addJournal, deleteJournal } = useAuth();
  const [newJournalName, setNewJournalName] = useState('');
  const [initialBalance, setInitialBalance] = useState('0');

  const handleCreateJournal = async (e) => {
    e.preventDefault();
    if (!newJournalName.trim()) return;
    await addJournal(newJournalName, initialBalance);
    setNewJournalName('');
    setInitialBalance('0');
  };

  return (
    <div className="settings-view">
      <section className="user-profile card">
        <div className="profile-info">
          {user.user_metadata.avatar_url || user.user_metadata.picture ? (
            <img src={user.user_metadata.avatar_url || user.user_metadata.picture} alt={user.email} className="avatar" />
          ) : (
            <div className="avatar-initial">
              {user.email.charAt(0).toUpperCase()}
            </div>
          )}
          <div className="details">
            <h3>{user.user_metadata.full_name || user.email.split('@')[0]}</h3>
            <span className="email">{user.email}</span>
          </div>
        </div>
        <button onClick={logout} className="logout-btn">
          <LogOut size={18} /> Sign Out
        </button>
      </section>

      <section className="journals-section">
        <div className="section-header">
          <h3>My Journals</h3>
          <p>Switch between accounts or create new ones.</p>
        </div>

        <div className="journals-list">
          {journals.map((journal) => (
            <div
              key={journal.id}
              className={`journal-card card ${activeJournalId === journal.id ? 'active' : ''}`}
              onClick={() => setActiveJournalId(journal.id)}
            >
              <div className="journal-info">
                <div className="title-row">
                  <Wallet size={18} className="icon" />
                  <h4>{journal.name}</h4>
                  {activeJournalId === journal.id && <CheckCircle size={16} className="active-icon" />}
                </div>
                <span className="balance">
                  Starting: {formatCurrency(journal.initial_balance)}
                </span>
                <span className="trade-count">
                  {journal.trades?.length || 0} trades recorded
                </span>
              </div>

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  deleteJournal(journal.id);
                }}
                className="delete-icon-btn"
                disabled={journals.length <= 1}
              >
                <Trash2 size={16} />
              </button>
            </div>
          ))}
        </div>

        <div className="add-journal card">
          <h4>Create New Journal</h4>
          <form onSubmit={handleCreateJournal} className="add-form">
            <div className="form-group">
              <input
                value={newJournalName}
                onChange={e => setNewJournalName(e.target.value)}
                placeholder="Account Name (e.g. Apex Funded)"
                required
              />
            </div>
            <div className="form-group">
              <input
                type="number"
                value={initialBalance}
                onChange={e => setInitialBalance(e.target.value)}
                placeholder="Initial Balance"
              />
            </div>
            <button type="submit" className="add-btn">
              <Plus size={18} /> Create
            </button>
          </form>
        </div>
      </section>

      <style jsx>{`
        .settings-view { display: flex; flex-direction: column; gap: 2rem; }
        .user-profile { display: flex; justify-content: space-between; align-items: center; padding: 1rem; }
        .profile-info { display: flex; align-items: center; gap: 1rem; }
        .avatar { width: 48px; height: 48px; border-radius: 50%; }
        .avatar-initial {
          width: 48px;
          height: 48px;
          border-radius: 50%;
          background: var(--accent-color);
          color: #fff;
          display: flex;
          justify-content: center;
          align-items: center;
          font-weight: 700;
          font-size: 1.5rem;
        }
        .details h3 { margin: 0; font-size: 1.1rem; }
        .details .email { font-size: 0.8rem; color: var(--text-secondary); }
        .logout-btn { color: var(--danger); font-weight: 600; font-size: 0.9rem; display: flex; align-items: center; gap: 0.5rem; padding: 0.5rem; }
        .section-header { margin-bottom: 1.5rem; }
        .section-header h3 { margin: 0; font-size: 1.25rem; }
        .section-header p { font-size: 0.9rem; color: var(--text-secondary); }
        .journals-list { display: flex; flex-direction: column; gap: 1rem; margin-bottom: 2rem; }
        .journal-card { display: flex; justify-content: space-between; align-items: center; cursor: pointer; transition: var(--transition-fast); }
        .journal-card.active { border-color: var(--accent-color); background: rgba(59, 130, 246, 0.05); }
        .journal-info { display: flex; flex-direction: column; gap: 0.25rem; }
        .title-row { display: flex; align-items: center; gap: 0.75rem; }
        .title-row .icon { color: var(--text-secondary); }
        .journal-card.active .title-row .icon { color: var(--accent-color); }
        .title-row h4 { margin: 0; font-size: 1.05rem; }
        .active-icon { color: var(--accent-color); }
        .balance, .trade-count { font-size: 0.8rem; color: var(--text-secondary); margin-left: 2.15rem; }
        .delete-icon-btn { color: var(--text-secondary); padding: 0.5rem; border-radius: 8px; transition: var(--transition-fast); }
        .delete-icon-btn:hover:not(:disabled) { color: var(--danger); background: rgba(239, 68, 68, 0.1); }
        .delete-icon-btn:disabled { opacity: 0.3; }
        .add-journal { padding: 1.5rem; }
        .add-journal h4 { margin-top: 0; margin-bottom: 1rem; }
        .add-form { display: flex; flex-direction: column; gap: 1rem; }
        .add-form input { width: 100%; background: #1a1a1c; border: 1px solid var(--card-border); border-radius: var(--radius-sm); padding: 0.75rem; color: #fff; }
        .add-btn { background: #fff; color: #000; padding: 0.75rem; border-radius: var(--radius-sm); font-weight: 700; display: flex; justify-content: center; align-items: center; gap: 0.5rem; }
      `}</style>
    </div>
  );
};

export default JournalManager;
