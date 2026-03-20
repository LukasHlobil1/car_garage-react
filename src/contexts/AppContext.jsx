import React, { createContext, useContext, useState, useEffect } from 'react';
import { initAuth, getCars } from '../lib/firebase';
import toast from 'react-hot-toast';

const AppContext = createContext();

export const useApp = () => {
    const context = useContext(AppContext);
    if (!context) throw new Error('useApp must be used within AppProvider');
    return context;
};

export const AppProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [cars, setCars] = useState([]);
    const [loading, setLoading] = useState(true);
    const [darkMode, setDarkMode] = useState(() => {
        const saved = localStorage.getItem('darkMode');
        return saved ? JSON.parse(saved) : true;
    });
    const [units, setUnits] = useState(() => {
        const saved = localStorage.getItem('units');
        return saved || 'metric';
    });

    useEffect(() => {
        localStorage.setItem('darkMode', JSON.stringify(darkMode));
        if (darkMode) {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
    }, [darkMode]);

    useEffect(() => {
        localStorage.setItem('units', units);
    }, [units]);

    useEffect(() => {
        const init = async () => {
            try {
                const userData = await initAuth();
                setUser(userData);
                const carsData = await getCars(userData.uid);
                setCars(carsData);
            } catch (error) {
                toast.error('Chyba při inicializaci');
            } finally {
                setLoading(false);
            }
        };
        init();
    }, []);

    const value = {
        user,
        cars,
        setCars,
        loading,
        darkMode,
        setDarkMode,
        units,
        setUnits,
    };

    return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};