import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { exchangeCodeForToken } from '../services/smartcar';
import toast from 'react-hot-toast';

const Callback = () => {
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
            const result = await exchangeCodeForToken(code);

            if (result.success) {
                setStatus('Připojení úspěšné! Přesměrovávám...');
                toast.success('Auto bylo úspěšně připojeno!');
                setTimeout(() => navigate('/'), 1500);
            } else {
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
};

export default Callback;