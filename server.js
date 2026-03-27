// server.js
import express from 'express';
import cors from 'cors';
import axios from 'axios';

const app = express();
const PORT = 3001;

// Middleware
app.use(cors());
app.use(express.json());

// TVOJE PŘIHLÁŠOVACÍ ÚDAJE ZE SMARTCAR DASHBOARDU
const CLIENT_ID = '2350e7c7-9f57-4b8e-b867-416cd1bb66ca';
const CLIENT_SECRET = '9471f9c6-d8b6-47c2-b7fc-71fb7e0f9185';
const REDIRECT_URI = 'http://localhost:5173/callback';

// Ukládání tokenů (pro demo používáme paměť, v produkci by šlo do DB)
let accessToken = null;
let refreshToken = null;

// 1. Výměna autorizačního kódu za token
app.post('/api/exchange', async (req, res) => {
    const { code } = req.body;

    if (!code) {
        return res.status(400).json({ error: 'Missing authorization code' });
    }

    try {
        const response = await axios.post('https://api.smartcar.com/v2.0/oauth/token', null, {
            params: {
                grant_type: 'authorization_code',
                code,
                client_id: CLIENT_ID,
                client_secret: CLIENT_SECRET,
                redirect_uri: REDIRECT_URI
            }
        });

        accessToken = response.data.access_token;
        refreshToken = response.data.refresh_token;

        res.json({
            success: true,
            tokens: {
                accessToken: response.data.access_token,
                refreshToken: response.data.refresh_token,
                expiresIn: response.data.expires_in
            }
        });
    } catch (error) {
        console.error('Token exchange error:', error.response?.data || error.message);
        res.status(500).json({ error: 'Failed to exchange code' });
    }
});

// 2. Získání seznamu vozidel
app.get('/api/vehicles', async (req, res) => {
    const token = req.headers.authorization?.replace('Bearer ', '');

    if (!token) {
        return res.status(401).json({ error: 'No access token' });
    }

    try {
        const response = await axios.get('https://api.smartcar.com/v2.0/vehicles', {
            headers: { Authorization: `Bearer ${token}` }
        });
        res.json(response.data);
    } catch (error) {
        console.error('Get vehicles error:', error.response?.data || error.message);
        res.status(500).json({ error: 'Failed to get vehicles' });
    }
});

// 3. Získání informací o vozidle
app.get('/api/vehicles/:id', async (req, res) => {
    const { id } = req.params;
    const token = req.headers.authorization?.replace('Bearer ', '');

    if (!token) {
        return res.status(401).json({ error: 'No access token' });
    }

    try {
        const response = await axios.get(`https://api.smartcar.com/v2.0/vehicles/${id}`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        res.json(response.data);
    } catch (error) {
        console.error('Get vehicle info error:', error.response?.data || error.message);
        res.status(500).json({ error: 'Failed to get vehicle info' });
    }
});

// 4. Získání stavu vozidla
app.get('/api/vehicles/:id/status', async (req, res) => {
    const { id } = req.params;
    const token = req.headers.authorization?.replace('Bearer ', '');

    if (!token) {
        return res.status(401).json({ error: 'No access token' });
    }

    try {
        const [odometer, fuel, location, lock] = await Promise.all([
            axios.get(`https://api.smartcar.com/v2.0/vehicles/${id}/odometer`, {
                headers: { Authorization: `Bearer ${token}` }
            }).catch(() => ({ data: { distance: null } })),
            axios.get(`https://api.smartcar.com/v2.0/vehicles/${id}/fuel`, {
                headers: { Authorization: `Bearer ${token}` }
            }).catch(() => ({ data: { percentRemaining: null } })),
            axios.get(`https://api.smartcar.com/v2.0/vehicles/${id}/location`, {
                headers: { Authorization: `Bearer ${token}` }
            }).catch(() => ({ data: null })),
            axios.get(`https://api.smartcar.com/v2.0/vehicles/${id}/lock`, {
                headers: { Authorization: `Bearer ${token}` }
            }).catch(() => ({ data: { locked: null } }))
        ]);

        res.json({
            odometer: odometer.data.distance,
            fuel: fuel.data.percentRemaining,
            location: location.data,
            locked: lock.data.locked
        });
    } catch (error) {
        console.error('Get vehicle status error:', error.response?.data || error.message);
        res.status(500).json({ error: 'Failed to get vehicle status' });
    }
});

// 5. Zamknutí vozidla
app.post('/api/vehicles/:id/lock', async (req, res) => {
    const { id } = req.params;
    const token = req.headers.authorization?.replace('Bearer ', '');

    if (!token) {
        return res.status(401).json({ error: 'No access token' });
    }

    try {
        const response = await axios.post(
            `https://api.smartcar.com/v2.0/vehicles/${id}/lock`,
            {},
            { headers: { Authorization: `Bearer ${token}` } }
        );
        res.json(response.data);
    } catch (error) {
        console.error('Lock error:', error.response?.data || error.message);
        res.status(500).json({ error: 'Failed to lock vehicle' });
    }
});

// 6. Odemknutí vozidla
app.post('/api/vehicles/:id/unlock', async (req, res) => {
    const { id } = req.params;
    const token = req.headers.authorization?.replace('Bearer ', '');

    if (!token) {
        return res.status(401).json({ error: 'No access token' });
    }

    try {
        const response = await axios.post(
            `https://api.smartcar.com/v2.0/vehicles/${id}/unlock`,
            {},
            { headers: { Authorization: `Bearer ${token}` } }
        );
        res.json(response.data);
    } catch (error) {
        console.error('Unlock error:', error.response?.data || error.message);
        res.status(500).json({ error: 'Failed to unlock vehicle' });
    }
});

app.listen(PORT, () => {
    console.log(`🚀 Backend běží na http://localhost:${PORT}`);
    console.log(`📡 API endpointy: http://localhost:${PORT}/api/...`);
});