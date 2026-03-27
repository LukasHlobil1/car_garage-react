import React, { useState, useEffect } from 'react';
import toast, { Toaster } from 'react-hot-toast';
import { BrowserRouter, Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import './index.css';
import './App.css';

// ============================================
// SMARTCAR API SLUŽBY
// ============================================

// Ukládání tokenů do localStorage
const saveTokens = (tokens) => {
    localStorage.setItem('smartcar_access_token', tokens.accessToken);
    localStorage.setItem('smartcar_refresh_token', tokens.refreshToken);
    localStorage.setItem('smartcar_expires_at', Date.now() + tokens.expiresIn * 1000);
};

const getAccessToken = () => localStorage.getItem('smartcar_access_token');
const isTokenValid = () => {
    const expiresAt = localStorage.getItem('smartcar_expires_at');
    if (!expiresAt) return false;
    return Date.now() < parseInt(expiresAt) - 60000;
};

export const isAuthenticated = () => {
    return !!getAccessToken() && isTokenValid();
};

export const logoutSmartcar = () => {
    localStorage.removeItem('smartcar_access_token');
    localStorage.removeItem('smartcar_refresh_token');
    localStorage.removeItem('smartcar_expires_at');
};

// ============================================
// CALLBACK STRÁNKA PRO SMARTCAR
// ============================================

function SmartcarCallback() {
    const navigate = useNavigate();
    const [status, setStatus] = useState('Připojuji k Smartcar...');

    useEffect(() => {
        const processCallback = async () => {
            const urlParams = new URLSearchParams(window.location.search);
            const code = urlParams.get('code');
            const error = urlParams.get('error');

            if (error) {
                toast.error(`Chyba: ${error}`);
                navigate('/');
                return;
            }

            if (!code) {
                toast.error('Žádný autorizační kód');
                navigate('/');
                return;
            }

            setStatus('Výměna kódu za token...');

            try {
                const response = await fetch('http://localhost:3001/api/exchange', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ code })
                });
                const data = await response.json();

                if (data.success && data.tokens) {
                    saveTokens(data.tokens);
                    setStatus('Připojení úspěšné! Přesměrovávám...');
                    toast.success('Auto bylo úspěšně připojeno!');
                    setTimeout(() => navigate('/'), 1500);
                } else {
                    setStatus('Chyba při připojování');
                    toast.error('Nepodařilo se připojit auto');
                    setTimeout(() => navigate('/'), 2000);
                }
            } catch (err) {
                console.error('Callback error:', err);
                setStatus('Chyba při připojování');
                toast.error('Nepodařilo se připojit auto');
                setTimeout(() => navigate('/'), 2000);
            }
        };

        processCallback();
    }, [navigate]);

    return (
        <div className="callback-container">
            <div className="callback-content">
                <div className="loading-spinner-large"></div>
                <h2>{status}</h2>
                <p>Probíhá ověření...</p>
            </div>
        </div>
    );
}

// ============================================
// HLAVNÍ KOMPONENTA GARÁŽE
// ============================================

