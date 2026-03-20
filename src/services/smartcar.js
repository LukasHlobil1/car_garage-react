import axios from 'axios';

const SMARTCAR_API_URL = 'https://api.smartcar.com/v2.0';
const API_KEY = import.meta.env.VITE_SMARTCAR_API_KEY;

export const smartcarAPI = {
    getAuthUrl: () => {
        return `https://connect.smartcar.com/oauth/authorize?response_type=code&client_id=${API_KEY}&redirect_uri=${window.location.origin}/callback&scope=read_vehicle_info read_odometer read_fuel read_location read_vin read_engine_oil read_battery read_vehicle_charge`;
    },

    getVehicles: async (accessToken) => {
        const response = await axios.get(`${SMARTCAR_API_URL}/vehicles`, {
            headers: { Authorization: `Bearer ${accessToken}` }
        });
        return response.data.vehicles;
    },

    getVehicleStatus: async (vehicleId, accessToken) => {
        const [odometer, fuel, location, lockStatus] = await Promise.all([
            axios.get(`${SMARTCAR_API_URL}/vehicles/${vehicleId}/odometer`, {
                headers: { Authorization: `Bearer ${accessToken}` }
            }),
            axios.get(`${SMARTCAR_API_URL}/vehicles/${vehicleId}/fuel`, {
                headers: { Authorization: `Bearer ${accessToken}` }
            }),
            axios.get(`${SMARTCAR_API_URL}/vehicles/${vehicleId}/location`, {
                headers: { Authorization: `Bearer ${accessToken}` }
            }),
            axios.get(`${SMARTCAR_API_URL}/vehicles/${vehicleId}/lock`, {
                headers: { Authorization: `Bearer ${accessToken}` }
            })
        ]);

        return {
            odometer: odometer.data.distance,
            fuel: fuel.data.percentRemaining,
            location: location.data,
            locked: lockStatus.data.locked
        };
    },

    lockVehicle: async (vehicleId, accessToken) => {
        const response = await axios.post(
            `${SMARTCAR_API_URL}/vehicles/${vehicleId}/lock`,
            {},
            { headers: { Authorization: `Bearer ${accessToken}` } }
        );
        return response.data;
    },

    unlockVehicle: async (vehicleId, accessToken) => {
        const response = await axios.post(
            `${SMARTCAR_API_URL}/vehicles/${vehicleId}/unlock`,
            {},
            { headers: { Authorization: `Bearer ${accessToken}` } }
        );
        return response.data;
    }
};