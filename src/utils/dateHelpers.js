import { format, startOfMonth, endOfMonth, startOfWeek, endOfWeek, eachDayOfInterval, isSameMonth, isSameDay, addMonths, subMonths } from 'date-fns';

export const getDaysInMonth = (date) => {
    const start = startOfWeek(startOfMonth(date));
    const end = endOfWeek(endOfMonth(date));
    return eachDayOfInterval({ start, end });
};

export const formatCurrency = (amount, currency = 'USD') => {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: currency,
    }).format(amount);
};

export const getDailyPnL = (trades, date) => {
    return trades
        .filter(trade => isSameDay(new Date(trade.date), date))
        .reduce((sum, trade) => sum + Number(trade.pnl), 0);
};

export const getMonthStats = (trades, date) => {
    const monthTrades = trades.filter(trade => isSameMonth(new Date(trade.date), date));
    const totalPnL = monthTrades.reduce((sum, trade) => sum + Number(trade.pnl), 0);

    // Sum manual win/loss counts; fall back to pnl-based counting for legacy entries
    let winCount = 0;
    let lossCount = 0;
    monthTrades.forEach(t => {
        const w = Number(t.num_wins) || 0;
        const l = Number(t.num_losses) || 0;
        if (w > 0 || l > 0) {
            winCount += w;
            lossCount += l;
        } else {
            // Legacy fallback: count the entry itself
            if (Number(t.pnl) > 0) winCount += 1;
            else if (Number(t.pnl) < 0) lossCount += 1;
        }
    });

    const totalTrades = winCount + lossCount;
    const winRate = totalTrades > 0 ? (winCount / totalTrades) * 100 : 0;

    return { totalPnL, winRate, totalTrades };
};
