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
    const winCount = monthTrades.filter(t => t.pnl > 0).length;
    const totalTrades = monthTrades.length;
    const winRate = totalTrades > 0 ? (winCount / totalTrades) * 100 : 0;

    return { totalPnL, winRate, totalTrades };
};
