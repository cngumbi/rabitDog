import axios from 'axios';
import { apiURL } from "../config/config";
import { getUserInfo, setUserInfo, clearUser } from '../localStorage';

const apiClient = axios.create({
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
        try { await clearUser(); } catch(e) { /* best-effort */ }
        document.location.hash = '/refresh-failed';
        return null;
    }
};

apiClient.interceptors.request.use((config)=>{
    const { token } = getUserInfo();
    if(token){
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

apiClient.interceptors.response.use(
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
            const { token } = getUserInfo();
            if(!token){
                try { await clearUser(); } catch(e) { /* best-effort */ }
                document.location.hash = '/';
                return Promise.reject(new Error('Unauthorized - please sign in'));
            }
            const data = await refreshToken();
            if(data && data.token){
                originalRequest.headers.Authorization = `Bearer ${data.token}`;
                return apiClient(originalRequest);
            }
            return Promise.reject(new Error('Session expired - refresh failed'));
        }
        return Promise.reject(error);
    }
);

export const register = async({ email, password })=>{
    try{
        const response = await axios({
            url: `${apiURL}/api/users/register`,
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            data: {
                email,
                password
            }
        });
        if(response.statusText !== 'OK'){
            throw new Error(response.data.message);
        }
        return response.data
    } catch(err){
        return { error: err.response ? err.response.data.message : err.message };
     }
};
export const signIn = async({email, password})=>{
    try{
        const response =await axios({
            url: `${apiURL}/api/users/signin`,
            method: 'POST',
            withCredentials: true,
            headers: {
                'Content-Type': 'application/json',
            },
            data:{
                email,
                password
            }
        });
        if(response.statusText !== 'OK') throw new Error(response.data.message);
        return response.data;
    }catch(err){
        return {
            error: err.response ? err.response.data.message : err.message,
            status: err.response ? err.response.status : null,
            lockedUntil: err.response && err.response.data ? err.response.data.lockedUntil : null,
        };
    }

};
export const update = async({ email, password, currentPassword })=>{
    try{
        const { _id } = getUserInfo();
        const response = await apiClient({
            url: `/api/users/${_id}`,
            method: 'PUT',
            data: {
                email,
                password,
                currentPassword
            }
        });
        if(response.statusText !== 'OK'){
            throw new Error(response.data.message);
        }
        return response.data
    } catch(err){
        return { error: err.response ? err.response.data.message : err.message };
     }
};
export const getProfileSummary =  async ()=>{
    try{
        const response = await apiClient({
            url: '/api/users/profile-summary',
            method: 'GET',
        });
        return response.data;
    }catch(error){
        return { error: error.response ? error.response.data.message : error.message };
    }
};
export const updateProfile = async(profileData)=>{
    try{

        const response = await apiClient({
            url: "/api/profile",
            method: "PUT",
            data: profileData
        });

        return response.data;

    }catch(err){

        return {
            error: err.response
                ? err.response.data.message
                : err.message
        };

    }
};

export const getSettings = async()=>{
    try{
        const response = await apiClient({
            url: '/api/profile/settings',
            method: 'GET',
        });
        return response.data;
    }catch(error){
        return { error: error.response ? error.response.data.message : error.message };
    }
};

export const updateSettings = async(settingsData)=>{
    try{
        const response = await apiClient({
            url: '/api/profile/settings',
            method: 'PUT',
            data: settingsData,
        });
        return response.data;
    }catch(error){
        return { error: error.response ? error.response.data.message : error.message };
    }
};

export const getHealthSummary = async () => {
    try {
        const response = await apiClient({
            url: '/api/health-records/summary',
            method: 'GET',
        });
        return response.data;
    } catch (error) {
        return { error: error.response ? error.response.data.message : error.message };
    }
};

export const getHealthRecords = async ({ searchKeyword = '', severity = '', action = '' } = {}) => {
    try {
        const queryParams = [];
        if (searchKeyword) queryParams.push(`searchKeyword=${encodeURIComponent(searchKeyword)}`);
        if (severity) queryParams.push(`severity=${encodeURIComponent(severity)}`);
        if (action) queryParams.push(`action=${encodeURIComponent(action)}`);
        const queryString = queryParams.length ? `?${queryParams.join('&')}` : '';
        const response = await apiClient({
            url: `/api/health-records${queryString}`,
            method: 'GET',
        });
        return response.data;
    } catch (error) {
        return { error: error.response ? error.response.data.message : error.message };
    }
};

export const createHealthRecord = async (data) => {
    try {
        const response = await apiClient({
            url: '/api/health-records',
            method: 'POST',
            data,
        });
        return response.data;
    } catch (error) {
        return { error: error.response ? error.response.data.message : error.message };
    }
};

export const updateHealthRecord = async (id, data) => {
    try {
        const response = await apiClient({
            url: `/api/health-records/${id}`,
            method: 'PUT',
            data,
        });
        return response.data;
    } catch (error) {
        return { error: error.response ? error.response.data.message : error.message };
    }
};

export const deleteHealthRecord = async (id) => {
    try {
        const response = await apiClient({
            url: `/api/health-records/${id}`,
            method: 'DELETE',
        });
        return response.data;
    } catch (error) {
        return { error: error.response ? error.response.data.message : error.message };
    }
};

//get paginated activity logs
export const getActivityLog = async(page = 1, limit = 15) => {
    try{
        const response = await fetch(
            `/api/profile/activity-log?page=${page}&limit=${limit}`,
            {
                method: "GET",
                credentials: "include",
                headers: {
                    "Content-Type": "application/json"
                }
            }
        );
        return await response.json();
    }catch(error){
        return { error: error.message || "Failed to Load Activity Log"}
    }
}


//products
export const getProducts = async ({ searchKeyword = "" }) => {
    try{
        let queryString = "?";
        if(searchKeyword) queryString += `searchKeyword=${searchKeyword}&`;

        const response = await axios({
            url: `${apiURL}/api/products${queryString}`,
            method: "GET",
            headers: {
                "Content-Type": "application/json",
            },
        });
        if(response.statusText !== 'OK'){
            throw new Error(response.data.message);
        }
        return response.data;
    }catch(err){
        console.log(err);
        return { error: err.response ? err.response.data.message : err.message };
    }
};
export const getProduct = async(id)=>{
    try{
        const response = await axios({
            url: `${apiURL}/api/products/${id}`,
            method: "GET",
            headers: {
                "Content-Type": "application/json",
            },
        });
        if(response.statusText !== 'OK'){
            throw new Error(response.data.message);
        }
        return response.data;
    }catch(err){
        console.log(err);
        return { error: err.response ? err.response.data.message : err.message };
    }
};
export const createProduct = async({name, price, brand, category, countInStock, description, image, sku, reorderPoint})=>{
    try{
        const { token } = getUserInfo();
        const response = await axios({
            url: `${apiURL}/api/products`,
            method: 'POST',
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
            },
            data: {
                name,
                price,
                brand,
                category,
                countInStock,
                description,
                image,
                sku,
                reorderPoint
            },
        });
        if(response.status < 200 || response.status >= 300){
            throw new Error(response.data.message || 'Failed to create product');
        }
        return response.data;
    }catch(err){
        console.log(err);
        return { error: err.response ? err.response.data.message : err.message };
    }
};
export const updateProduct = async(product)=>{
    try{
        const { token } = getUserInfo();
        const response = await axios({
            url: `${apiURL}/api/products/${product._id}`,
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
            },
            data: product,
        });
        if(response.status < 200 || response.status >= 300){
            throw new Error(response.data.message || 'Failed to update product');
        }
        return response.data;
    }catch(err){
        console.log(err);
        return { error: err.response ? err.response.data.message : err.message };
    }
};
export const deleteProduct = async(productId)=>{
    try{
        const { token } = getUserInfo();
        const response = await axios({
            url: `${apiURL}/api/products/${productId}`,
            method: "DELETE",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
            },
        });
        if(response.status < 200 || response.status >= 300){
            throw new Error(response.data.message || 'Failed to delete product');
        }
        return response.data;
    }catch(err){
        console.log(err);
        return { error: err.response ? err.response.data.message : err.message };
    }
};
export const uploadProductImage = async(formData)=>{
    try{
        const { token } = getUserInfo();
        const response = await axios({
            url: `${apiURL}/api/uploads`,
            method: "POST",
            headers: {
                Authorization: `Bearer ${token}`,
            },
            data: formData,
        });
        if(response.status < 200 || response.status >= 300){
            throw new Error(response.data.message || 'Image upload failed');
        }
        return response.data;
    }catch(err){
        console.log(err);
        return { error: err.response ? err.response.data.message : err.message };
    }
};
//orders
export const createOrder = async(order)=>{
    try{
        const { token } = getUserInfo();
        const response = await axios({
            url: `${apiURL}/api/orders`,
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
            },
            data: order,
        });
        if(response.status < 200 || response.status >= 300){
            throw new Error(response.data.message || 'Failed to create order');
        }
        return response.data;
    }catch(err){
        console.log(err);
        return { error: err.response ? err.response.data.message : err.message };
    }
};
export const getOrders = async()=>{
    try{
        const { token } = getUserInfo();
        const response = await axios({
            url: `${apiURL}/api/orders`,
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
            },
        });
        if(response.status < 200 || response.status >= 300){
            throw new Error(response.data.message || 'Failed to load orders');
        }
        return response.data;
    }catch(err){
        console.log(err);
        return { error: err.response ? err.response.data.message : err.message };
    }
};
export const deleteOrder = async(orderId)=>{
    try{
        const { token } = getUserInfo();
        const response = await axios({
            url: `${apiURL}/api/orders/${orderId}`,
            method: "DELETE",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
            },
        });
        if(response.status < 200 || response.status >= 300){
            throw new Error(response.data.message || 'Failed to delete order');
        }
        return response.data;
    }catch(err){
        console.log(err);
        return { error: err.response ? err.response.data.message : err.message };
    }
};
export const getOrder = async(id)=>{
    try{
        const { token } = getUserInfo();
        const response = await axios({
            url: `${apiURL}/api/orders/${id}`,
            method: 'GET',
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
            },
        });
        if(response.status < 200 || response.status >= 300){
            throw new Error(response.data.message || 'Failed to load order');
        }
        return response.data;
    }catch(err){
        console.log(err);
        return { error: err.response ? err.response.data.message : err.message };
    }
};
export const getMyOrders = async()=>{
    try{
        const { token } = getUserInfo();
        const response = await axios({
            url: `${apiURL}/api/orders/mine`,
            method: 'GET',
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
            },
        });
        if(response.status < 200 || response.status >= 300){
            throw new Error(response.data.message || 'Failed to load your orders');
        }
        return response.data;
    }catch(err){
        console.log(err);
        return { error: err.response ? err.response.data.message : err.message };
    }
};
//reviews
export const createReview = async(productId, review)=>{
    try{
        const { token } = getUserInfo();
        const response = await axios({
            url: `${apiURL}/api/products/${productId}/reviews`,
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
            },
            data: review,
        });
        if(response.status < 200 || response.status >= 300){
            throw new Error(response.data.message || 'Failed to create review');
        }
        return response.data;
    }catch(err){
        console.log(err);
        return { error: err.response ? err.response.data.message : err.message };
    }
};
//payment
//paypal payment
export const getPaypalClientId = async()=>{
    try{
        const response = await axios({
            url: `${apiURL}/api/paypal/clientId`,
            headers: {
                "Content-Type": "application/json",
            },
        });
        if(response.statusText !== 'OK'){
            throw new Error(response.data.message);
        }
        return response.data.clientId;
    }catch(err){
        console.log(err);
        return { error: err.response ? err.response.data.message : err.message };
    }
};
export const payOrder = async(orderId, paymentResult)=>{
    try{
        const { token } = getUserInfo();
        const response = await axios({
            url: `${apiURL}/api/orders/${orderId}/pay`,
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
            },
            data: paymentResult,
        });
        if(response.statusText !== 'OK'){
            throw new Error(response.data.message);
        }
        return response.data;
    }catch(err){
        console.log(err);
        return { error: err.response ? err.response.data.message : err.message };
    }
};
//delivery
export const deliverOrder = async(orderId)=>{
    try{
        const { token } = getUserInfo();
        const response = await axios({
            url: `${apiURL}/api/orders/${orderId}/deliver`,
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
            },
        });
        if(response.statusText !== 'OK'){
            throw new Error(response.data.message);
        }
        return response.data;
    }catch(err){
        console.log(err);
        return { error: err.response ? err.response.data.message : err.message };
    }
};
//order summary
export const getSummary = async()=>{
    try{
        const { token } = getUserInfo();
        const response = await axios({
            url: `${apiURL}/api/orders/summary`,
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
            },
        });
        if(response.status < 200 || response.status >= 300){
            throw new Error(response.data.message || 'Failed to load summary');
        }
        return response.data;
    }catch(err){
        console.log(err);
        return { error: err.response ? err.response.data.message : err.message };
    }
};