function Garage() {
    const [selectedCar, setSelectedCar] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [cars, setCars] = useState([]);
    const [smartcarConnected, setSmartcarConnected] = useState(false);
    const [smartcarCars, setSmartcarCars] = useState([]);
    const [loadingSmartcar, setLoadingSmartcar] = useState(false);

    // Stavy pro přidávání/úpravu auta
    const [showAddCarModal, setShowAddCarModal] = useState(false);
    const [showEditCarModal, setShowEditCarModal] = useState(false);
    const [carToEdit, setCarToEdit] = useState(null);
    const [newCar, setNewCar] = useState({
        brand: '',
        model: '',
        plate: '',
        year: new Date().getFullYear(),
        location: ''
    });

    // Načtení aut z localStorage při startu
    useEffect(() => {
        const savedCars = localStorage.getItem('myCars');
        if (savedCars) {
            try {
                setCars(JSON.parse(savedCars));
            } catch (e) {
                console.error('Chyba při načítání aut:', e);
                setCars([]);
            }
        }

        // Kontrola připojení Smartcar
        setSmartcarConnected(isAuthenticated());
    }, []);

    // Uložení aut do localStorage při každé změně
    useEffect(() => {
        localStorage.setItem('myCars', JSON.stringify(cars));
    }, [cars]);

    // Načtení Smartcar aut při připojení
    useEffect(() => {
        if (smartcarConnected && smartcarCars.length === 0 && !loadingSmartcar) {
            loadSmartcarCars();
        }
    }, [smartcarConnected]);

    const loadSmartcarCars = async () => {
        setLoadingSmartcar(true);
        try {
            const accessToken = getAccessToken();

            // Získání seznamu vozidel
            const vehiclesRes = await fetch('http://localhost:3001/api/vehicles', {
                headers: { 'Authorization': `Bearer ${accessToken}` }
            });
            const vehicles = await vehiclesRes.json();

            const smartcarData = [];
            for (const vehicle of vehicles.vehicles || []) {
                // Získání informací o vozidle
                const infoRes = await fetch(`http://localhost:3001/api/vehicles/${vehicle.id}`, {
                    headers: { 'Authorization': `Bearer ${accessToken}` }
                });
                const info = await infoRes.json();

                // Získání stavu vozidla
                const statusRes = await fetch(`http://localhost:3001/api/vehicles/${vehicle.id}/status`, {
                    headers: { 'Authorization': `Bearer ${accessToken}` }
                });
                const status = await statusRes.json();

                smartcarData.push({
                    id: vehicle.id,
                    brand: info.make || 'Neznámá',
                    model: info.model || 'Neznámý',
                    year: info.year || new Date().getFullYear(),
                    plate: info.licensePlate || '---',
                    isSmartcar: true,
                    status: {
                        locked: status.locked,
                        location: status.location?.latitude
                            ? `${status.location.latitude.toFixed(4)}, ${status.location.longitude.toFixed(4)}`
                            : 'Nezadáno',
                        odometer: status.odometer,
                        fuel: status.fuel
                    },
                    history: [
                        { date: new Date().toLocaleDateString('cs-CZ'), event: 'Připojeno', value: 'Smartcar', note: 'Auto připojeno přes Smartcar API' }
                    ]
                });
            }

            setSmartcarCars(smartcarData);

            // Merge Smartcar aut s manuálními
            const allCars = [...cars, ...smartcarData];
            setCars(allCars);

        } catch (error) {
            console.error('Chyba při načítání Smartcar aut:', error);
            toast.error('Nepodařilo se načíst data z Smartcar');
        } finally {
            setLoadingSmartcar(false);
        }
    };

    // Přihlášení k Smartcar
    const connectSmartcar = () => {
        window.location.href = 'https://connect.smartcar.com/oauth/authorize?response_type=code&client_id=2350e7c7-9f57-4b8e-b867-416cd1bb66ca&redirect_uri=http://localhost:5173/callback&scope=read_vehicle_info read_odometer read_location read_vin';
    };

    // Odhlášení Smartcar
    const disconnectSmartcar = () => {
        logoutSmartcar();
        setSmartcarConnected(false);
        setSmartcarCars([]);
        // Odstraníme Smartcar auta z hlavního seznamu
        setCars(prev => prev.filter(car => !car.isSmartcar));
        toast.success('Odpojeno od Smartcar');
    };

    // Filtrování aut
    const filteredCars = cars.filter(car =>
        `${car.brand} ${car.model}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
        car.plate.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Přidání nového auta
    const addNewCar = () => {
        if (!newCar.brand.trim() || !newCar.model.trim() || !newCar.plate.trim()) {
            toast.error('Vyplň prosím značku, model a SPZ');
            return;
        }

        const newId = `${newCar.brand.toLowerCase()}_${Date.now()}`;

        const carToAdd = {
            id: newId,
            brand: newCar.brand,
            model: newCar.model,
            year: parseInt(newCar.year),
            plate: newCar.plate.toUpperCase(),
            isSmartcar: false,
            status: {
                locked: true,
                location: newCar.location || 'Nezadáno'
            },
            history: [
                { date: new Date().toLocaleDateString('cs-CZ'), event: 'Přidáno', value: 'Nové auto', note: 'Přidáno do garáže' }
            ]
        };

        setCars(prev => [carToAdd, ...prev]);
        toast.success(`${newCar.brand} ${newCar.model} bylo přidáno do garáže!`);

        // Reset formuláře
        setNewCar({
            brand: '',
            model: '',
            plate: '',
            year: new Date().getFullYear(),
            location: ''
        });
        setShowAddCarModal(false);
    };

    // Úprava auta
    const updateCar = () => {
        if (!carToEdit.brand.trim() || !carToEdit.model.trim() || !carToEdit.plate.trim()) {
            toast.error('Vyplň prosím značku, model a SPZ');
            return;
        }

        setCars(prev => prev.map(car =>
            car.id === carToEdit.id
                ? {
                    ...car,
                    brand: carToEdit.brand,
                    model: carToEdit.model,
                    year: parseInt(carToEdit.year),
                    plate: carToEdit.plate.toUpperCase(),
                    status: {
                        ...car.status,
                        location: carToEdit.location || car.status.location
                    }
                }
                : car
        ));

        toast.success(`${carToEdit.brand} ${carToEdit.model} bylo upraveno!`);
        setShowEditCarModal(false);
        setCarToEdit(null);
    };

    // Smazání auta
    const deleteCar = (carId, carName) => {
        const car = cars.find(c => c.id === carId);
        if (car?.isSmartcar) {
            toast.error('Smartcar auto nelze smazat, odpoj se pro odstranění');
            return;
        }

        if (window.confirm(`Opravdu chceš smazat auto ${carName}?`)) {
            setCars(prev => prev.filter(car => car.id !== carId));
            toast.success(`${carName} bylo smazáno z garáže`);
            if (selectedCar?.id === carId) {
                setSelectedCar(null);
            }
        }
    };

    // Zamknutí/odemknutí auta
    const handleLockToggle = async (carId) => {
        const car = cars.find(c => c.id === carId);

        if (car?.isSmartcar) {
            // Smartcar ovládání
            try {
                const accessToken = getAccessToken();
                const action = car.status.locked ? 'unlock' : 'lock';

                const response = await fetch(`http://localhost:3001/api/vehicles/${carId}/${action}`, {
                    method: 'POST',
                    headers: { 'Authorization': `Bearer ${accessToken}` }
                });

                if (response.ok) {
                    const newLocked = !car.status.locked;
                    setCars(prev => prev.map(c =>
                        c.id === carId
                            ? { ...c, status: { ...c.status, locked: newLocked } }
                            : c
                    ));
                    toast.success(`Auto ${newLocked ? 'zamknuto' : 'odemknuto'}`);
                } else {
                    toast.error('Nepodařilo se provést příkaz');
                }
            } catch (error) {
                console.error('Lock toggle error:', error);
                toast.error('Chyba při komunikaci s vozidlem');
            }
        } else {
            // Manuální auto
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
        }
    };

    // Otevření modalu pro úpravu
    const openEditModal = (car) => {
        if (car.isSmartcar) {
            toast.error('Smartcar auto nelze upravit');
            return;
        }
        setCarToEdit({
            ...car,
            year: car.year,
            location: car.status.location
        });
        setShowEditCarModal(true);
    };

    return (
        <div className="app-container">
            <Toaster position="bottom-center" />

            <div className="app-content">
                <header className="app-header">
                    <div>
                        <h1>🚗 Moje Garáž</h1>
                        <p className="subtitle">
                            {cars.length} {cars.length === 1 ? 'vozidlo' : (cars.length >= 2 && cars.length <= 4 ? 'vozidla' : 'vozidel')}
                            {cars.length > 0 && ` • ${cars.filter(c => c.status.locked).length} zamčeno`}
                            {smartcarConnected && <span className="smartcar-badge"> 🔌 Smartcar připojeno</span>}
                        </p>
                    </div>
                    <div className="header-actions">
                        {smartcarConnected ? (
                            <button className="btn-outline-smartcar" onClick={disconnectSmartcar}>
                                🔌 Odpojit Smartcar
                            </button>
                        ) : (
                            <button className="btn-primary-smartcar" onClick={connectSmartcar}>
                                🔌 Připojit Smartcar
                            </button>
                        )}
                    </div>
                </header>

                {/* VYHLEDÁVÁNÍ */}
                <div className="search-box">
                    <input
                        type="text"
                        placeholder="🔍 Hledat auto (značka, model, SPZ)..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>

                {/* TLAČÍTKO PŘIDAT AUTO */}
                <div className="add-button-container">
                    <button className="btn-primary add-car-btn" onClick={() => setShowAddCarModal(true)}>
                        ➕ Přidat auto
                    </button>
                </div>

                {/* LOADING SMARTCAR */}
                {loadingSmartcar && (
                    <div className="loading-smartcar">
                        <span className="loading-spinner"></span> Načítám auta z Smartcar...
                    </div>
                )}

                {/* SEZNAM AUT */}
                {cars.length === 0 && !loadingSmartcar ? (
                    <div className="empty-garage">
                        <div className="empty-icon">🚗💨</div>
                        <h3>Garáž je prázdná</h3>
                        <p>Přidej své první auto kliknutím na tlačítko "Přidat auto"</p>
                        <p className="smartcar-hint">nebo připoj Smartcar pro automatické načtení aut</p>
                    </div>
                ) : (
                    <div className="cars-grid">
                        {filteredCars.length === 0 ? (
                            <div className="no-results">
                                <p>🔍 Žádné auto neodpovídá hledání "{searchTerm}"</p>
                            </div>
                        ) : (
                            filteredCars.map((car) => (
                                <CarCard
                                    key={car.id}
                                    car={car}
                                    onClick={() => setSelectedCar(car)}
                                    onEdit={() => openEditModal(car)}
                                    onDelete={() => deleteCar(car.id, `${car.brand} ${car.model}`)}
                                />
                            ))
                        )}
                    </div>
                )}
            </div>

            {/* MODAL PRO PŘIDÁNÍ AUTA */}
            {showAddCarModal && (
                <CarModal
                    title="➕ Přidat nové auto"
                    car={newCar}
                    setCar={setNewCar}
                    onSave={addNewCar}
                    onClose={() => setShowAddCarModal(false)}
                    isEdit={false}
                />
            )}

            {/* MODAL PRO ÚPRAVU AUTA */}
            {showEditCarModal && carToEdit && (
                <CarModal
                    title="✏️ Upravit auto"
                    car={carToEdit}
                    setCar={setCarToEdit}
                    onSave={updateCar}
                    onClose={() => {
                        setShowEditCarModal(false);
                        setCarToEdit(null);
                    }}
                    isEdit={true}
                />
            )}

            {/* MODAL PRO DETAIL AUTA */}
            {selectedCar && (
                <CarDetailModal
                    car={selectedCar}
                    onClose={() => setSelectedCar(null)}
                    onLockToggle={handleLockToggle}
                    onEdit={() => {
                        setSelectedCar(null);
                        openEditModal(selectedCar);
                    }}
                    onDelete={() => {
                        deleteCar(selectedCar.id, `${selectedCar.brand} ${selectedCar.model}`);
                        setSelectedCar(null);
                    }}
                />
            )}
        </div>
    );
}

