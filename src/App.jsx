import React, { useState } from 'react';
import toast, { Toaster } from 'react-hot-toast';
import './index.css';
import './App.css';

// ... existing code ...

const demoCars = [
    {
        id: 'porsche',
        brand: 'Porsche',
        model: 'Taycan Turbo',
        year: 2024,
        plate: 'S 60 283E',
        status: { battery: 54, range: 82, locked: true, location: 'Jl. Jenderal Ahmad Yani No.4, Kota Pontianak' },
        nearbyStation: { name: 'Suprpto Charge Station', address: 'Jl. Letjend Suprpto no.561', available: 5, total: 10, maxPower: 200 },
        history: [
            { date: '20 Mar 2024', event: 'Charging', value: '+32%', note: 'Fast charging' },
            { date: '18 Mar 2024', event: 'Trip', value: '124 km', note: 'City driving' }
        ]
    },
    {
        id: 'skoda',
        brand: 'Škoda',
        model: 'Enyaq iV',
        year: 2023,
        plate: '5E8 1234',
        status: { battery: 67, range: 210, locked: true, location: 'Praha 6, Dejvice' },
        nearbyStation: { name: 'E.ON Charging Hub', address: 'Evropská 123, Praha 6', available: 3, total: 6, maxPower: 150 },
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
        status: { battery: 42, range: 118, locked: false, location: 'Brno, Královo Pole' },
        nearbyStation: { name: 'PRE Point', address: 'Křenová 45, Brno', available: 2, total: 4, maxPower: 50 },
        history: [
            { date: '16 Mar 2024', event: 'Unlocked', value: 'App', note: 'Remote unlock' },
            { date: '14 Mar 2024', event: 'Charging', value: '+28%', note: 'Home charging' }
        ]
    }
];

function App() {
    const [selectedCar, setSelectedCar] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [cars, setCars] = useState(demoCars);

    const filteredCars = cars.filter(car =>
        `${car.brand} ${car.model}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
        car.plate.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleLockToggle = (carId) => {
        setCars(prev => prev.map(car => {
            if (car.id === carId) {
                const newLocked = !car.status.locked;
                toast.success(`Auto ${newLocked ? 'zamknuto' : 'odemknuto'}`);
                return { ...car, status: { ...car.status, locked: newLocked } };
            }
            return car;
        }));
        if (selectedCar?.id === carId) {
            setSelectedCar(prev => ({ ...prev, status: { ...prev.status, locked: !prev.status.locked } }));
        }
    };

    return (
        <div className="app-container">
            <Toaster position="bottom-center" />

            <div className="app-content">
                <header className="app-header">
                    <div>
                        <h1>My Garage</h1>
                        <p className="subtitle">{cars.length} vehicles • {cars.filter(c => c.status.locked).length} locked</p>
                    </div>
                </header>

                <div className="search-box">
                    <input
                        type="text"
                        placeholder="🔍 Hledat auto nebo SPZ..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>

                <div className="cars-grid">
                    {filteredCars.map((car) => (
                        <CarCard key={car.id} car={car} onClick={() => setSelectedCar(car)} />
                    ))}
                </div>
            </div>

            {selectedCar && (
                <CarModal car={selectedCar} onClose={() => setSelectedCar(null)} onLockToggle={handleLockToggle} />
            )}
        </div>
    );
}

export default App;

// Car List Item Component
function CarCard({ car, onClick }) {
    return (
        <div className="glass-card car-card" onClick={onClick}>
            <div className="car-header">
                <div>
                    <h3>{car.brand} {car.model}</h3>
                    <p className="car-plate">{car.plate}</p>
                </div>
            </div>
            <div className="car-stats">
                <div>
                    <span className="stat-label">Battery</span>
                    <span className="stat-value">{car.status.battery}%</span>
                </div>
                <div>
                    <span className="stat-label">Range</span>
                    <span className="stat-value">{car.status.range} km</span>
                </div>
                <div>
                    <span className="stat-label">Status</span>
                    <span className="stat-value" style={{ color: car.status.locked ? '#d32f2f' : '#388e3c' }}>
                        {car.status.locked ? '🔒' : '🔓'}
                    </span>
                </div>
            </div>
            <div className="battery-bar">
                <div className="battery-fill" style={{ width: `${car.status.battery}%` }} />
            </div>
        </div>
    );
}

// Car Detail Modal Component
function CarModal({ car, onClose, onLockToggle }) {
    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content glass-card" onClick={e => e.stopPropagation()}>
                <div className="modal-header">
                    <div>
                        <h2>{car.brand} {car.model}</h2>
                        <p className="modal-plate">{car.plate}</p>
                    </div>
                    <button className="modal-close" onClick={onClose}>✕</button>
                </div>

                <div className="battery-section">
                    <div className="battery-info">
                        <div>
                            <p className="info-label">Zbývající dojezd</p>
                            <p className="info-value">{car.status.range} km</p>
                        </div>
                        <div>
                            <p className="info-label">Nabití baterie</p>
                            <p className="info-value accent-text">{car.status.battery}%</p>
                        </div>
                    </div>
                    <div className="battery-bar battery-bar-lg">
                        <div className="battery-fill" style={{ width: `${car.status.battery}%` }} />
                    </div>
                    <button className="btn-outline lock-btn" onClick={() => onLockToggle(car.id)}>
                        {car.status.locked ? '🔓 Odemknout' : '🔒 Zamknout'}
                    </button>
                </div>

                <div className="section">
                    <h4>Poloha</h4>
                    <p>{car.status.location}</p>
                </div>

                {car.nearbyStation && (
                    <div className="section">
                        <h4>Nejbližší nabíjecí stanice</h4>
                        <div className="station-info">
                            <p className="station-name">{car.nearbyStation.name}</p>
                            <p className="station-address">{car.nearbyStation.address}</p>
                            <div className="station-stats">
                                <span>{car.nearbyStation.available} z {car.nearbyStation.total} volných</span>
                                <span>{car.nearbyStation.maxPower} kW</span>
                            </div>
                            <button className="btn-primary" onClick={() => toast.success('Objednávka odeslána!')}>
                                Zarezervovat
                            </button>
                        </div>
                    </div>
                )}

                {car.history?.length > 0 && (
                    <div className="section">
                        <h4>Nedávná aktivita</h4>
                        <div className="history-list">
                            {car.history.map((item, idx) => (
                                <div key={idx} className="history-item">
                                    <div>
                                        <p className="history-event">{item.event}</p>
                                        <p className="history-date">{item.date}</p>
                                    </div>
                                    <div className="history-value">
                                        <p>{item.value}</p>
                                        <p className="history-note">{item.note}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

