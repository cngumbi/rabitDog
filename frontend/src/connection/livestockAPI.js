import { apiURL } from "../config/config";
import { getUserInfo, setUserInfo, clearUser } from '../localStorage';
import axios from 'axios';

const livestockClient = axios.create({
    baseURL: apiURL,
    withCredentials: true,
    headers: {
        'Content-Type': 'application/json',
    },
});

const refreshToken = async () => {
    try{
        const response = await axios({
            url: `${apiURL}/api/users/refresh-token`,
            method: 'POST',
            withCredentials: true,
            headers: {
                'Content-Type': 'application/json',
            },
        });
        if(response.statusText !== 'OK'){
            throw new Error(response.data.message || 'Token refresh failed');
        }
        setUserInfo(response.data);
        return response.data;
    } catch(err){
        try { await clearUser(); } catch(e) {}
        document.location.hash = '/refresh-failed';
        return null;
    }
};

livestockClient.interceptors.request.use((config)=>{
    const { token } = getUserInfo();
    if(token){
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

livestockClient.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;
        if(
            error.response &&
            error.response.status === 401 &&
            originalRequest &&
            !originalRequest._retry &&
            !originalRequest.url.endsWith('/refresh-token')
        ){
            originalRequest._retry = true;
            const data = await refreshToken();
            if(data && data.token){
                originalRequest.headers.Authorization = `Bearer ${data.token}`;
                return livestockClient(originalRequest);
            }
            return Promise.reject(new Error('Session expired - refresh failed'));
        }
        return Promise.reject(error);
    }
);

// Livestock API Methods
export const livestockAPI = {
    // Types
    getAllTypes: () => livestockClient.get('/api/livestock/types'),
    getType: (id) => livestockClient.get(`/api/livestock/types/${id}`),
    createType: (data) => livestockClient.post('/api/livestock/types', data),
    updateType: (id, data) => livestockClient.put(`/api/livestock/types/${id}`, data),
    deleteType: (id) => livestockClient.delete(`/api/livestock/types/${id}`),

    // Batches
    getAllBatches: (filters = {}) => livestockClient.get('/api/livestock/batches', { params: filters }),
    getBatch: (id) => livestockClient.get(`/api/livestock/batches/${id}`),
    createBatch: (data) => livestockClient.post('/api/livestock/batches', data),
    updateBatch: (id, data) => livestockClient.put(`/api/livestock/batches/${id}`, data),
    updateBatchStatus: (id, status) => livestockClient.patch(`/api/livestock/batches/${id}/status`, { status }),
    updateBatchQuantity: (id, currentQuantity) => livestockClient.patch(`/api/livestock/batches/${id}/quantity`, { currentQuantity }),
    deleteBatch: (id) => livestockClient.delete(`/api/livestock/batches/${id}`),

    // Records (Animals)
    getAllRecords: (filters = {}) => livestockClient.get('/api/livestock/records', { params: filters }),
    getRecord: (id) => livestockClient.get(`/api/livestock/records/${id}`),
    createRecord: (data) => livestockClient.post('/api/livestock/records', data),
    updateRecord: (id, data) => livestockClient.put(`/api/livestock/records/${id}`, data),
    updateRecordHealth: (id, health) => livestockClient.patch(`/api/livestock/records/${id}/health`, { health }),
    updateRecordProduction: (id, production) => livestockClient.patch(`/api/livestock/records/${id}/production`, production),
    deleteRecord: (id) => livestockClient.delete(`/api/livestock/records/${id}`),

    // Health Records
    getAllHealthRecords: (filters = {}) => livestockClient.get('/api/livestock/health', { params: filters }),
    getHealthRecord: (id) => livestockClient.get(`/api/livestock/health/${id}`),
    createHealthRecord: (data) => livestockClient.post('/api/livestock/health', data),
    updateHealthRecord: (id, data) => livestockClient.put(`/api/livestock/health/${id}`, data),
    deleteHealthRecord: (id) => livestockClient.delete(`/api/livestock/health/${id}`),

    // Feeding Records
    getAllFeedingRecords: (filters = {}) => livestockClient.get('/api/livestock/feeding', { params: filters }),
    getFeedingRecord: (id) => livestockClient.get(`/api/livestock/feeding/${id}`),
    getBatchFeedingSummary: (batchId) => livestockClient.get(`/api/livestock/feeding/batch/${batchId}/summary`),
    createFeedingRecord: (data) => livestockClient.post('/api/livestock/feeding', data),
    updateFeedingRecord: (id, data) => livestockClient.put(`/api/livestock/feeding/${id}`, data),
    deleteFeedingRecord: (id) => livestockClient.delete(`/api/livestock/feeding/${id}`),

    // Production Records
    getAllProductionRecords: (filters = {}) => livestockClient.get('/api/livestock/production', { params: filters }),
    getProductionRecord: (id) => livestockClient.get(`/api/livestock/production/${id}`),
    getBatchProductionSummary: (batchId) => livestockClient.get(`/api/livestock/production/batch/${batchId}/summary`),
    createProductionRecord: (data) => livestockClient.post('/api/livestock/production', data),
    updateProductionRecord: (id, data) => livestockClient.put(`/api/livestock/production/${id}`, data),
    markProductionAsSold: (id, data) => livestockClient.patch(`/api/livestock/production/${id}/sell`, data),
    deleteProductionRecord: (id) => livestockClient.delete(`/api/livestock/production/${id}`),
};

export default livestockClient;
