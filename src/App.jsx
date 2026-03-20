import React, { useState, useEffect } from 'react';
import toast, { Toaster } from 'react-hot-toast';
import './index.css';

// DEMO DATA
const demoCars = [
    {
        id: 'porsche',
        brand: 'Porsche',
        model: 'Taycan Turbo',
        year: 2024,
        plate: 'S 60 283E',
        color: '#4a90e2',
        image: '🔋',
        status: {
            battery: 54,
            range: 82,
            locked: true,
            odometer: 12340,
            location: 'Jl. Jenderal Ahmad Yani No.4, Kota Pontianak'
        },
        nearbyStation: {
            name: 'Suprpto Charge Station',
            address: 'Jl. Letjend Suprpto no.561, Kota Pontianak',
            available: 5,
            total: 10,
            maxPower: 200
        },
        history: [
            { date: '20 Mar 2024', event: 'Charging', value: '+32%', note: 'Fast charging' },
            { date: '18 Mar 2024', event: 'Trip', value: '124 km', note: 'City driving' },
            { date: '15 Mar 2024', event: 'Service', value: 'OK', note: 'Inspection' }
        ]
    },
    {
        id: 'skoda',
        brand: 'Škoda',
        model: 'Enyaq iV',
        year: 2023,
        plate: '5E8 1234',
        color: '#00b8b0',
        image: '🔋',
        status: {
            battery: 67,
            range: 210,
            locked: true,
            odometer: 18450,
            location: 'Praha 6, Dejvice'
        },
        nearbyStation: {
            name: 'E.ON Charging Hub',
            address: 'Evropská 123, Praha 6',
            available: 3,
            total: 6,
            maxPower: 150
        },
        history: [
            { date: '19 Mar 2024', event: 'Charging', value: '+45%', note: 'AC charging' },
            { date: '17 Mar 2024', event: 'Trip', value: '89 km', note: 'Highway' }
        ]
    },
    {
        id: 'mazda',
        brand: 'Mazda',
        model: 'MX-30',
        year: 2023,
        plate: '6E9 5678',
        color: '#e24a4a',
        image: '🔋',
        status: {
            battery: 42,
            range: 118,
            locked: false,
            odometer: 8760,
            location: 'Brno, Královo Pole'
        },
        nearbyStation: {
            name: 'PRE Point',
            address: 'Křenová 45, Brno',
            available: 2,
            total: 4,
            maxPower: 50
        },
        history: [
            { date: '16 Mar 2024', event: 'Unlocked', value: 'App', note: 'Remote unlock' },
            { date: '14 Mar 2024', event: 'Charging', value: '+28%', note: 'Home charging' }
        ]
    }
];

