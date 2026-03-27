import React, { useState, useEffect } from 'react';
import toast, { Toaster } from 'react-hot-toast';
import './index.css';
import './App.css';

// ============================================
// HLAVNÍ KOMPONENTA APP
// ============================================

function App() {
    const [selectedCar, setSelectedCar] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [cars, setCars] = useState([]);

    // Stavy pro přidávání/úpravu auta
    const [showAddCarModal, setShowAddCarModal] = useState(false);
    const [showEditCarModal, setShowEditCarModal] = useState(false);
    const [carToEdit, setCarToEdit] = useState(null);
    const [newCar, setNewCar] = useState({
        brand: '',
        model: '',
        plate: '',
        year: new Date().getFullYear(),
        battery: 80,
        range: 300,
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
    }, []);

    // Uložení aut do localStorage při každé změně
    useEffect(() => {
        localStorage.setItem('myCars', JSON.stringify(cars));
    }, [cars]);

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
            status: {
                battery: parseInt(newCar.battery),
                range: parseInt(newCar.range),
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
            battery: 80,
            range: 300,
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
                        battery: parseInt(carToEdit.battery),
                        range: parseInt(carToEdit.range),
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
        if (window.confirm(`Opravdu chceš smazat auto ${carName}?`)) {
            setCars(prev => prev.filter(car => car.id !== carId));
            toast.success(`${carName} bylo smazáno z garáže`);
            if (selectedCar?.id === carId) {
                setSelectedCar(null);
            }
        }
    };

    // Zamknutí/odemknutí auta
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

    // Otevření modalu pro úpravu
    const openEditModal = (car) => {
        setCarToEdit({
            ...car,
            year: car.year,
            battery: car.status.battery,
            range: car.status.range,
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
                        </p>
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

                {/* SEZNAM AUT */}
                {cars.length === 0 ? (
                    <div className="empty-garage">
                        <div className="empty-icon">🚗💨</div>
                        <h3>Garáž je prázdná</h3>
                        <p>Přidej své první auto kliknutím na tlačítko "Přidat auto"</p>
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

export default App;

// ============================================
// KARTA AUTA
// ============================================

function CarCard({ car, onClick, onEdit, onDelete }) {
    return (
        <div className="glass-card car-card">
            <div onClick={onClick} style={{ cursor: 'pointer' }}>
                <div className="car-header">
                    <div>
                        <h3>{car.brand} {car.model}</h3>
                        <p className="car-plate">{car.plate}</p>
                    </div>
                    <div className="car-year">{car.year}</div>
                </div>
                <div className="car-stats">
                    <div>
                        <span className="stat-label">🔋 Baterie</span>
                        <span className="stat-value">{car.status.battery}%</span>
                    </div>
                    <div>
                        <span className="stat-label">📊 Dojezd</span>
                        <span className="stat-value">{car.status.range} km</span>
                    </div>
                    <div>
                        <span className="stat-label">🔒 Stav</span>
                        <span className="stat-value" style={{ color: car.status.locked ? '#ff6b6b' : '#51cf66' }}>
              {car.status.locked ? 'Zamčeno' : 'Odčeno'}
            </span>
                    </div>
                </div>
                <div className="battery-bar">
                    <div className="battery-fill" style={{ width: `${car.status.battery}%` }} />
                </div>
            </div>
            <div className="car-actions">
                <button className="icon-btn edit-btn" onClick={(e) => { e.stopPropagation(); onEdit(); }} title="Upravit">
                    ✏️
                </button>
                <button className="icon-btn delete-btn" onClick={(e) => { e.stopPropagation(); onDelete(); }} title="Smazat">
                    🗑️
                </button>
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
                            <input
                                type="number"
                                min="1990"
                                max={new Date().getFullYear() + 1}
                                value={car.year}
                                onChange={(e) => handleChange('year', e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="form-row">
                        <div className="form-group">
                            <label>Nabití baterie (%)</label>
                            <div className="range-wrapper">
                                <input
                                    type="range"
                                    min="0"
                                    max="100"
                                    value={car.battery}
                                    onChange={(e) => handleChange('battery', e.target.value)}
                                />
                                <span className="range-value">{car.battery}%</span>
                            </div>
                        </div>

                        <div className="form-group">
                            <label>Dojezd (km)</label>
                            <input
                                type="number"
                                min="0"
                                max="1000"
                                value={car.range}
                                onChange={(e) => handleChange('range', e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="form-group">
                        <label>Lokace</label>
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
                    </div>
                    <button className="modal-close" onClick={onClose}>✕</button>
                </div>

                <div className="battery-section">
                    <div className="battery-info">
                        <div>
                            <p className="info-label">📊 Dojezd</p>
                            <p className="info-value">{car.status.range} km</p>
                        </div>
                        <div>
                            <p className="info-label">🔋 Baterie</p>
                            <p className="info-value accent-text">{car.status.battery}%</p>
                        </div>
                    </div>
                    <div className="battery-bar battery-bar-lg">
                        <div className="battery-fill" style={{ width: `${car.status.battery}%` }} />
                    </div>

                    <div className="detail-actions">
                        <button className="btn-outline lock-btn" onClick={() => onLockToggle(car.id)}>
                            {car.status.locked ? '🔓 Odemknout' : '🔒 Zamknout'}
                        </button>
                        <div className="detail-action-buttons">
                            <button className="icon-btn edit-btn" onClick={onEdit} title="Upravit">
                                ✏️ Upravit
                            </button>
                            <button className="icon-btn delete-btn" onClick={onDelete} title="Smazat">
                                🗑️ Smazat
                            </button>
                        </div>
                    </div>
                </div>

                <div className="section">
                    <h4>📍 Poloha</h4>
                    <p>{car.status.location || 'Nezadáno'}</p>
                </div>

                <div className="section">
                    <h4>📅 Rok výroby</h4>
                    <p>{car.year}</p>
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