//export const createSubscriber = async(
//    {
//        title, 
//        firstName, 
//        middleName,
//        surName, 
//        accountType, 
//        telePhone, 
//        installationContact,
//        City, 
//        apartmentNumber,
//        floorNumber,
//        Estate,
//        area,
//        road,
//        GPS,
//        buildingName,
//        billingFrequency,
//        email,
//        contactPerson,
//        contactNumber,
//        dateCreated,
//        timeCreated
//
//    })=>{
//    try{
//        const { token } = getUserInfo();
//        const response = await axios({
//            url: `${apiURL}/api/products`,
//            method: 'POST',
//            headers: {
//                "Content-Type": "application/json",
//                Authorization: `Bearer ${token}`,
//            },
//            data: {
//                title, 
//                firstName, 
//                middleName,
//                surName, 
//                accountType, 
//                telePhone, 
//                installationContact,
//                City, 
//                apartmentNumber,
//                floorNumber,
//                Estate,
//                area,
//                road,
//                GPS,
//                buildingName,
//                billingFrequency,
//                email,
//                contactPerson,
//                contactNumber,
//                dateCreated,
//                timeCreated
//            },
//        });
//        if(response.statusText !== 'Created'){
//            throw new Error(response.data.message);
//        }
//        return response.data;
//    }catch(err){
//        console.log(err);
//        return { error: err.response ? err.response.data.message : err.message };
//    }
//};

