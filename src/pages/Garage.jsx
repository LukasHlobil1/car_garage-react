import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { useApp } from '../contexts/AppContext';
import { smartcarAPI } from '../services/smartcar';
import { demoCars } from '../data/demoCars';
import { Car, Battery, Gauge, Lock, Unlock, MapPin, Settings, RefreshCw } from 'lucide-react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Sphere, MeshDistortMaterial } from '@react-three/drei';
import toast from 'react-hot-toast';

const Garage = () => {
    const { user, units, darkMode } = useApp();
    const [cars, setCars] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isSmartcarConnected, setIsSmartcarConnected] = useState(false);
    const [smartcarToken, setSmartcarToken] = useState(null);
    const [lastUpdate, setLastUpdate] = useState(new Date());

    useEffect(() => {
        const loadCars = async () => {
            setLoading(true);

            const savedToken = localStorage.getItem('smartcar_access_token');

            if (savedToken) {
                try {
                    setSmartcarToken(savedToken);
                    setIsSmartcarConnected(true);

                    const vehicles = await smartcarAPI.getVehicles(savedToken);

                    const realCarsData = await Promise.all(
                        vehicles.map(async (vehicle) => {
                            const status = await smartcarAPI.getVehicleStatus(vehicle.id, savedToken);
                            return {
                                id: vehicle.id,
                                brand: vehicle.make,
                                model: vehicle.model,
                                year: vehicle.year,
                                plate: vehicle.licensePlate || '---',
                                isReal: true,
                                status: {
                                    odometer: status.odometer,
                                    fuel: status.fuel,
                                    locked: status.locked,
                                    location: status.location,
                                    lastUpdated: new Date().toISOString()
                                }
                            };
                        })
                    );

                    setCars(realCarsData);
                } catch (error) {
                    console.error('Smartcar error:', error);
                    toast.error('Chyba připojení, používám demo data');
                    setCars(demoCars);
                }
            } else {
                setCars(demoCars);
            }

            setLoading(false);
        };

        loadCars();
    }, []);

    const connectSmartcar = () => {
        const authUrl = smartcarAPI.getAuthUrl();
        window.location.href = authUrl;
    };

    const disconnectSmartcar = () => {
        localStorage.removeItem('smartcar_access_token');
        setSmartcarToken(null);
        setIsSmartcarConnected(false);
        setCars(demoCars);
        toast.success('Odpojeno od Smartcar, používám demo data');
    };

    const formatDistance = (km) => {
        if (units === 'imperial') return `${Math.round(km * 0.621371)} mi`;
        return `${km.toLocaleString()} km`;
    };

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: { staggerChildren: 0.1 }
        }
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 50 },
        visible: {
            opacity: 1,
            y: 0,
            transition: { type: 'spring', stiffness: 100, damping: 12 }
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="relative">
                    <div className="w-20 h-20 border-4 border-neon-cyan border-t-transparent rounded-full animate-spin" />
                    <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-10 h-10 bg-neon-cyan rounded-full animate-pulse" />
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen relative overflow-hidden">
            {/* 3D Pozadí */}
            <div className="fixed inset-0 z-0 opacity-30">
                <Canvas camera={{ position: [0, 0, 5] }}>
                    <ambientLight intensity={0.5} />
                    <pointLight position={[10, 10, 10]} />
                    <Sphere args={[1, 64, 64]} scale={2.5}>
                        <MeshDistortMaterial
                            color="#00fff9"
                            attach="material"
                            distort={0.4}
                            speed={1.5}
                            roughness={0.2}
                            metalness={0.8}
                        />
                    </Sphere>
                    <OrbitControls enableZoom={false} autoRotate autoRotateSpeed={0.5} />
                </Canvas>
            </div>

            {/* Header s připojením */}
            <div className="fixed top-4 right-4 z-50 flex gap-2">
                {isSmartcarConnected ? (
                    <div className="glass px-4 py-2 rounded-full text-xs flex items-center gap-2">
                        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                        <span className="text-green-400">Smartcar LIVE</span>
                        <button
                            onClick={disconnectSmartcar}
                            className="ml-2 text-red-400 hover:text-red-300"
                        >
                            ✕
                        </button>
                    </div>
                ) : (
                    <button
                        onClick={connectSmartcar}
                        className="glass px-4 py-2 rounded-full text-xs hover:bg-neon-cyan/20 transition-all flex items-center gap-2"
                    >
                        <span>🔌</span>
                        Připojit Smartcar
                    </button>
                )}
            </div>

            {/* Hlavní obsah */}
            <div className="relative z-10 container mx-auto px-4 py-8">
                <motion.div
                    initial={{ y: -100, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ type: 'spring', stiffness: 100 }}
                    className="flex justify-between items-center mb-12"
                >
                    <div>
                        <h1 className="text-5xl md:text-7xl font-bold bg-gradient-to-r from-neon-cyan via-neon-pink to-neon-purple bg-clip-text text-transparent animate-glow">
                            MOJE GARÁŽ
                        </h1>
                        {!isSmartcarConnected && (
                            <p className="text-gray-400 text-sm mt-2">(DEMO REŽIM - připojte Smartcar pro reálná data)</p>
                        )}
                        <p className="text-gray-400 text-xs mt-1 flex items-center gap-2">
                            <RefreshCw size={12} className="animate-spin-slow" />
                            Poslední aktualizace: {lastUpdate.toLocaleTimeString()}
                        </p>
                    </div>
                    <Link
                        to="/settings"
                        className="glass p-3 rounded-full hover:scale-110 transition-transform"
                    >
                        <Settings className="text-neon-cyan" size={24} />
                    </Link>
                </motion.div>

                <motion.div
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                    className="grid grid-cols-1 md:grid-cols-2 gap-6"
                >
                    {cars.map((car, index) => (
                        <motion.div
                            key={car.id}
                            variants={itemVariants}
                            whileHover={{ scale: 1.02, y: -5 }}
                            className="glass rounded-2xl overflow-hidden cursor-pointer group"
                            onClick={() => window.location.href = `/car/${car.id}`}
                        >
                            <div className="relative h-48 overflow-hidden">
                                <div className="absolute inset-0 bg-gradient-to-br from-neon-cyan/20 to-neon-purple/20" />
                                <div className="absolute top-4 right-4 glass px-3 py-1 rounded-full text-xs">
                                    {car.year}
                                </div>
                                {car.isReal && (
                                    <div className="absolute top-4 left-4 glass px-2 py-1 rounded-full text-xs bg-green-500/20 text-green-400">
                                        LIVE
                                    </div>
                                )}
                                <div className="flex items-center justify-center h-full">
                                    <Car
                                        size={80}
                                        className="text-neon-cyan group-hover:scale-110 transition-transform duration-300"
                                    />
                                </div>
                                <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-neon-cyan via-neon-pink to-neon-purple transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500" />
                            </div>

                            <div className="p-6">
                                <h2 className="text-2xl font-bold mb-2">
                                    {car.brand} {car.model}
                                </h2>
                                <p className="text-neon-cyan text-sm mb-4">{car.plate}</p>

                                <div className="grid grid-cols-3 gap-4 mb-6">
                                    <div className="text-center">
                                        <Gauge size={20} className="mx-auto mb-1 text-neon-cyan" />
                                        <p className="text-xs text-gray-400">Nájezd</p>
                                        <p className="font-bold text-sm">{formatDistance(car.status?.odometer || 0)}</p>
                                    </div>
                                    <div className="text-center">
                                        <Battery size={20} className="mx-auto mb-1 text-neon-cyan" />
                                        <p className="text-xs text-gray-400">Palivo</p>
                                        <p className="font-bold text-sm">{car.status?.fuel || 0}%</p>
                                    </div>
                                    <div className="text-center">
                                        {car.status?.locked ? (
                                            <Lock size={20} className="mx-auto mb-1 text-red-400" />
                                        ) : (
                                            <Unlock size={20} className="mx-auto mb-1 text-green-400" />
                                        )}
                                        <p className="text-xs text-gray-400">Stav</p>
                                        <p className="font-bold text-sm">
                                            {car.status?.locked ? 'Zamknuto' : 'Odemknuto'}
                                        </p>
                                    </div>
                                </div>

                                <div className="flex gap-2">
                                    <button className="flex-1 glass py-2 rounded-lg text-sm hover:bg-neon-cyan/20 transition-all">
                                        <MapPin size={16} className="inline mr-1" />
                                        Najít auto
                                    </button>
                                    <button className="flex-1 bg-gradient-to-r from-neon-cyan to-neon-purple py-2 rounded-lg text-sm font-bold hover:shadow-lg hover:shadow-neon-cyan/50 transition-all">
                                        DETAIL
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </motion.div>
            </div>
        </div>
    );
};

export default Garage;