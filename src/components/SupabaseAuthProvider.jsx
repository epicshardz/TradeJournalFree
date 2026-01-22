import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../api/supabaseClient';

const SupabaseAuthContext = createContext();

export const useAuth = () => useContext(SupabaseAuthContext);

export const SupabaseAuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [journals, setJournals] = useState([]);
    const [activeJournalId, setActiveJournalId] = useState(null);

    useEffect(() => {
        // Check active sessions and sets the user
        const getSession = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            setUser(session?.user ?? null);
            if (session?.user) {
                fetchJournals(session.user.id);
            }
            setLoading(false);
        };

        getSession();

        // Listen for changes on auth state
        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
            setUser(session?.user ?? null);
            if (session?.user) {
                fetchJournals(session.user.id);
            } else {
                setJournals([]);
                setActiveJournalId(null);
            }
            setLoading(false);
        });

        return () => subscription.unsubscribe();
    }, []);

    const fetchJournals = async (userId) => {
        const { data, error } = await supabase
            .from('journals')
            .select('*, trades(*)')
            .eq('user_id', userId)
            .order('created_at', { ascending: true });

        if (error) {
            console.error('Error fetching journals:', error);
        } else {
            setJournals(data || []);
            if (data && data.length > 0 && !activeJournalId) {
                setActiveJournalId(data[0].id);
            }
        }
    };

    const signInWithEmail = async (email, password) => {
        const { error } = await supabase.auth.signInWithPassword({
            email,
            password,
        });
        if (error) throw error;
    };

    const signUpWithEmail = async (email, password) => {
        const { error } = await supabase.auth.signUp({
            email,
            password,
        });
        if (error) throw error;
    };

    const logout = async () => {
        const { error } = await supabase.auth.signOut();
        if (error) console.error('Error logging out:', error);
    };

    const addTrade = async (trade) => {
        const { data, error } = await supabase
            .from('trades')
            .insert([{ ...trade, user_id: user.id }])
            .select();

        if (error) {
            console.error('Error adding trade:', error);
            return null;
        }
        fetchJournals(user.id);
        return data[0];
    };

    const deleteTrade = async (tradeId) => {
        const { error } = await supabase
            .from('trades')
            .delete()
            .eq('id', tradeId);

        if (error) {
            console.error('Error deleting trade:', error);
        } else {
            fetchJournals(user.id);
        }
    };

    const updateTrade = async (tradeId, updates) => {
        const { data, error } = await supabase
            .from('trades')
            .update(updates)
            .eq('id', tradeId)
            .select();

        if (error) {
            console.error('Error updating trade:', error);
            return null;
        }
        fetchJournals(user.id);
        return data[0];
    };

    const addJournal = async (name, initialBalance) => {
        const { data, error } = await supabase
            .from('journals')
            .insert([{
                name,
                initial_balance: parseFloat(initialBalance),
                user_id: user.id
            }])
            .select();

        if (error) {
            console.error('Error adding journal:', error);
        } else {
            fetchJournals(user.id);
            setActiveJournalId(data[0].id);
        }
    };

    const deleteJournal = async (journalId) => {
        const { error } = await supabase
            .from('journals')
            .delete()
            .eq('id', journalId);

        if (error) {
            console.error('Error deleting journal:', error);
        } else {
            fetchJournals(user.id);
        }
    };

    const value = {
        user,
        loading,
        journals,
        activeJournalId,
        setActiveJournalId,
        signInWithEmail,
        signUpWithEmail,
        logout,
        addTrade,
        deleteTrade,
        updateTrade,
        addJournal,
        deleteJournal
    };

    return (
        <SupabaseAuthContext.Provider value={value}>
            {children}
        </SupabaseAuthContext.Provider>
    );
};
