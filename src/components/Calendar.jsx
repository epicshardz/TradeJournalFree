import React, { useState } from 'react';
import { useAuth } from './SupabaseAuthProvider';
import { format, addMonths, subMonths, isSameMonth, isSameDay } from 'date-fns';
import { ChevronLeft, ChevronRight, Plus, X, Trash2, Pencil, TrendingUp, Target } from 'lucide-react';
import { getDaysInMonth, formatCurrency, getDailyPnL, getMonthStats } from '../utils/dateHelpers';

const Calendar = () => {
  const { journals, activeJournalId, addTrade, deleteTrade, updateTrade } = useAuth();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingTrade, setEditingTrade] = useState(null);
  const [shakingDay, setShakingDay] = useState(null);
  const [futureTip, setFutureTip] = useState({ show: false, x: 0, y: 0 });

  const activeJournal = journals.find(j => j.id === activeJournalId) || journals[0];
  const trades = activeJournal?.trades || [];

  const pastSymbols = [...new Set(trades.map(t => t.symbol))].sort();

  const days = getDaysInMonth(currentDate);
  const { totalPnL, winRate } = getMonthStats(trades, currentDate);

  const handlePrevMonth = () => setCurrentDate(subMonths(currentDate, 1));
  const handleNextMonth = () => setCurrentDate(addMonths(currentDate, 1));

  const handleAddTrade = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const tradeData = {
      journal_id: activeJournalId,
      date: selectedDate.toISOString(),
      pnl: parseFloat(formData.get('pnl')),
      notes: formData.get('notes'),
      symbol: formData.get('symbol'),
    };

    if (editingTrade) {
      await updateTrade(editingTrade.id, tradeData);
      setEditingTrade(null);
    } else {
      await addTrade(tradeData);
    }
    setShowAddModal(false);
  };

  const startEdit = (trade) => {
    setEditingTrade(trade);
  };

  const handleDayClick = (day, idx, e) => {
    const today = new Date();
    today.setHours(23, 59, 59, 999);

    if (day > today) {
      setShakingDay(idx);
      setFutureTip({
        show: true,
        x: e.clientX,
        y: e.clientY - 40
      });

      setTimeout(() => {
        setShakingDay(null);
        setFutureTip(prev => ({ ...prev, show: false }));
      }, 800);
      return;
    }

    setSelectedDate(day);
    setEditingTrade(null);
    setShowAddModal(true);
  };

  const getDayTrades = (day) => trades.filter(t => isSameDay(new Date(t.date), day));

  const monthGlowClass = totalPnL > 0 ? 'win-glow' : totalPnL < 0 ? 'loss-glow' : '';

  return (
    <div className="calendar-view">
      {futureTip.show && (
        <div
          className="future-tip-bubble"
          style={{ left: futureTip.x, top: futureTip.y }}
        >
          Cannot log future trades
        </div>
      )}
      <div className="calendar-header">
        <div className="month-nav">
          <button onClick={handlePrevMonth} className="nav-arrow"><ChevronLeft size={20} /></button>
          <h2>{format(currentDate, 'MMMM yyyy')}</h2>
          <button onClick={handleNextMonth} className="nav-arrow"><ChevronRight size={20} /></button>
        </div>
      </div>

      <div className="calendar-main-layout">
        <div className={`calendar-body card glass-effect ${monthGlowClass}`}>
          <div className="week-header">
            {['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'].map(day => (
              <div key={day} className="week-day">{day}</div>
            ))}
          </div>
          <div className="days-canvas">
            {days.map((day, idx) => {
              const dayPnL = getDailyPnL(trades, day);
              const dayTrades = getDayTrades(day);
              const isSelected = selectedDate && isSameDay(day, selectedDate);
              const currentMonth = isSameMonth(day, currentDate);
              const statusClass = dayPnL > 0 ? 'win' : dayPnL < 0 ? 'loss' : dayPnL === 0 && dayTrades.length > 0 ? 'neutral' : '';
              const isShaking = shakingDay === idx;

              return (
                <div
                  key={idx}
                  className={`day-box ${!currentMonth ? 'out-of-month' : ''} ${isSelected ? 'active' : ''} ${statusClass} ${isShaking ? 'shake' : ''}`}
                  onClick={(e) => handleDayClick(day, idx, e)}
                >
                  <div className="box-top">
                    <span className="date-num">{format(day, 'd')}</span>
                    {dayTrades.length > 0 && <span className="trade-badge">{dayTrades.length}</span>}
                  </div>

                  <div className="box-content">
                    <span className="pnl-text">
                      {dayTrades.length > 0 ? (dayPnL >= 0 ? `+${dayPnL.toFixed(0)}` : dayPnL.toFixed(0)) : ''}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="stats-sidebar">
          <div className="stat-pill win">
            <div className="pill-icon"><TrendingUp size={16} /></div>
            <div className="pill-info">
              <span className="pill-label">Total P&L</span>
              <span className="pill-value">{formatCurrency(totalPnL)}</span>
            </div>
          </div>
          <div className="stat-pill rate">
            <div className="pill-icon"><Target size={16} /></div>
            <div className="pill-info">
              <span className="pill-label">Win Rate</span>
              <span className="pill-value">{winRate.toFixed(1)}%</span>
            </div>
          </div>
        </div>
      </div>

      {showAddModal && (
        <div className="modal-overlay" onClick={() => setShowAddModal(false)}>
          <div className="modal-panel glass-premium" onClick={e => e.stopPropagation()}>
            <div className="modal-head">
              <h3>{format(selectedDate, 'MMMM d, yyyy')}</h3>
              <button className="close-btn" onClick={() => setShowAddModal(false)}><X /></button>
            </div>

            <div className="day-trades">
              {trades.filter(t => isSameDay(new Date(t.date), selectedDate)).map(trade => (
                <div key={trade.id} className={`compact-trade ${trade.pnl >= 0 ? 'win' : 'loss'}`}>
                  <div className="details">
                    <span className="sym">{trade.symbol}</span>
                    <span className={`pnl ${trade.pnl >= 0 ? 'win' : 'loss'}`}>{formatCurrency(trade.pnl)}</span>
                  </div>
                  <div className="actions">
                    <button onClick={() => startEdit(trade)} className="edit-btn"><Pencil size={14} /></button>
                    <button onClick={() => deleteTrade(trade.id)} className="del-btn"><Trash2 size={14} /></button>
                  </div>
                </div>
              ))}
            </div>

            <form onSubmit={handleAddTrade} className="trade-form">
              <div className="form-subheader">
                <h4>{editingTrade ? 'Edit entry' : 'Create new entry'}</h4>
              </div>
              <div className="f-group">
                <label>Instrument</label>
                <input
                  name="symbol"
                  list="symbols-list"
                  placeholder="e.g. BTCUSDT"
                  defaultValue={editingTrade?.symbol || ''}
                  required
                />
                <datalist id="symbols-list">
                  {pastSymbols.map(sym => <option key={sym} value={sym} />)}
                </datalist>
              </div>
              <div className="f-row">
                <div className="f-group">
                  <label>P&L ($)</label>
                  <input
                    name="pnl"
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    defaultValue={editingTrade?.pnl || ''}
                    required
                  />
                </div>
              </div>
              <div className="f-group">
                <label>Observation</label>
                <textarea
                  name="notes"
                  placeholder="Note your strategy or feelings..."
                  defaultValue={editingTrade?.notes || ''}
                ></textarea>
              </div>
              <button type="submit" className="add-btn-submit" disabled={!activeJournalId}>
                {editingTrade ? <Pencil size={18} /> : <Plus size={18} />}
                {editingTrade ? 'Update Trade' : 'Record Trade'}
              </button>
              {editingTrade && (
                <button type="button" className="cancel-edit" onClick={() => setEditingTrade(null)}>
                  Cancel Edit
                </button>
              )}
            </form>
          </div>
        </div>
      )}

      <style jsx>{`
        .calendar-view {
          display: flex;
          flex-direction: column;
          gap: 2rem;
          max-width: 1200px;
          margin: 0 auto;
          width: 100%;
        }

        .calendar-header {
          display: flex;
          justify-content: center;
          margin-bottom: 1.5rem;
        }

        .calendar-main-layout {
          display: flex;
          gap: 2rem;
          align-items: flex-start;
          width: 100%;
        }

        .calendar-body {
          flex: 1;
          min-width: 0; /* Allow grid to shrink if needed */
          padding: 1.5rem;
          border-radius: 24px;
          position: relative;
          transition: all 0.5s ease;
        }

        .stats-sidebar {
          display: flex;
          flex-direction: column;
          gap: 1rem;
          width: 200px;
          flex-shrink: 0;
        }

        .month-nav {
          display: flex;
          align-items: center;
          gap: 1.5rem;
        }

        .month-nav h2 {
          font-size: 1.75rem;
          font-weight: 800;
          min-width: 220px;
          text-align: center;
        }

        .nav-arrow {
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.1);
          color: white;
          padding: 0.5rem;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.3s ease;
        }

        .nav-arrow:hover {
          background: rgba(59, 130, 246, 0.1);
          border-color: #3b82f6;
        }

        .stat-pill {
          background: rgba(255, 255, 255, 0.04);
          border: 1px solid rgba(255, 255, 255, 0.08);
          padding: 1.25rem;
          border-radius: 20px;
          display: flex;
          align-items: center;
          gap: 1rem;
          width: 100%;
          transition: all 0.3s ease;
        }

        .stat-pill:hover {
          background: rgba(255, 255, 255, 0.06);
          border-color: rgba(255, 255, 255, 0.12);
          transform: translateX(-4px);
        }

        .pill-icon {
          width: 32px;
          height: 32px;
          border-radius: 10px;
          background: rgba(59, 130, 246, 0.1);
          color: #3b82f6;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .pill-info {
          display: flex;
          flex-direction: column;
        }

        .pill-label {
          font-size: 0.7rem;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          color: #94a3b8;
        }

        .pill-value {
          font-size: 1.1rem;
          font-weight: 700;
        }

        .calendar-body {
          padding: 1.5rem;
          border-radius: 24px;
          position: relative;
          transition: all 0.5s ease;
        }

        .calendar-body.win-glow {
          box-shadow: 0 0 40px -10px rgba(16, 185, 129, 0.1);
          background: linear-gradient(180deg, rgba(16, 185, 129, 0.05) 0%, rgba(17, 17, 21, 0) 100%);
        }

        .calendar-body.loss-glow {
          box-shadow: 0 0 40px -10px rgba(239, 68, 68, 0.1);
          background: linear-gradient(180deg, rgba(239, 68, 68, 0.05) 0%, rgba(17, 17, 21, 0) 100%);
        }

        .week-header {
          display: grid;
          grid-template-columns: repeat(7, 1fr);
          gap: 12px;
          margin-bottom: 1rem;
          position: relative;
          z-index: 1;
        }

        .week-day {
          text-align: center;
          font-size: 0.75rem;
          font-weight: 700;
          color: #64748b;
        }

        .days-canvas {
          display: grid;
          grid-template-columns: repeat(7, 1fr);
          gap: 10px;
          position: relative;
          z-index: 1;
        }

        .day-box {
          aspect-ratio: 1.1;
          background: #111115;
          border-radius: 16px;
          padding: 10px;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          cursor: pointer;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          border: 1px solid rgba(255, 255, 255, 0.03);
        }

        .day-box:hover {
          transform: translateY(-4px);
          filter: brightness(1.2);
          box-shadow: 0 10px 20px -5px rgba(0,0,0,0.5);
        }

        .box-top {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
        }

        .date-num {
          font-size: 0.9rem;
          font-weight: 700;
          color: #94a3b8;
        }

        .trade-badge {
          background: rgba(255, 255, 255, 0.1);
          color: white;
          font-size: 0.65rem;
          font-weight: 700;
          padding: 2px 6px;
          border-radius: 6px;
        }

        .box-content {
          text-align: center;
        }

        .pnl-text {
          font-size: 1rem;
          font-weight: 800;
          color: #fff;
        }

        /* Status Colors */
        .day-box.win {
          background: linear-gradient(135deg, #065f46, #047857);
          box-shadow: 0 4px 12px -2px rgba(5, 150, 105, 0.2);
        }
        .day-box.loss {
          background: linear-gradient(135deg, #991b1b, #b91c1c);
          box-shadow: 0 4px 12px -2px rgba(220, 38, 38, 0.2);
        }
        .day-box.neutral {
          background: #27272a;
        }
        .day-box.active {
          box-shadow: 0 0 0 2px #3b82f6;
        }
        .future-tip-bubble {
          position: fixed;
          background: #ef4444;
          color: white;
          padding: 0.5rem 1rem;
          border-radius: 12px;
          font-size: 0.8rem;
          font-weight: 700;
          z-index: 9999;
          transform: translate(-50%, -100%);
          pointer-events: none;
          box-shadow: 0 10px 25px -5px rgba(239, 68, 68, 0.4);
          animation: floatIn 0.3s ease-out;
        }

        @keyframes floatIn {
          from { opacity: 0; transform: translate(-50%, -80%); }
          to { opacity: 1; transform: translate(-50%, -100%); }
        }

        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          20% { transform: translateX(-4px); }
          40% { transform: translateX(4px); }
          60% { transform: translateX(-4px); }
          80% { transform: translateX(4px); }
        }

        .shake {
          animation: shake 0.4s cubic-bezier(.36,.07,.19,.97) both;
          border-color: rgba(239, 68, 68, 0.5) !important;
        }

        .day-box.out-of-month {
          opacity: 0.1;
          pointer-events: none;
        }
        .day-box:not(.out-of-month) {
          cursor: pointer;
        }
        .day-box:not(.out-of-month):hover {
          filter: brightness(1.2);
        }

        /* Modal styling */
        .modal-overlay {
          position: fixed;
          top: 0; left: 0; right: 0; bottom: 0;
          background: rgba(0, 0, 0, 0.85);
          z-index: 2000;
          display: flex;
          justify-content: center;
          align-items: center;
          backdrop-filter: blur(8px);
        }

        .modal-panel {
          width: 90%;
          max-width: 440px;
          padding: 2rem;
          border-radius: 28px;
          border: 1px solid rgba(255, 255, 255, 0.1);
          box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
        }

        .modal-head {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1.5rem;
        }

        .modal-head h3 {
          font-size: 1.25rem;
          font-weight: 800;
        }

        .close-btn {
          background: rgba(255, 255, 255, 0.05) !important;
          border: none;
          color: #64748b;
          padding: 0.5rem;
          border-radius: 10px;
          cursor: pointer;
        }

        .day-trades {
          margin-bottom: 1.5rem;
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
          max-height: 200px;
          overflow-y: auto;
        }

        .compact-trade {
          display: flex;
          justify-content: space-between;
          align-items: center;
          background: rgba(255, 255, 255, 0.01);
          padding: 0.75rem 1rem;
          border-radius: 12px;
          border: 1px solid rgba(255, 255, 255, 0.03);
          transition: all 0.3s ease;
        }

        .compact-trade.win {
          background: rgba(16, 185, 129, 0.08);
          border-color: rgba(16, 185, 129, 0.15);
        }

        .compact-trade.loss {
          background: rgba(239, 68, 68, 0.08);
          border-color: rgba(239, 68, 68, 0.15);
        }

        .compact-trade .details {
          display: flex;
          gap: 1rem;
          align-items: center;
        }

        .compact-trade .sym {
          font-weight: 700;
          font-size: 0.85rem;
          color: #94a3b8;
        }

        .compact-trade .pnl {
          font-weight: 800;
          font-size: 0.95rem;
        }

        .compact-trade .pnl.win { color: #10b981; }
        .compact-trade .pnl.loss { color: #ef4444; }

        .compact-trade .actions {
          display: flex;
          gap: 0.5rem;
        }

        .compact-trade button {
          background: rgba(255, 255, 255, 0.05);
          border: none;
          padding: 0.4rem;
          border-radius: 8px;
          color: #64748b;
          cursor: pointer;
          transition: all 0.2s;
        }

        .edit-btn:hover { background: rgba(59, 130, 246, 0.2); color: #3b82f6; }
        .del-btn:hover { background: rgba(239, 68, 68, 0.2); color: #ef4444; }

        .form-subheader {
          margin-top: 0.5rem;
          margin-bottom: -0.5rem;
          border-left: 3px solid #3b82f6;
          padding-left: 0.75rem;
        }

        .form-subheader h4 {
          font-size: 0.9rem;
          font-weight: 700;
          color: #fff;
          margin: 0;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        .trade-form {
          display: flex;
          flex-direction: column;
          gap: 1.25rem;
        }

        .f-group {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .f-group label {
          font-size: 0.8rem;
          font-weight: 600;
          color: #64748b;
          margin-left: 0.25rem;
        }

        .f-group input, .f-group textarea {
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 12px;
          padding: 0.875rem;
          color: white;
          font-size: 0.95rem;
          transition: all 0.3s ease;
        }

        .f-group input:focus {
          border-color: #3b82f6;
          outline: none;
        }

        .add-btn-submit {
          background: linear-gradient(135deg, #3b82f6, #2563eb);
          color: white;
          padding: 1rem;
          border-radius: 14px;
          font-weight: 700;
          margin-top: 0.5rem;
          box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
          cursor: pointer;
          border: none;
        }

        .cancel-edit {
          background: transparent;
          border: 1px solid rgba(255, 255, 255, 0.1);
          color: #94a3b8;
          padding: 0.75rem;
          border-radius: 12px;
          font-size: 0.85rem;
          cursor: pointer;
        }

        @media (max-width: 768px) {
          .calendar-view {
            padding: 0.25rem;
            gap: 1rem;
          }

          .calendar-main-layout {
            flex-direction: column;
            gap: 1rem;
          }

          .stats-sidebar {
            width: 100%;
            flex-direction: row;
            order: -1;
            gap: 0.5rem;
          }

          .stat-pill {
            padding: 0.5rem 0.75rem;
            min-width: 0;
            flex: 1;
            border-radius: 12px;
          }

          .pill-icon {
            width: 24px;
            height: 24px;
          }

          .pill-label {
            font-size: 0.6rem;
          }

          .pill-value {
            font-size: 0.9rem;
          }

          .stat-pill:hover {
            transform: translateY(-2px);
          }

          .month-nav h2 {
            font-size: 1.25rem;
            min-width: 150px;
          }

          .calendar-body {
            padding: 0.5rem;
            border-radius: 16px;
          }

          .week-header {
            gap: 2px;
            margin-bottom: 0.5rem;
          }

          .week-day {
            font-size: 0.6rem;
          }

          .days-canvas {
            gap: 2px;
          }

          .day-box {
            padding: 2px;
            border-radius: 6px;
            aspect-ratio: 1;
            min-width: 0;
          }

          .date-num {
            font-size: 0.65rem;
          }

          .trade-badge {
            padding: 1px 3px;
            font-size: 0.55rem;
            border-radius: 4px;
          }

          .pnl-text {
            font-size: 0.65rem;
            letter-spacing: -0.02em;
          }
        }

        @media (max-width: 400px) {
          .pnl-text {
            font-size: 0.55rem;
          }
          .pill-label {
            display: none;
          }
        }
      `}</style>
    </div>
  );
};

export default Calendar;
