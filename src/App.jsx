import React, { useState, useEffect } from 'react';

// DEMO DATA - tvoje Škoda a Mazda
const demoCars = [
    {
        id: 'skoda',
        brand: 'Škoda',
        model: 'Octavia RS',
        year: 2023,
        plate: '5E8 1234',
        status: { odometer: 45230, fuel: 65, locked: true },
    },
    {
        id: 'mazda',
        brand: 'Mazda',
        model: 'CX-5 SkyActiv',
        year: 2022,
        plate: '6E9 5678',
        status: { odometer: 18340, fuel: 42, locked: false },
    },
];

function App() {
    // Persistentní data - ukládá se do localStorage
    const [darkMode, setDarkMode] = useState(() => {
        const saved = localStorage.getItem('darkMode');
        return saved ? JSON.parse(saved) : true;
    });

    useEffect(() => {
        localStorage.setItem('darkMode', JSON.stringify(darkMode));
    }, [darkMode]);

    return (
        <div style={{
            background: darkMode ? '#0a0a0f' : '#f5f5f5',
            color: darkMode ? 'white' : '#333',
            minHeight: '100vh',
            padding: '20px'
        }}>
            <div style={{ maxWidth: '600px', margin: '0 auto' }}>
                {/* Hlavička */}
                <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '30px'
                }}>
                    <h1 style={{
                        fontSize: '32px',
                        color: '#00fff9',
                        textShadow: '0 0 10px #00fff9'
                    }}>
                        🚗 MOJE GARÁŽ
                    </h1>
                    <button
                        onClick={() => setDarkMode(!darkMode)}
                        style={{
                            background: 'rgba(0, 255, 249, 0.2)',
                            border: '1px solid #00fff9',
                            borderRadius: '30px',
                            padding: '8px 16px',
                            color: '#00fff9',
                            fontSize: '20px'
                        }}
                    >
                        {darkMode ? '☀️' : '🌙'}
                    </button>
                </div>

                {/* Seznam aut */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    {demoCars.map((car) => (
                        <div
                            key={car.id}
                            style={{
                                background: darkMode ? 'rgba(15, 25, 35, 0.6)' : 'white',
                                backdropFilter: 'blur(12px)',
                                border: '1px solid rgba(0, 255, 249, 0.2)',
                                borderRadius: '20px',
                                padding: '20px',
                                boxShadow: darkMode ? 'none' : '0 2px 10px rgba(0,0,0,0.1)'
                            }}
                        >
                            <h2 style={{ fontSize: '24px', marginBottom: '5px' }}>
                                {car.brand} {car.model}
                            </h2>
                            <p style={{ color: '#00fff9', fontSize: '14px', marginBottom: '15px' }}>
                                {car.plate}
                            </p>

                            <div style={{ display: 'flex', gap: '30px' }}>
                                <div>
                                    <p style={{ color: '#888', fontSize: '12px' }}>Nájezd</p>
                                    <p style={{ fontWeight: 'bold' }}>{car.status.odometer.toLocaleString()} km</p>
                                </div>
                                <div>
                                    <p style={{ color: '#888', fontSize: '12px' }}>Palivo</p>
                                    <p style={{ fontWeight: 'bold' }}>{car.status.fuel}%</p>
                                </div>
                                <div>
                                    <p style={{ color: '#888', fontSize: '12px' }}>Stav</p>
                                    <p style={{
                                        fontWeight: 'bold',
                                        color: car.status.locked ? '#ff4444' : '#44ff44'
                                    }}>
                                        {car.status.locked ? '🔒 Zamknuto' : '🔓 Odemknuto'}
                                    </p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Nastavení */}
                <div style={{
                    marginTop: '30px',
                    background: darkMode ? 'rgba(15, 25, 35, 0.6)' : 'white',
                    backdropFilter: 'blur(12px)',
                    border: '1px solid rgba(0, 255, 249, 0.2)',
                    borderRadius: '20px',
                    padding: '20px'
                }}>
                    <h2 style={{ fontSize: '20px', marginBottom: '15px' }}>⚙️ NASTAVENÍ</h2>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span>Tmavý režim</span>
                        <button
                            onClick={() => setDarkMode(!darkMode)}
                            style={{
                                width: '50px',
                                height: '26px',
                                background: darkMode ? '#00fff9' : '#888',
                                borderRadius: '30px',
                                border: 'none',
                                position: 'relative'
                            }}
                        >
                            <div style={{
                                width: '22px',
                                height: '22px',
                                background: 'white',
                                borderRadius: '50%',
                                position: 'absolute',
                                top: '2px',
                                left: darkMode ? '26px' : '2px',
                                transition: 'left 0.2s'
                            }} />
                        </button>
                    </div>
                    <p style={{
                        textAlign: 'center',
                        color: '#888',
                        fontSize: '12px',
                        marginTop: '20px'
                    }}>
                        Moje Garáž v1.0 | Demo data (Škoda + Mazda)
                    </p>
                </div>
            </div>
        </div>
    );
}

export default App;