// ============================================
// HLAVNÍ APP S ROUTEREM
// ============================================

function App() {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<Garage />} />
                <Route path="/callback" element={<SmartcarCallback />} />
            </Routes>
        </BrowserRouter>
    );
}

export default App;

// ============================================
// KARTA AUTA
// ============================================

function CarCard({ car, onClick, onEdit, onDelete }) {
    return (
        <div className={`glass-card car-card ${car.isSmartcar ? 'smartcar-card' : ''}`}>
            <div onClick={onClick} style={{ cursor: 'pointer' }}>
                <div className="car-header">
                    <div>
                        <h3>{car.brand} {car.model}</h3>
                        <p className="car-plate">{car.plate}</p>
                        {car.isSmartcar && <span className="smartcar-tag">🔌 Smartcar</span>}
                    </div>
                    <div className="car-year">{car.year}</div>
                </div>
                <div className="car-stats">
                    <div>
                        <span className="stat-label">🔒 Stav</span>
                        <span className="stat-value" style={{ color: car.status.locked ? '#c75c5c' : '#3c6e47' }}>
              {car.status.locked ? 'Zamčeno' : 'Odčeno'}
            </span>
                    </div>
                    <div>
                        <span className="stat-label">📍 Lokace</span>
                        <span className="stat-value">{car.status.location || 'Nezadáno'}</span>
                    </div>
                    {car.status.odometer && (
                        <div>
                            <span className="stat-label">📊 Nájezd</span>
                            <span className="stat-value">{car.status.odometer.toLocaleString()} km</span>
                        </div>
                    )}
                    {car.status.fuel !== undefined && (
                        <div>
                            <span className="stat-label">⛽ Palivo</span>
                            <span className="stat-value">{car.status.fuel}%</span>
                        </div>
                    )}
                </div>
            </div>
            <div className="car-actions">
                {!car.isSmartcar && (
                    <>
                        <button className="icon-btn edit-btn" onClick={(e) => { e.stopPropagation(); onEdit(); }} title="Upravit">
                            ✏️
                        </button>
                        <button className="icon-btn delete-btn" onClick={(e) => { e.stopPropagation(); onDelete(); }} title="Smazat">
                            🗑️
                        </button>
                    </>
                )}
            </div>
        </div>
    );
}

