import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { useApp } from '../contexts/AppContext';
import { ArrowLeft, Moon, Sun, Ruler, Car, Shield, Database, RefreshCw } from 'lucide-react';
import toast from 'react-hot-toast';

const Settings = () => {
    const { darkMode, setDarkMode, units, setUnits } = useApp();

    const handleClearCache = () => {
        localStorage.clear();
        toast.success('Cache vyčištěna');
        setTimeout(() => window.location.reload(), 1000);
    };

    const handleSync = () => {
        toast.loading('Synchronizace s vozidly...', { duration: 2000 });
        setTimeout(() => {
            toast.success('Data aktualizována');
        }, 2000);
    };

    return (
        <div className="min-h-screen relative overflow-hidden">
            <div className="fixed inset-0 z-0">
                <div className="absolute top-1/4 left-1/3 w-64 h-64 bg-neon-cyan rounded-full blur-[80px] opacity-20" />
                <div className="absolute bottom-1/4 right-1/3 w-64 h-64 bg-neon-purple rounded-full blur-[80px] opacity-20" />
            </div>

            <div className="relative z-10 container mx-auto px-4 py-8">
                <motion.div
                    initial={{ x: -100, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    className="flex items-center gap-4 mb-8"
                >
                    <Link to="/" className="glass p-3 rounded-full hover:scale-110 transition-transform">
                        <ArrowLeft className="text-neon-cyan" size={24} />
                    </Link>
                    <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-neon-cyan to-neon-purple bg-clip-text text-transparent">
                        NASTAVENÍ
                    </h1>
                </motion.div>

                <div className="max-w-2xl mx-auto space-y-4">
                    <motion.div
                        initial={{ y: 30, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.1 }}
                        className="glass rounded-2xl p-6"
                    >
                        <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
                            <Car size={20} className="text-neon-cyan" />
                            VZHLED
                        </h2>
                        <div className="flex items-center justify-between p-4 glass rounded-xl">
                            <div className="flex items-center gap-3">
                                {darkMode ? <Moon size={20} className="text-neon-cyan" /> : <Sun size={20} className="text-neon-cyan" />}
                                <span>Tmavý režim</span>
                            </div>
                            <button
                                onClick={() => setDarkMode(!darkMode)}
                                className={`relative w-12 h-6 rounded-full transition-colors ${darkMode ? 'bg-neon-cyan' : 'bg-gray-600'}`}
                            >
                                <div
                                    className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${darkMode ? 'right-1' : 'left-1'}`}
                                />
                            </button>
                        </div>
                    </motion.div>

                    <motion.div
                        initial={{ y: 30, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.2 }}
                        className="glass rounded-2xl p-6"
                    >
                        <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
                            <Ruler size={20} className="text-neon-cyan" />
                            JEDNOTKY
                        </h2>
                        <div className="flex gap-3">
                            <button
                                onClick={() => setUnits('metric')}
                                className={`flex-1 py-3 rounded-xl font-bold transition-all ${
                                    units === 'metric'
                                        ? 'bg-gradient-to-r from-neon-cyan to-neon-purple'
                                        : 'glass hover:bg-neon-cyan/20'
                                }`}
                            >
                                Kilometry (km)
                            </button>
                            <button
                                onClick={() => setUnits('imperial')}
                                className={`flex-1 py-3 rounded-xl font-bold transition-all ${
                                    units === 'imperial'
                                        ? 'bg-gradient-to-r from-neon-cyan to-neon-purple'
                                        : 'glass hover:bg-neon-cyan/20'
                                }`}
                            >
                                Míle (mi)
                            </button>
                        </div>
                    </motion.div>

                    <motion.div
                        initial={{ y: 30, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.3 }}
                        className="glass rounded-2xl p-6"
                    >
                        <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
                            <Database size={20} className="text-neon-cyan" />
                            DATA
                        </h2>
                        <div className="space-y-3">
                            <button
                                onClick={handleSync}
                                className="w-full glass py-3 rounded-xl hover:bg-neon-cyan/20 transition-all flex items-center justify-center gap-2"
                            >
                                <RefreshCw size={18} />
                                Synchronizovat s API
                            </button>
                            <button
                                onClick={handleClearCache}
                                className="w-full glass py-3 rounded-xl hover:bg-red-500/20 transition-all text-red-400 flex items-center justify-center gap-2"
                            >
                                <Shield size={18} />
                                Vyčistit cache
                            </button>
                        </div>
                    </motion.div>

                    <motion.div
                        initial={{ y: 30, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.4 }}
                        className="glass rounded-2xl p-6 text-center"
                    >
                        <h2 className="text-lg font-bold mb-2">MOJE GARÁŽ NEXT</h2>
                        <p className="text-gray-400 text-sm">Verze 2.0 | SCI-FI EDITION</p>
                        <p className="text-gray-500 text-xs mt-4">
                            © 2024 | Správce vašich vozidel s podporou Smartcar API
                        </p>
                    </motion.div>
                </div>
            </div>
        </div>
    );
};

export default Settings;