// ============= PARTIES =============
export const getParties = async () => {
    try {
        const response = await apiClient({
            url: `/api/parties`,
            method: 'GET',
        });
        if (response.status < 200 || response.status >= 300) {
            throw new Error(response.data.message || 'Failed to load parties');
        }
        return response.data;
    } catch (err) {
        console.log(err);
        return { error: err.response ? err.response.data.message : err.message };
    }
};

export const getPartiesByType = async (type) => {
    try {
        const response = await apiClient({
            url: `/api/parties/type/${type}`,
            method: 'GET',
        });
        if (response.status < 200 || response.status >= 300) {
            throw new Error(response.data.message || 'Failed to load parties');
        }
        return response.data;
    } catch (err) {
        console.log(err);
        return { error: err.response ? err.response.data.message : err.message };
    }
};

export const getPartyStats = async () => {
    try {
        const response = await apiClient({
            url: `/api/parties/summary/stats`,
            method: 'GET',
        });
        if (response.status < 200 || response.status >= 300) {
            throw new Error(response.data.message || 'Failed to load party stats');
        }
        return response.data;
    } catch (err) {
        console.log(err);
        return { error: err.response ? err.response.data.message : err.message };
    }
};

export const getParty = async (id) => {
    try {
        const response = await apiClient({
            url: `/api/parties/${id}`,
            method: 'GET',
        });
        if (response.status < 200 || response.status >= 300) {
            throw new Error(response.data.message || 'Failed to load party');
        }
        return response.data;
    } catch (err) {
        console.log(err);
        return { error: err.response ? err.response.data.message : err.message };
    }
};

