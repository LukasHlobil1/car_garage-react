import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useParams, Link } from 'react-router-dom';
import { useApp } from '../contexts/AppContext';
import { smartcarAPI } from '../services/smartcar';
import {
    ArrowLeft, Gauge, Battery, Thermometer, Activity,
    Lock, Unlock, Zap, Wifi, MapPin, Clock, History,
    Car, Fan, Radio
} from 'lucide-react';
import toast from 'react-hot-toast';
import { updateCarStatus, saveCarHistory } from '../lib/firebase';

const CarDetail = () => {
    const { id } = useParams();
    const { user, units } = useApp();
    const [car, setCar] = useState(null);
    const [loading, setLoading] = useState(true);
    const [commandLoading, setCommandLoading] = useState(false);
    const [isSmartcarConnected, setIsSmartcarConnected] = useState(false);
    const [smartcarToken, setSmartcarToken] = useState(null);

    useEffect(() => {
        const loadCar = async () => {
            setLoading(true);

            const savedToken = localStorage.getItem('smartcar_access_token');
            const savedCars = localStorage.getItem('last_cars_data');

            if (savedToken) {
                setSmartcarToken(savedToken);
                setIsSmartcarConnected(true);

                try {
                    // Načtení reálných dat z API
                    const status = await smartcarAPI.getVehicleStatus(id, savedToken);

                    // Zde byste měli mít mapování na vaše auto
                    // Pro demo vytvoříme základní strukturu
                    setCar({
                        id: id,
                        brand: 'Škoda', // Z API byste získali reálné údaje
                        model: 'Octavia',
                        year: 2023,
                        plate: '5E8 1234',
                        isReal: true,
                        status: {
                            odometer: status.odometer,
                            fuel: status.fuel,
                            locked: status.locked,
                            location: status.location,
                            engineTemp: 92,
                            battery: 12.4,
                            lastUpdated: new Date().toISOString()
                        },
                        history: []
                    });
                } catch (error) {
                    toast.error('Chyba načítání dat vozidla');
                    // Fallback na demo data
                    setCar({
                        id: id,
                        brand: 'Škoda',
                        model: 'Octavia',
                        year: 2023,
                        plate: '5E8 1234',
                        isReal: false,
                        status: {
                            odometer: 45230,
                            fuel: 65,
                            locked: true,
                            engineTemp: 92,
                            battery: 12.4,
                            lastUpdated: new Date().toISOString()
                        },
                        history: [
                            { date: '2024-03-15', action: 'Servis', value: 'Výměna oleje' }
                        ]
                    });
                }
            } else {
                // Demo data podle ID
                if (id === 'skoda-octavia-demo' || id === '1') {
                    setCar({
                        id: id,
                        brand: 'Škoda',
                        model: 'Octavia RS',
                        year: 2023,
                        plate: '5E8 1234',
                        isReal: false,
                        status: {
                            odometer: 45230,
                            fuel: 65,
                            locked: true,
                            engineTemp: 92,
                            battery: 12.4,
                            location: { lat: 50.0755, lng: 14.4378 },
                            lastUpdated: new Date().toISOString()
                        },
                        history: [
                            { date: '2024-03-15', action: 'Servis', value: 'Výměna oleje' },
                            { date: '2024-03-10', action: 'Zamknuto', value: 'Dálkově' }
                        ]
                    });
                } else {
                    setCar({
                        id: id,
                        brand: 'Mazda',
                        model: 'CX-5 SkyActiv',
                        year: 2022,
                        plate: '6E9 5678',
                        isReal: false,
                        status: {
                            odometer: 18340,
                            fuel: 42,
                            locked: false,
                            engineTemp: 88,
                            battery: 12.6,
                            location: { lat: 50.0785, lng: 14.4208 },
                            lastUpdated: new Date().toISOString()
                        },
                        history: [
                            { date: '2024-03-12', action: 'Odemknuto', value: 'Aplikací' }
                        ]
                    });
                }
            }

            setLoading(false);
        };

        loadCar();
    }, [id]);

    const formatDistance = (km) => {
        if (units === 'imperial') return `${Math.round(km * 0.621371)} mi`;
        return `${km.toLocaleString()} km`;
    };

    const handleLockToggle = async () => {
        if (!isSmartcarConnected || !smartcarToken) {
            toast.error('Pro ovládání auta se nejprve připojte k Smartcar');
            return;
        }

        setCommandLoading(true);

        try {
            if (car.status.locked) {
                await smartcarAPI.unlockVehicle(car.id, smartcarToken);
                toast.success(`Auto ${car.brand} ${car.model} bylo odemknuto`);
            } else {
                await smartcarAPI.lockVehicle(car.id, smartcarToken);
                toast.success(`Auto ${car.brand} ${car.model} bylo zamknuto`);
            }

            const newStatus = await smartcarAPI.getVehicleStatus(car.id, smartcarToken);
            setCar({
                ...car,
                status: {
                    ...car.status,
                    locked: newStatus.locked,
                    odometer: newStatus.odometer,
                    fuel: newStatus.fuel,
                    lastUpdated: new Date().toISOString()
                }
            });

            if (user) {
                await saveCarHistory(user.uid, car.id, {
                    action: car.status.locked ? 'unlock' : 'lock',
                    result: 'success',
                    timestamp: new Date().toISOString()
                });
            }

        } catch (error) {
            console.error('Chyba při ovládání:', error);
            toast.error('Nepodařilo se provést příkaz');
        } finally {
            setCommandLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="w-16 h-16 border-4 border-neon-cyan border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    if (!car) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <Car size={64} className="mx-auto mb-4 text-gray-600" />
                    <h2 className="text-2xl font-bold mb-2">Auto nenalezeno</h2>
                    <Link to="/" className="text-neon-cyan hover:underline">
                        ← Zpět do garáže
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen relative overflow-hidden">
            <div className="fixed inset-0 z-0">
                <div className="absolute top-20 left-1/4 w-96 h-96 bg-neon-cyan rounded-full blur-[100px] opacity-20 animate-pulse" />
                <div className="absolute bottom-20 right-1/4 w-96 h-96 bg-neon-purple rounded-full blur-[100px] opacity-20 animate-pulse" />
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
                    <div>
                        <h1 className="text-4xl md:text-5xl font-bold">
                            {car.brand} {car.model}
                        </h1>
                        <p className="text-neon-cyan text-sm mt-1">{car.plate}</p>
                        {!isSmartcarConnected && (
                            <p className="text-gray-400 text-xs mt-1">(DEMO REŽIM)</p>
                        )}
                    </div>
                </motion.div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <motion.div
                        initial={{ y: 50, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.1 }}
                        className="lg:col-span-2"
                    >
                        <div className="glass rounded-2xl p-6">
                            <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                                <Activity className="text-neon-cyan" />
                                TELEMETRIE
                            </h2>

                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                                <div className="text-center p-4 glass rounded-xl">
                                    <Gauge className="mx-auto mb-2 text-neon-cyan" size={24} />
                                    <p className="text-xs text-gray-400">Nájezd</p>
                                    <p className="text-xl font-bold">{formatDistance(car.status?.odometer || 0)}</p>
                                </div>
                                <div className="text-center p-4 glass rounded-xl">
                                    <Battery className="mx-auto mb-2 text-neon-cyan" size={24} />
                                    <p className="text-xs text-gray-400">Palivo</p>
                                    <p className="text-xl font-bold">{car.status?.fuel || 0}%</p>
                                    <div className="w-full bg-gray-700 rounded-full h-2 mt-2">
                                        <div
                                            className="bg-gradient-to-r from-neon-cyan to-neon-purple h-2 rounded-full transition-all"
                                            style={{ width: `${car.status?.fuel || 0}%` }}
                                        />
                                    </div>
                                </div>
                                <div className="text-center p-4 glass rounded-xl">
                                    <Thermometer className="mx-auto mb-2 text-neon-cyan" size={24} />
                                    <p className="text-xs text-gray-400">Motor</p>
                                    <p className="text-xl font-bold">{car.status?.engineTemp || 90}°C</p>
                                </div>
                                <div className="text-center p-4 glass rounded-xl">
                                    <Zap className="mx-auto mb-2 text-neon-cyan" size={24} />
                                    <p className="text-xs text-gray-400">Baterie</p>
                                    <p className="text-xl font-bold">{car.status?.battery || 12.4}V</p>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="glass rounded-xl p-4">
                                    <h3 className="font-bold mb-3 flex items-center gap-2">
                                        <Wifi size={16} className="text-neon-cyan" />
                                        STAV VOZIDLA
                                    </h3>
                                    <div className="space-y-2">
                                        <div className="flex justify-between">
                                            <span className="text-gray-400">Dveře:</span>
                                            <span className="text-green-400">Zavřeny</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-gray-400">Okna:</span>
                                            <span className="text-green-400">Zavřena</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-gray-400">Zámky:</span>
                                            <span className={car.status?.locked ? 'text-red-400' : 'text-green-400'}>
                        {car.status?.locked ? 'Zamknuto' : 'Odemknuto'}
                      </span>
                                        </div>
                                    </div>
                                </div>

                                <div className="glass rounded-xl p-4">
                                    <h3 className="font-bold mb-3 flex items-center gap-2">
                                        <MapPin size={16} className="text-neon-cyan" />
                                        POSLEDNÍ POLOHA
                                    </h3>
                                    {car.status?.location ? (
                                        <div>
                                            <p className="text-sm text-gray-400">Souřadnice:</p>
                                            <p className="font-mono text-xs">{car.status.location.lat}, {car.status.location.lng}</p>
                                            <button className="mt-3 w-full glass py-2 rounded-lg text-sm hover:bg-neon-cyan/20 transition-all">
                                                Zobrazit na mapě
                                            </button>
                                        </div>
                                    ) : (
                                        <p className="text-gray-400 text-sm">Pozice není dostupná</p>
                                    )}
                                </div>
                            </div>
                        </div>
                    </motion.div>

                    <motion.div
                        initial={{ y: 50, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.2 }}
                        className="space-y-6"
                    >
                        <div className="glass rounded-2xl p-6">
                            <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                                <Zap className="text-neon-cyan" />
                                OVLÁDÁNÍ
                            </h2>

                            <button
                                onClick={handleLockToggle}
                                disabled={commandLoading}
                                className={`w-full py-4 rounded-xl font-bold mb-4 transition-all ${
                                    car.status?.locked
                                        ? 'bg-gradient-to-r from-red-500 to-red-600 hover:shadow-lg hover:shadow-red-500/50'
                                        : 'bg-gradient-to-r from-neon-cyan to-neon-purple hover:shadow-lg hover:shadow-neon-cyan/50'
                                }`}
                            >
                                {commandLoading ? (
                                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mx-auto" />
                                ) : car.status?.locked ? (
                                    <span className="flex items-center justify-center gap-2">
                    <Unlock size={20} /> ODEMKNOUT
                  </span>
                                ) : (
                                    <span className="flex items-center justify-center gap-2">
                    <Lock size={20} /> ZAMKNOUT
                  </span>
                                )}
                            </button>

                            <div className="grid grid-cols-2 gap-3">
                                <button className="glass py-3 rounded-lg text-sm hover:bg-neon-cyan/20 transition-all flex items-center justify-center gap-2">
                                    <Fan size={16} /> Klima
                                </button>
                                <button className="glass py-3 rounded-lg text-sm hover:bg-neon-cyan/20 transition-all flex items-center justify-center gap-2">
                                    <Radio size={16} /> Rádio
                                </button>
                                <button className="glass py-3 rounded-lg text-sm hover:bg-neon-cyan/20 transition-all flex items-center justify-center gap-2">
                                    <Clock size={16} /> Startér
                                </button>
                                <button className="glass py-3 rounded-lg text-sm hover:bg-neon-cyan/20 transition-all flex items-center justify-center gap-2">
                                    <MapPin size={16} /> Hledat
                                </button>
                            </div>
                        </div>

                        <div className="glass rounded-2xl p-6">
                            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                                <History className="text-neon-cyan" />
                                HISTORIE
                            </h2>
                            <div className="space-y-3">
                                {car.history?.slice(0, 5).map((item, idx) => (
                                    <div key={idx} className="flex justify-between text-sm">
                                        <span className="text-gray-400">{item.date}</span>
                                        <span className="text-neon-cyan">{item.action}</span>
                                        <span className="text-gray-400">{item.value}</span>
                                    </div>
                                ))}
                                {(!car.history || car.history.length === 0) && (
                                    <p className="text-gray-400 text-center py-4">Zatím žádná historie</p>
                                )}
                            </div>
                        </div>
                    </motion.div>
                </div>
            </div>
        </div>
    );
};

export default CarDetail;