function App() {
    const [darkMode, setDarkMode] = useState(() => {
        const saved = localStorage.getItem('darkMode');
        return saved ? JSON.parse(saved) : true;
    });
    const [selectedCar, setSelectedCar] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [cars, setCars] = useState(demoCars);

    useEffect(() => {
        localStorage.setItem('darkMode', JSON.stringify(darkMode));
    }, [darkMode]);

    const filteredCars = cars.filter(car =>
        `${car.brand} ${car.model}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
        car.plate.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const openCarDetail = (car) => {
        setSelectedCar(car);
    };

    const closeCarDetail = () => {
        setSelectedCar(null);
    };

    const handleLockToggle = (carId) => {
        setCars(prev => prev.map(car => {
            if (car.id === carId) {
                const newLocked = !car.status.locked;
                toast.success(`Auto ${newLocked ? 'zamknuto' : 'odemknuto'}`);
                return {
                    ...car,
                    status: { ...car.status, locked: newLocked }
                };
            }
            return car;
        }));

        if (selectedCar && selectedCar.id === carId) {
            setSelectedCar(prev => ({
                ...prev,
                status: { ...prev.status, locked: !prev.status.locked }
            }));
        }
    };

    return (
        <div style={{
            background: darkMode ? '#0a0a0f' : '#f0f2f5',
            minHeight: '100vh',
            padding: '20px'
        }}>
            <Toaster position="bottom-center" />

            <div style={{ maxWidth: '500px', margin: '0 auto' }}>
                {/* Header */}
                <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '24px'
                }}>
                    <div>
                        <h1 style={{
                            fontSize: '28px',
                            fontWeight: 'bold',
                            background: 'linear-gradient(135deg, #00fff9, #ff00e5)',
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent'
                        }}>
                            My Garage
                        </h1>
                        <p style={{ fontSize: '14px', color: '#888', marginTop: '4px' }}>
                            {cars.length} vehicles • {cars.filter(c => c.status.locked).length} locked
                        </p>
                    </div>
                    <button
                        onClick={() => setDarkMode(!darkMode)}
                        style={{
                            background: 'rgba(0, 255, 249, 0.15)',
                            border: '1px solid rgba(0, 255, 249, 0.3)',
                            borderRadius: '30px',
                            padding: '10px 16px',
                            color: '#00fff9',
                            fontSize: '18px',
                            cursor: 'pointer'
                        }}
                    >
                        {darkMode ? '☀️' : '🌙'}
                    </button>
                </div>

                {/* Search */}
                <div style={{ marginBottom: '20px' }}>
                    <input
                        type="text"
                        placeholder="🔍 Search by car or plate..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        style={{
                            width: '100%',
                            padding: '14px 18px',
                            background: 'rgba(20, 25, 40, 0.6)',
                            backdropFilter: 'blur(10px)',
                            border: '1px solid rgba(0, 255, 249, 0.2)',
                            borderRadius: '40px',
                            color: 'white',
                            fontSize: '16px',
                            outline: 'none'
                        }}
                    />
                </div>

                {/* Cars List */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    {filteredCars.map((car) => (
                        <div
                            key={car.id}
                            onClick={() => openCarDetail(car)}
                            style={{
                                background: 'rgba(20, 25, 40, 0.6)',
                                backdropFilter: 'blur(20px)',
                                border: '1px solid rgba(0, 255, 249, 0.15)',
                                borderRadius: '28px',
                                padding: '20px',
                                cursor: 'pointer',
                                transition: 'transform 0.2s'
                            }}
                        >
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                <div>
                                    <h2 style={{ fontSize: '20px', fontWeight: 'bold' }}>
                                        {car.brand} {car.model}
                                    </h2>
                                    <p style={{ color: '#00fff9', fontSize: '14px', marginTop: '4px' }}>
                                        {car.plate}
                                    </p>
                                </div>
                                <div style={{
                                    fontSize: '40px',
                                    background: 'rgba(0, 255, 249, 0.1)',
                                    borderRadius: '50%',
                                    padding: '10px'
                                }}>
                                    {car.image}
                                </div>
                            </div>

                            <div style={{ display: 'flex', gap: '24px', marginTop: '16px' }}>
                                <div>
                                    <p style={{ color: '#888', fontSize: '12px' }}>Battery</p>
                                    <p style={{ fontWeight: 'bold', fontSize: '18px' }}>
                                        {car.status.battery}%
                                    </p>
                                </div>
                                <div>
                                    <p style={{ color: '#888', fontSize: '12px' }}>Range</p>
                                    <p style={{ fontWeight: 'bold', fontSize: '18px' }}>
                                        {car.status.range} km
                                    </p>
                                </div>
                                <div>
                                    <p style={{ color: '#888', fontSize: '12px' }}>Status</p>
                                    <p style={{
                                        fontWeight: 'bold',
                                        fontSize: '14px',
                                        color: car.status.locked ? '#ff5555' : '#55ff55'
                                    }}>
                                        {car.status.locked ? '🔒 Locked' : '🔓 Unlocked'}
                                    </p>
                                </div>
                            </div>

                            {/* Battery Bar */}
                            <div style={{ marginTop: '12px' }}>
                                <div style={{
                                    height: '8px',
                                    background: '#2a2a3a',
                                    borderRadius: '10px',
                                    overflow: 'hidden'
                                }}>
                                    <div style={{
                                        width: `${car.status.battery}%`,
                                        height: '100%',
                                        background: 'linear-gradient(90deg, #00fff9, #ff00e5)',
                                        borderRadius: '10px'
                                    }} />
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Detail Modal - přesně podle designu z obrázku */}
            {selectedCar && (
                <div style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    background: 'rgba(0,0,0,0.85)',
                    backdropFilter: 'blur(8px)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 1000,
                    padding: '16px'
                }} onClick={closeCarDetail}>
                    <div style={{
                        background: 'linear-gradient(135deg, #12121a, #0a0a12)',
                        borderRadius: '32px',
                        maxWidth: '480px',
                        width: '100%',
                        maxHeight: '90vh',
                        overflowY: 'auto',
                        padding: '24px'
                    }} onClick={e => e.stopPropagation()}>

                        {/* Header */}
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                            <div>
                                <h2 style={{ fontSize: '24px', fontWeight: 'bold' }}>
                                    {selectedCar.brand}'s Car
                                </h2>
                                <p style={{ fontSize: '18px', color: '#00fff9', marginTop: '4px' }}>
                                    {selectedCar.model}
                                </p>
                                <p style={{ fontSize: '14px', color: '#888', marginTop: '4px' }}>
                                    {selectedCar.plate}
                                </p>
                            </div>
                            <button
                                onClick={closeCarDetail}
                                style={{
                                    background: 'rgba(255,255,255,0.1)',
                                    border: 'none',
                                    borderRadius: '30px',
                                    width: '40px',
                                    height: '40px',
                                    fontSize: '20px',
                                    cursor: 'pointer',
                                    color: 'white'
                                }}
                            >
                                ✕
                            </button>
                        </div>

                        {/* Range & Battery Section */}
                        <div style={{
                            background: 'rgba(0, 255, 249, 0.05)',
                            borderRadius: '24px',
                            padding: '20px',
                            marginBottom: '20px'
                        }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <div>
                                    <p style={{ color: '#888', fontSize: '12px' }}>Remaining Distance</p>
                                    <p style={{ fontSize: '32px', fontWeight: 'bold' }}>
                                        {selectedCar.status.range} <span style={{ fontSize: '16px' }}>km</span>
                                    </p>
                                </div>
                                <div style={{ textAlign: 'right' }}>
                                    <p style={{ color: '#888', fontSize: '12px' }}>Charge Battery Energy</p>
                                    <p style={{ fontSize: '32px', fontWeight: 'bold', color: '#00fff9' }}>
                                        {selectedCar.status.battery}%
                                    </p>
                                </div>
                            </div>

                            {/* Battery Bar */}
                            <div style={{ marginTop: '12px' }}>
                                <div style={{
                                    height: '10px',
                                    background: '#2a2a3a',
                                    borderRadius: '10px',
                                    overflow: 'hidden'
                                }}>
                                    <div style={{
                                        width: `${selectedCar.status.battery}%`,
                                        height: '100%',
                                        background: 'linear-gradient(90deg, #00fff9, #ff00e5)',
                                        borderRadius: '10px'
                                    }} />
                                </div>
                            </div>

                            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '16px' }}>
                                <button
                                    onClick={() => handleLockToggle(selectedCar.id)}
                                    style={{
                                        background: 'rgba(0, 255, 249, 0.15)',
                                        border: '1px solid rgba(0, 255, 249, 0.3)',
                                        borderRadius: '40px',
                                        padding: '10px 20px',
                                        color: '#00fff9',
                                        cursor: 'pointer',
                                        fontSize: '14px'
                                    }}
                                >
                                    {selectedCar.status.locked ? '🔓 Unlock Car' : '🔒 Lock Car'}
                                </button>
                                <div style={{ fontSize: '14px', color: '#888' }}>
                                    ⚡ Power Saving Mode
                                </div>
                            </div>
                        </div>

                        {/* Current Location */}
                        <div style={{ marginBottom: '20px' }}>
                            <p style={{ color: '#888', fontSize: '12px', marginBottom: '8px' }}>Current Location</p>
                            <div style={{
                                background: 'rgba(255,255,255,0.05)',
                                borderRadius: '20px',
                                padding: '16px'
                            }}>
                                <p style={{ fontWeight: '500' }}>{selectedCar.status.location}</p>
                                <p style={{ color: '#00fff9', fontSize: '12px', marginTop: '4px' }}>
                                    🟢 20m • Now
                                </p>
                            </div>
                        </div>

                        {/* Nearby Station */}
                        {selectedCar.nearbyStation && (
                            <div style={{ marginBottom: '20px' }}>
                                <p style={{ color: '#888', fontSize: '12px', marginBottom: '8px' }}>Nearby Station</p>
                                <div style={{
                                    background: 'rgba(0, 255, 249, 0.05)',
                                    borderRadius: '20px',
                                    padding: '16px',
                                    border: '1px solid rgba(0, 255, 249, 0.2)'
                                }}>
                                    <p style={{ fontWeight: 'bold' }}>{selectedCar.nearbyStation.name}</p>
                                    <p style={{ fontSize: '12px', color: '#aaa', marginTop: '4px' }}>
                                        {selectedCar.nearbyStation.address}
                                    </p>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '12px' }}>
                    <span style={{ fontSize: '12px', color: '#00fff9' }}>
                      {selectedCar.nearbyStation.available} of {selectedCar.nearbyStation.total} available
                    </span>
                                        <span style={{ fontSize: '12px', color: '#888' }}>
                      {selectedCar.nearbyStation.maxPower} kW max
                    </span>
                                    </div>
                                    <button
                                        onClick={() => toast.success('Booking requested!')}
                                        style={{
                                            width: '100%',
                                            marginTop: '12px',
                                            background: 'linear-gradient(135deg, #00fff9, #00b8b0)',
                                            border: 'none',
                                            borderRadius: '40px',
                                            padding: '12px',
                                            fontWeight: 'bold',
                                            color: '#0a0a0f',
                                            cursor: 'pointer'
                                        }}
                                    >
                                        Book Now
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* History */}
                        {selectedCar.history && selectedCar.history.length > 0 && (
                            <div>
                                <p style={{ color: '#888', fontSize: '12px', marginBottom: '12px' }}>Recent Activity</p>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                    {selectedCar.history.map((item, idx) => (
                                        <div key={idx} style={{
                                            display: 'flex',
                                            justifyContent: 'space-between',
                                            alignItems: 'center',
                                            padding: '12px 0',
                                            borderBottom: '1px solid rgba(255,255,255,0.05)'
                                        }}>
                                            <div>
                                                <p style={{ fontWeight: '500' }}>{item.event}</p>
                                                <p style={{ fontSize: '12px', color: '#888' }}>{item.date}</p>
                                            </div>
                                            <div style={{ textAlign: 'right' }}>
                                                <p style={{ color: '#00fff9' }}>{item.value}</p>
                                                <p style={{ fontSize: '10px', color: '#666' }}>{item.note}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}

export default App;