export const createParty = async (partyData) => {
    try {
        const response = await apiClient({
            url: `/api/parties`,
            method: 'POST',
            data: partyData,
        });
        if (response.status < 200 || response.status >= 300) {
            throw new Error(response.data.message || 'Failed to create party');
        }
        return response.data;
    } catch (err) {
        console.log(err);
        return { error: err.response ? err.response.data.message : err.message };
    }
};

export const updateParty = async (id, partyData) => {
    try {
        const response = await apiClient({
            url: `/api/parties/${id}`,
            method: 'PUT',
            data: partyData,
        });
        if (response.status < 200 || response.status >= 300) {
            throw new Error(response.data.message || 'Failed to update party');
        }
        return response.data;
    } catch (err) {
        console.log(err);
        return { error: err.response ? err.response.data.message : err.message };
    }
};

export const deleteParty = async (id) => {
    try {
        const response = await apiClient({
            url: `/api/parties/${id}`,
            method: 'DELETE',
        });
        if (response.status < 200 || response.status >= 300) {
            throw new Error(response.data.message || 'Failed to delete party');
        }
        return response.data;
    } catch (err) {
        console.log(err);
        return { error: err.response ? err.response.data.message : err.message };
    }
};

export const getPartySummaryStats = async () => {
    try {
        const response = await apiClient({
            url: `/api/parties/summary/stats`,
            method: 'GET',
        });
        if (response.status < 200 || response.status >= 300) {
            throw new Error(response.data.message || 'Failed to fetch party stats');
        }
        return response.data;
    } catch (err) {
        console.log(err);
        return { error: err.response ? err.response.data.message : err.message };
    }
};