// ============================================
// MODÁLNÍ OKNO PRO PŘIDÁNÍ/ÚPRAVU AUTA
// ============================================

function CarModal({ title, car, setCar, onSave, onClose, isEdit }) {
    const handleChange = (field, value) => {
        setCar(prev => ({ ...prev, [field]: value }));
    };

    const currentYear = new Date().getFullYear();

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content glass-card" onClick={e => e.stopPropagation()}>
                <div className="modal-header">
                    <h2>{title}</h2>
                    <button className="modal-close" onClick={onClose}>✕</button>
                </div>

                <form onSubmit={(e) => { e.preventDefault(); onSave(); }} className="add-car-form">
                    <div className="form-row">
                        <div className="form-group">
                            <label>Značka *</label>
                            <input
                                type="text"
                                placeholder="Např. Škoda, Mazda, Porsche..."
                                value={car.brand}
                                onChange={(e) => handleChange('brand', e.target.value)}
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label>Model *</label>
                            <input
                                type="text"
                                placeholder="Např. Octavia, CX-5, Taycan..."
                                value={car.model}
                                onChange={(e) => handleChange('model', e.target.value)}
                                required
                            />
                        </div>
                    </div>

                    <div className="form-row">
                        <div className="form-group">
                            <label>SPZ *</label>
                            <input
                                type="text"
                                placeholder="5E8 1234"
                                value={car.plate}
                                onChange={(e) => handleChange('plate', e.target.value)}
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label>Rok výroby</label>
                            <div className="year-slider-wrapper">
                                <input
                                    type="range"
                                    min="1980"
                                    max={currentYear + 1}
                                    value={car.year}
                                    onChange={(e) => handleChange('year', parseInt(e.target.value))}
                                    className="year-slider"
                                />
                                <div className="year-labels">
                                    <span>1980</span>
                                    <span className="year-value">{car.year}</span>
                                    <span>{currentYear + 1}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="form-group">
                        <label>📍 Lokace</label>
                        <input
                            type="text"
                            placeholder="Město, ulice..."
                            value={car.location}
                            onChange={(e) => handleChange('location', e.target.value)}
                        />
                    </div>

                    <div className="form-actions">
                        <button type="button" className="btn-outline" onClick={onClose}>
                            Zrušit
                        </button>
                        <button type="submit" className="btn-primary">
                            {isEdit ? 'Uložit změny' : 'Přidat auto'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

// ============================================
// MODÁLNÍ OKNO DETAILU AUTA
// ============================================

function CarDetailModal({ car, onClose, onLockToggle, onEdit, onDelete }) {
    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content glass-card" onClick={e => e.stopPropagation()}>
                <div className="modal-header">
                    <div>
                        <h2>{car.brand} {car.model}</h2>
                        <p className="modal-plate">{car.plate}</p>
                        {car.isSmartcar && <span className="smartcar-badge-modal">🔌 Připojeno přes Smartcar</span>}
                    </div>
                    <button className="modal-close" onClick={onClose}>✕</button>
                </div>

                <div className="car-detail-info">
                    <div className="detail-row">
                        <span className="detail-label">📅 Rok výroby</span>
                        <span className="detail-value">{car.year}</span>
                    </div>
                    <div className="detail-row">
                        <span className="detail-label">📍 Poloha</span>
                        <span className="detail-value">{car.status.location || 'Nezadáno'}</span>
                    </div>
                    {car.status.odometer && (
                        <div className="detail-row">
                            <span className="detail-label">📊 Nájezd</span>
                            <span className="detail-value">{car.status.odometer.toLocaleString()} km</span>
                        </div>
                    )}
                    {car.status.fuel !== undefined && (
                        <div className="detail-row">
                            <span className="detail-label">⛽ Palivo</span>
                            <span className="detail-value">{car.status.fuel}%</span>
                        </div>
                    )}
                    <div className="detail-row">
                        <span className="detail-label">🔒 Stav zámků</span>
                        <span className="detail-value" style={{ color: car.status.locked ? '#c75c5c' : '#3c6e47' }}>
              {car.status.locked ? 'Zamčeno' : 'Odčeno'}
            </span>
                    </div>
                </div>

                <div className="detail-actions">
                    <button className="btn-outline lock-btn" onClick={() => onLockToggle(car.id)}>
                        {car.status.locked ? '🔓 Odemknout' : '🔒 Zamknout'}
                    </button>
                    {!car.isSmartcar && (
                        <div className="detail-action-buttons">
                            <button className="icon-btn edit-btn" onClick={onEdit} title="Upravit">
                                ✏️ Upravit
                            </button>
                            <button className="icon-btn delete-btn" onClick={onDelete} title="Smazat">
                                🗑️ Smazat
                            </button>
                        </div>
                    )}
                </div>

                {car.history?.length > 0 && (
                    <div className="section">
                        <h4>📜 Historie</h4>
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