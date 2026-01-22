import React from 'react';
import { useAuth } from './SupabaseAuthProvider';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { formatCurrency } from '../utils/dateHelpers';
import { TrendingUp, TrendingDown, Activity, Target } from 'lucide-react';

const Dashboard = () => {
  const { journals, activeJournalId } = useAuth();

  const activeJournal = journals.find(j => j.id === activeJournalId) || journals[0];
  const trades = activeJournal?.trades || [];

  const sortedTrades = [...trades].sort((a, b) => new Date(a.date) - new Date(b.date));

  let currentBalance = parseFloat(activeJournal?.initial_balance) || 0;
  const chartData = sortedTrades.map((trade, index) => {
    currentBalance += parseFloat(trade.pnl);
    return {
      name: new Date(trade.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
      balance: currentBalance,
      pnl: trade.pnl,
      index: index + 1
    };
  });

  const totalPnL = trades.reduce((sum, t) => sum + parseFloat(t.pnl), 0);
  const winCount = trades.filter(t => t.pnl > 0).length;
  const lossCount = trades.length - winCount;
  const winRate = trades.length > 0 ? (winCount / trades.length) * 100 : 0;

  const avgProfit = winCount > 0 ? trades.filter(t => t.pnl > 0).reduce((sum, t) => sum + parseFloat(t.pnl), 0) / winCount : 0;
  const avgLoss = lossCount > 0 ? trades.filter(t => t.pnl < 0).reduce((sum, t) => sum + parseFloat(t.pnl), 0) / lossCount : 0;

  const stats = [
    { label: 'Total P&L', value: formatCurrency(totalPnL), icon: Activity, color: totalPnL >= 0 ? 'var(--success)' : 'var(--danger)' },
    { label: 'Win Rate', value: `${winRate.toFixed(1)}%`, icon: Target, color: 'var(--accent-color)' },
    { label: 'Avg Profit', value: formatCurrency(avgProfit), icon: TrendingUp, color: 'var(--success)' },
    { label: 'Avg Loss', value: formatCurrency(avgLoss), icon: TrendingDown, color: 'var(--danger)' },
  ];

  return (
    <div className="dashboard-view">
      <div className="stats-grid">
        {stats.map((stat, i) => (
          <div key={i} className="stat-card card">
            <div className="stat-header">
              <span className="label">{stat.label}</span>
              <stat.icon size={18} style={{ color: stat.color }} />
            </div>
            <span className="value" style={{ color: stat.color }}>{stat.value}</span>
          </div>
        ))}
      </div>

      <div className="chart-section card">
        <div className="chart-header">
          <h3>Equity Curve</h3>
          <span className="subtitle">Account growth for {activeJournal?.name || 'Journal'}</span>
        </div>
        <div className="chart-container">
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="colorBalance" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--accent-color)" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="var(--accent-color)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#242428" vertical={false} />
              <XAxis dataKey="name" stroke="#a1a1aa" fontSize={12} tickLine={false} axisLine={false} minTickGap={30} />
              <YAxis stroke="#a1a1aa" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(val) => `$${val}`} />
              <Tooltip contentStyle={{ backgroundColor: '#16161a', border: '1px solid #242428', borderRadius: '8px' }} itemStyle={{ color: '#fff' }} formatter={(value) => formatCurrency(value)} />
              <Area type="monotone" dataKey="balance" stroke="var(--accent-color)" strokeWidth={3} fillOpacity={1} fill="url(#colorBalance)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="recent-trades-section card">
        <div className="section-header"><h3>Recent Trades</h3></div>
        <div className="trades-table">
          {sortedTrades.slice().reverse().slice(0, 5).map((trade) => (
            <div key={trade.id} className="trade-row">
              <div className="trade-meta">
                <span className="symbol">{trade.symbol}</span>
                <span className="date">{new Date(trade.date).toLocaleDateString()}</span>
              </div>
              <span className={`pnl ${parseFloat(trade.pnl) >= 0 ? 'pos' : 'neg'}`}>
                {parseFloat(trade.pnl) >= 0 ? '+' : ''}{formatCurrency(trade.pnl)}
              </span>
            </div>
          ))}
          {trades.length === 0 && <div className="empty-state">No trades recorded yet.</div>}
        </div>
      </div>

      <style jsx>{`
        .dashboard-view { display: flex; flex-direction: column; gap: 1.5rem; }
        .stats-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 1rem; }
        .stat-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.5rem; }
        .stat-card .label { font-size: 0.8rem; color: var(--text-secondary); }
        .stat-card .value { font-size: 1.25rem; font-weight: 700; }
        .chart-section { padding: 1.5rem 1rem; }
        .chart-header { margin-bottom: 1.5rem; }
        .chart-header .subtitle { font-size: 0.8rem; color: var(--text-secondary); }
        .chart-container { width: 100%; margin-left: -10px; }
        .section-header { margin-bottom: 1rem; }
        .trades-table { display: flex; flex-direction: column; }
        .trade-row { display: flex; justify-content: space-between; align-items: center; padding: 1rem 0; border-bottom: 1px solid var(--card-border); }
        .trade-row:last-child { border-bottom: none; }
        .trade-meta { display: flex; flex-direction: column; }
        .trade-meta .symbol { font-weight: 600; }
        .trade-meta .date { font-size: 0.75rem; color: var(--text-secondary); }
        .trade-row .pnl { font-weight: 700; }
        .pos { color: var(--success); }
        .neg { color: var(--danger); }
        .empty-state { padding: 2rem; text-align: center; color: var(--text-secondary); }
        @media (min-width: 769px) { .stats-grid { grid-template-columns: repeat(4, 1fr); } }
      `}</style>
    </div>
  );
};

export default Dashboard;