// ============= PURCHASES =============
export const getPurchases = async () => {
    try {
        const { token } = getUserInfo();
        const response = await axios({
            url: `${apiURL}/api/purchases`,
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`,
            },
        });
        if (response.status < 200 || response.status >= 300) {
            throw new Error(response.data.message || 'Failed to load purchases');
        }
        return response.data;
    } catch (err) {
        console.log(err);
        return { error: err.response ? err.response.data.message : err.message };
    }
};

export const getPurchaseStats = async () => {
    try {
        const { token } = getUserInfo();
        const response = await axios({
            url: `${apiURL}/api/purchases/summary/stats`,
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`,
            },
        });
        if (response.status < 200 || response.status >= 300) {
            throw new Error(response.data.message || 'Failed to load purchase stats');
        }
        return response.data;
    } catch (err) {
        console.log(err);
        return { error: err.response ? err.response.data.message : err.message };
    }
};

export const getPurchaseLedger = async () => {
    try {
        const { token } = getUserInfo();
        const response = await axios({
            url: `${apiURL}/api/purchases/export/ledger`,
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`,
            },
        });
        if (response.status < 200 || response.status >= 300) {
            throw new Error(response.data.message || 'Failed to export purchase ledger');
        }
        return response.data;
    } catch (err) {
        console.log(err);
        return { error: err.response ? err.response.data.message : err.message };
    }
};

export const getPurchase = async (id) => {
    try {
        const { token } = getUserInfo();
        const response = await axios({
            url: `${apiURL}/api/purchases/${id}`,
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`,
            },
        });
        if (response.status < 200 || response.status >= 300) {
            throw new Error(response.data.message || 'Failed to load purchase');
        }
        return response.data;
    } catch (err) {
        console.log(err);
        return { error: err.response ? err.response.data.message : err.message };
    }
};

export const createPurchase = async (purchaseData) => {
    try {
        const { token } = getUserInfo();
        const response = await axios({
            url: `${apiURL}/api/purchases`,
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`,
            },
            data: purchaseData,
        });
        if (response.status < 200 || response.status >= 300) {
            throw new Error(response.data.message || 'Failed to create purchase');
        }
        return response.data;
    } catch (err) {
        console.log(err);
        return { error: err.response ? err.response.data.message : err.message };
    }
};

export const updatePurchase = async (id, purchaseData) => {
    try {
        const { token } = getUserInfo();
        const response = await axios({
            url: `${apiURL}/api/purchases/${id}`,
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`,
            },
            data: purchaseData,
        });
        if (response.status < 200 || response.status >= 300) {
            throw new Error(response.data.message || 'Failed to update purchase');
        }
        return response.data;
    } catch (err) {
        console.log(err);
        return { error: err.response ? err.response.data.message : err.message };
    }
};

