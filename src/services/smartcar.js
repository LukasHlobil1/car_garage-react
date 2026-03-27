// src/services/smartcar.js
import Smartcar from '@smartcar/auth';

// TVOJE PŘIHLÁŠOVACÍ ÚDAJE ZE SMARTCAR DASHBOARDU
const CLIENT_ID = '2350e7c7-9f57-4b8e-b867-416cd1bb66ca';
const REDIRECT_URI = 'http://localhost:5173/callback';

// Oprávnění, která chceme (čtení dat + ovládání zámků)
const SCOPE = [
    'read_vehicle_info',  // značka, model, rok
    'read_odometer',      // kilometry
    'read_fuel',          // stav paliva
    'read_battery',       // stav baterie (pro elektromobily)
    'read_location',      // GPS poloha
    'read_vin',           // VIN kód
    'control_lock'        // zamknutí/odemknutí
];

// Ukládání tokenů do localStorage
const saveTokens = (tokens) => {
    localStorage.setItem('smartcar_access_token', tokens.accessToken);
    localStorage.setItem('smartcar_refresh_token', tokens.refreshToken);
    localStorage.setItem('smartcar_expires_at', Date.now() + tokens.expiresIn * 1000);
};

const getAccessToken = () => localStorage.getItem('smartcar_access_token');
const getRefreshToken = () => localStorage.getItem('smartcar_refresh_token');

const isTokenValid = () => {
    const expiresAt = localStorage.getItem('smartcar_expires_at');
    if (!expiresAt) return false;
    return Date.now() < parseInt(expiresAt) - 60000; // 1 minuta rezerva
};

// Inicializace Smartcar Auth
export const initSmartcar = () => {
    return new Smartcar({
        clientId: CLIENT_ID,
        redirectUri: REDIRECT_URI,
        scope: SCOPE,
    });
};

// Spuštění přihlášení – přesměruje na Smartcar
export const loginToSmartcar = () => {
    const smartcar = initSmartcar();
    smartcar.openDialog();
};

// Zpracování callbacku po návratu z Smartcar
export const handleSmartcarCallback = () => {
    return new Promise((resolve) => {
        const smartcar = initSmartcar();

        smartcar.onComplete = (err, code) => {
            if (err) {
                console.error('Smartcar error:', err);
                resolve({ success: false, error: err });
            } else {
                resolve({ success: true, code });
            }
        };

        const urlParams = new URLSearchParams(window.location.search);
        const code = urlParams.get('code');
        const error = urlParams.get('error');

        if (error) {
            resolve({ success: false, error });
        } else if (code) {
            resolve({ success: true, code });
        } else {
            resolve({ success: false, error: 'No code in URL' });
        }
    });
};

// Výměna kódu za token (potřebuje backend, protože vyžaduje Client Secret)
// Pro demo účely si vytvoříme jednoduchý backend
export const exchangeCodeForToken = async (code) => {
    try {
        const response = await fetch('http://localhost:3001/api/exchange', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ code })
        });
        const data = await response.json();

        if (data.success && data.tokens) {
            saveTokens(data.tokens);
            return { success: true };
        }
        return { success: false, error: data.error };
    } catch (error) {
        console.error('Token exchange error:', error);
        return { success: false, error: error.message };
    }
};

// Získání seznamu vozidel
export const getVehicles = async () => {
    const accessToken = getAccessToken();
    if (!accessToken) throw new Error('Nejste přihlášeni');

    const response = await fetch('http://localhost:3001/api/vehicles', {
        headers: { 'Authorization': `Bearer ${accessToken}` }
    });
    const data = await response.json();
    return data;
};

// Získání informací o vozidle
export const getVehicleInfo = async (vehicleId) => {
    const accessToken = getAccessToken();
    if (!accessToken) throw new Error('Nejste přihlášeni');

    const response = await fetch(`http://localhost:3001/api/vehicles/${vehicleId}`, {
        headers: { 'Authorization': `Bearer ${accessToken}` }
    });
    const data = await response.json();
    return data;
};

// Získání stavu vozidla (kilometry, palivo, lokace, zámky)
export const getVehicleStatus = async (vehicleId) => {
    const accessToken = getAccessToken();
    if (!accessToken) throw new Error('Nejste přihlášeni');

    const response = await fetch(`http://localhost:3001/api/vehicles/${vehicleId}/status`, {
        headers: { 'Authorization': `Bearer ${accessToken}` }
    });
    const data = await response.json();
    return data;
};

// Zamknutí vozidla
export const lockVehicle = async (vehicleId) => {
    const accessToken = getAccessToken();
    if (!accessToken) throw new Error('Nejste přihlášeni');

    const response = await fetch(`http://localhost:3001/api/vehicles/${vehicleId}/lock`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${accessToken}` }
    });
    return response.json();
};

// Odemknutí vozidla
export const unlockVehicle = async (vehicleId) => {
    const accessToken = getAccessToken();
    if (!accessToken) throw new Error('Nejste přihlášeni');

    const response = await fetch(`http://localhost:3001/api/vehicles/${vehicleId}/unlock`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${accessToken}` }
    });
    return response.json();
};

// Odhlášení – smazání tokenů
export const logoutSmartcar = () => {
    localStorage.removeItem('smartcar_access_token');
    localStorage.removeItem('smartcar_refresh_token');
    localStorage.removeItem('smartcar_expires_at');
};

// Kontrola, zda je uživatel přihlášen
export const isAuthenticated = () => {
    return !!getAccessToken() && isTokenValid();
};