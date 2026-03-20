export const demoCars = [
    {
        id: 'skoda-octavia-demo',
        brand: 'Škoda',
        model: 'Octavia RS',
        year: 2023,
        plate: '5E8 1234',
        color: '#4a90e2',
        isReal: false,
        status: {
            odometer: 45230,
            fuel: 65,
            engineTemp: 92,
            battery: 12.4,
            locked: true,
            location: { lat: 50.0755, lng: 14.4378 },
            lastUpdated: new Date().toISOString(),
            tires: { frontLeft: 2.3, frontRight: 2.3, rearLeft: 2.2, rearRight: 2.2 }
        },
        history: [
            { date: '2024-03-15', action: 'Servis', value: 'Výměna oleje' },
            { date: '2024-03-10', action: 'Zamknuto', value: 'Dálkově' },
            { date: '2024-03-05', action: 'Natankováno', value: '45L' }
        ]
    },
    {
        id: 'mazda-cx5-demo',
        brand: 'Mazda',
        model: 'CX-5 SkyActiv',
        year: 2022,
        plate: '6E9 5678',
        color: '#e24a4a',
        isReal: false,
        status: {
            odometer: 18340,
            fuel: 42,
            engineTemp: 88,
            battery: 12.6,
            locked: false,
            location: { lat: 50.0785, lng: 14.4208 },
            lastUpdated: new Date().toISOString(),
            tires: { frontLeft: 2.4, frontRight: 2.4, rearLeft: 2.3, rearRight: 2.3 }
        },
        history: [
            { date: '2024-03-12', action: 'Odemknuto', value: 'Aplikací' },
            { date: '2024-03-08', action: 'Jízda', value: '156 km' },
            { date: '2024-03-01', action: 'STK', value: 'Prošlo' }
        ]
    }
];