export const approvePurchase = async (id) => {
    try {
        const { token } = getUserInfo();
        const response = await axios({
            url: `${apiURL}/api/purchases/${id}/approve`,
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`,
            },
        });
        if (response.status < 200 || response.status >= 300) {
            throw new Error(response.data.message || 'Failed to approve purchase');
        }
        return response.data;
    } catch (err) {
        console.log(err);
        return { error: err.response ? err.response.data.message : err.message };
    }
};

export const receivePurchase = async (id) => {
    try {
        const { token } = getUserInfo();
        const response = await axios({
            url: `${apiURL}/api/purchases/${id}/receive`,
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`,
            },
        });
        if (response.status < 200 || response.status >= 300) {
            throw new Error(response.data.message || 'Failed to mark purchase as received');
        }
        return response.data;
    } catch (err) {
        console.log(err);
        return { error: err.response ? err.response.data.message : err.message };
    }
};

// ============= TRANSFERS =============
export const getTransfers = async () => {
    try {
        const response = await apiClient({
            url: `/api/transfers`,
            method: 'GET',
        });
        if (response.status < 200 || response.status >= 300) {
            throw new Error(response.data.message || 'Failed to load transfers');
        }
        return response.data;
    } catch (err) {
        console.log(err);
        return { error: err.response ? err.response.data.message : err.message };
    }
};

export const getTransferStats = async () => {
    try {
        const response = await apiClient({
            url: `/api/transfers/summary/stats`,
            method: 'GET',
        });
        if (response.status < 200 || response.status >= 300) {
            throw new Error(response.data.message || 'Failed to load transfer stats');
        }
        return response.data;
    } catch (err) {
        console.log(err);
        return { error: err.response ? err.response.data.message : err.message };
    }
};

export const getTransferLog = async () => {
    try {
        const response = await apiClient({
            url: `/api/transfers/export/log`,
            method: 'GET',
        });
        if (response.status < 200 || response.status >= 300) {
            throw new Error(response.data.message || 'Failed to export transfer log');
        }
        return response.data;
    } catch (err) {
        console.log(err);
        return { error: err.response ? err.response.data.message : err.message };
    }
};

export const getTransfer = async (id) => {
    try {
        const response = await apiClient({
            url: `/api/transfers/${id}`,
            method: 'GET',
        });
        if (response.status < 200 || response.status >= 300) {
            throw new Error(response.data.message || 'Failed to load transfer');
        }
        return response.data;
    } catch (err) {
        console.log(err);
        return { error: err.response ? err.response.data.message : err.message };
    }
};

export const createTransfer = async (transferData) => {
    try {
        const response = await apiClient({
            url: `/api/transfers`,
            method: 'POST',
            data: transferData,
        });
        if (response.status < 200 || response.status >= 300) {
            throw new Error(response.data.message || 'Failed to create transfer');
        }
        return response.data;
    } catch (err) {
        console.log(err);
        return { error: err.response ? err.response.data.message : err.message };
    }
};

export const updateTransfer = async (id, transferData) => {
    try {
        const response = await apiClient({
            url: `/api/transfers/${id}`,
            method: 'PUT',
            data: transferData,
        });
        if (response.status < 200 || response.status >= 300) {
            throw new Error(response.data.message || 'Failed to update transfer');
        }
        return response.data;
    } catch (err) {
        console.log(err);
        return { error: err.response ? err.response.data.message : err.message };
    }
};

export const dispatchTransfer = async (id) => {
    try {
        const response = await apiClient({
            url: `/api/transfers/${id}/dispatch`,
            method: 'POST',
        });
        if (response.status < 200 || response.status >= 300) {
            throw new Error(response.data.message || 'Failed to dispatch transfer');
        }
        return response.data;
    } catch (err) {
        console.log(err);
        return { error: err.response ? err.response.data.message : err.message };
    }
};

export const receiveTransfer = async (id, items) => {
    try {
        const response = await apiClient({
            url: `/api/transfers/${id}/receive`,
            method: 'POST',
            data: { items },
        });
        if (response.status < 200 || response.status >= 300) {
            throw new Error(response.data.message || 'Failed to mark transfer as received');
        }
        return response.data;
    } catch (err) {
        console.log(err);
        return { error: err.response ? err.response.data.message : err.message };
    }
};

// ============= EXPENSES =============
export const getExpenses = async () => {
    try {
        const { token } = getUserInfo();
        const response = await axios({
            url: `${apiURL}/api/expenses`,
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`,
            },
        });
        if (response.status < 200 || response.status >= 300) {
            throw new Error(response.data.message || 'Failed to load expenses');
        }
        return response.data;
    } catch (err) {
        console.log(err);
        return { error: err.response ? err.response.data.message : err.message };
    }
};

export const getExpenseStats = async () => {
    try {
        const { token } = getUserInfo();
        const response = await axios({
            url: `${apiURL}/api/expenses/summary/stats`,
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`,
            },
        });
        if (response.status < 200 || response.status >= 300) {
            throw new Error(response.data.message || 'Failed to load expense stats');
        }
        return response.data;
    } catch (err) {
        console.log(err);
        return { error: err.response ? err.response.data.message : err.message };
    }
};

export const getExpenseLedger = async () => {
    try {
        const { token } = getUserInfo();
        const response = await axios({
            url: `${apiURL}/api/expenses/export/ledger`,
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`,
            },
        });
        if (response.status < 200 || response.status >= 300) {
            throw new Error(response.data.message || 'Failed to export expense ledger');
        }
        return response.data;
    } catch (err) {
        console.log(err);
        return { error: err.response ? err.response.data.message : err.message };
    }
};

export const getExpense = async (id) => {
    try {
        const { token } = getUserInfo();
        const response = await axios({
            url: `${apiURL}/api/expenses/${id}`,
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`,
            },
        });
        if (response.status < 200 || response.status >= 300) {
            throw new Error(response.data.message || 'Failed to load expense');
        }
        return response.data;
    } catch (err) {
        console.log(err);
        return { error: err.response ? err.response.data.message : err.message };
    }
};

export const createExpense = async (expenseData) => {
    try {
        const { token } = getUserInfo();
        const response = await axios({
            url: `${apiURL}/api/expenses`,
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`,
            },
            data: expenseData,
        });
        if (response.status < 200 || response.status >= 300) {
            throw new Error(response.data.message || 'Failed to create expense');
        }
        return response.data;
    } catch (err) {
        console.log(err);
        return { error: err.response ? err.response.data.message : err.message };
    }
};

export const updateExpense = async (id, expenseData) => {
    try {
        const { token } = getUserInfo();
        const response = await axios({
            url: `${apiURL}/api/expenses/${id}`,
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`,
            },
            data: expenseData,
        });
        if (response.status < 200 || response.status >= 300) {
            throw new Error(response.data.message || 'Failed to update expense');
        }
        return response.data;
    } catch (err) {
        console.log(err);
        return { error: err.response ? err.response.data.message : err.message };
    }
};

export const approveExpense = async (id) => {
    try {
        const { token } = getUserInfo();
        const response = await axios({
            url: `${apiURL}/api/expenses/${id}/approve`,
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`,
            },
        });
        if (response.status < 200 || response.status >= 300) {
            throw new Error(response.data.message || 'Failed to approve expense');
        }
        return response.data;
    } catch (err) {
        console.log(err);
        return { error: err.response ? err.response.data.message : err.message };
    }
};

export const payExpense = async (id) => {
    try {
        const { token } = getUserInfo();
        const response = await axios({
            url: `${apiURL}/api/expenses/${id}/pay`,
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`,
            },
        });
        if (response.status < 200 || response.status >= 300) {
            throw new Error(response.data.message || 'Failed to mark expense as paid');
        }
        return response.data;
    } catch (err) {
        console.log(err);
        return { error: err.response ? err.response.data.message : err.message };
    }
};
//