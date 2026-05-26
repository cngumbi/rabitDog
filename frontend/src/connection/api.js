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
        // On refresh failure, ensure client signs out and return null
        try { await clearUser(); } catch(e) { /* best-effort */ }
        // Redirect to a refresh-failure page so UX can explain next steps
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
            const data = await refreshToken();
            if(data && data.token){
                originalRequest.headers.Authorization = `Bearer ${data.token}`;
                return apiClient(originalRequest);
            }
            // If refresh failed, ensure we surface the failure to caller
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
//products
//export const getProducts = async ({ searchKeyword = "" }) => {
//    try{
//        let queryString = "?";
//        if(searchKeyword) queryString += `searchKeyword=${searchKeyword}&`;
//
//        const response = await axios({
//            url: `${apiURL}/api/products${queryString}`,
//            method: "GET",
//            headers: {
//                "Content-Type": "application/json",
//            },
//        });
//        if(response.statusText !== 'OK'){
//            throw new Error(response.data.message);
//        }
//        return response.data;
//    }catch(err){
//        console.log(err);
//        return { error: err.response ? err.response.data.message : err.message };
//    }
//};
//export const getProduct = async(id)=>{
//    try{
//        const response = await axios({
//            url: `${apiURL}/api/products/${id}`,
//            method: "GET",
//            headers: {
//                "Content-Type": "application/json",
//            },
//        });
//        if(response.statusText !== 'OK'){
//            throw new Error(response.data.message);
//        }
//        return response.data;
//    }catch(err){
//        console.log(err);
//        return { error: err.response ? err.response.data.message : err.message };
//    }
//};
//export const createProduct = async({name, price, brand, category, countInStock, description})=>{
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
//                name,
//                price,
//                brand,
//                category,
//                countInStock,
//                description
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
//
//export const createReview = async(productId, review)=>{
//    try{
//        const { token } = getUserInfo();
//        const response = await axios({
//            url: `${apiURL}/api/products/${productId/reviews}`,
//            method: "POST",
//            headers: {
//                "Content-Type": "application/json",
//                Authorization: `Bearer ${token}`,
//            },
//            data: review,
//        });
//        if(response.statusText !== 'OK'){
//            throw new Error(response.data.message);
//        }
//        return response.data;
//    }catch(err){
//        console.log(err);
//        return { error: err.response ? err.response.data.message : err.message };
//    }
//};
//export const deleteProduct = async(productId)=>{
//    try{
//        const { token } = getUserInfo();
//        const response = await axios({
//            url: `${apiURL}/api/products/${productId}`,
//            method: "DELETE",
//            headers: {
//                "Content-Type": "application/json",
//                Authorization: `Bearer ${token}`,
//            },
//        });
//        if(response.statusText !== 'OK'){
//            throw new Error(response.data.message);
//        }
//        return response.data;
//    }catch(err){
//        console.log(err);
//        return { error: err.response ? err.response.data.message : err.message };
//    }
//};
//export const updateProduct = async(product)=>{
//    try{
//        const { token } = getUserInfo();
//        const response = await axios({
//            url: `${apiURL}/api/products/${product._id}`,
//            method: "PUT",
//            headers: {
//                "Content-Type": "application/json",
//                Authorization: `Bearer ${token}`,
//            },
//            data: product,
//        });
//        if(response.statusText !== 'OK'){
//            throw new Error(response.data.message);
//        }
//        return response.data;
//    }catch(err){
//        console.log(err);
//        return { error: err.response ? err.response.data.message : err.message };
//    }
//};
//export const uploadProductImage = async(formData)=>{
//    try{
//        const { token } = getUserInfo();
//        const response = await axios({
//            url: `${apiURL}/api/uploads`,
//            method: "POST",
//            headers: {
//                Authorization: `Bearer ${token}`,
//                "Content-Type": "multipart/form-data",
//            },
//            data: formData,
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
//export const createOrder = async(order)=>{
//    try{
//        const { token } = getUserInfo();
//        const response = await axios({
//            url: `${apiURL}/api/orders`,
//            method: "POST",
//            headers: {
//                "Content-Type": "application/json",
//                Authorization: `Bearer ${token}`,
//            },
//            data: order,
//        });
//        if(response.statusText !== 'OK'){
//            throw new Error(response.data.message);
//        }
//        return response.data;
//    }catch(err){
//        console.log(err);
//        return { error: err.response ? err.response.data.message : err.message };
//    }
//};
//export const getOrders = async()=>{
//    try{
//        const { token } = getUserInfo();
//        const response = await axios({
//            url: `${apiURL}/api/orders`,
//            method: "GET",
//            headers: {
//                "Content-Type": "application/json",
//                Authorization: `Bearer ${token}`,
//            },
//        });
//        if(response.statusText !== 'OK'){
//            throw new Error(response.data.message);
//        }
//        return response.data;
//    }catch(err){
//        console.log(err);
//        return { error: err.response ? err.response.data.message : err.message };
//    }
//};
//export const deleteOrder = async(orderId)=>{
//    try{
//        const { token } = getUserInfo();
//        const response = await axios({
//            url: `${apiURL}/api/orders/${orderId}`,
//            method: "DELETE",
//            headers: {
//                "Content-Type": "application/json",
//                Authorization: `Bearer ${token}`,
//            },
//        });
//        if(response.statusText !== 'OK'){
//            throw new Error(response.data.message);
//        }
//        return response.data;
//    }catch(err){
//        console.log(err);
//        return { error: err.response ? err.response.data.message : err.message };
//    }
//};
//export const getOrder = async(id)=>{
//    try{
//        const { token } = getUserInfo();
//        const response = await axios({
//            url: `${apiURL}/api/orders/${id}`,
//            headers: {
//                "Content-Type": "application/json",
//                Authorization: `Bearer ${token}`,
//            },
//        });
//        if(response.statusText !== 'OK'){
//            throw new Error(response.data.message);
//        }
//        return response.data;
//    }catch(err){
//        console.log(err);
//        return { error: err.response ? err.response.data.message : err.message };
//    }
//};
//export const getMyOrders = async()=>{
//    try{
//        const { token } = getUserInfo();
//        const response = await axios({
//            url: `${apiURL}/api/orders/mine`,
//            headers: {
//                "Content-Type": "application/json",
//                Authorization: `Bearer ${token}`,
//            },
//        });
//        if(response.statusText !== 'OK'){
//            throw new Error(response.data.message);
//        }
//        return response.data;
//    }catch(err){
//        console.log(err);
//        return { error: err.response ? err.response.data.message : err.message };
//    }
//};
//export const getPaypalClientId = async()=>{
//    try{
//        const response = await axios({
//            url: `${apiURL}/api/paypal/clientId`,
//            headers: {
//                "Content-Type": "application/json",
//            },
//        });
//        if(response.statusText !== 'OK'){
//            throw new Error(response.data.message);
//        }
//        return response.data.clientId;
//    }catch(err){
//        console.log(err);
//        return { error: err.response ? err.response.data.message : err.message };
//    }
//};
//export const payOrder = async(orderId, paymentResult)=>{
//    try{
//        const { token } = getUserInfo();
//        const response = await axios({
//            url: `${apiURL}/api/orders/${orderId}/pay`,
//            method: "PUT",
//            headers: {
//                "Content-Type": "application/json",
//                Authorization: `Bearer ${token}`,
//            },
//            data: paymentResult,
//        });
//        if(response.statusText !== 'OK'){
//            throw new Error(response.data.message);
//        }
//        return response.data;
//    }catch(err){
//        console.log(err);
//        return { error: err.response ? err.response.data.message : err.message };
//    }
//};
//export const deliverOrder = async(orderId)=>{
//    try{
//        const { token } = getUserInfo();
//        const response = await axios({
//            url: `${apiURL}/api/orders/${orderId}/deliver`,
//            method: "PUT",
//            headers: {
//                "Content-Type": "application/json",
//                Authorization: `Bearer ${token}`,
//            },
//        });
//        if(response.statusText !== 'OK'){
//            throw new Error(response.data.message);
//        }
//        return response.data;
//    }catch(err){
//        console.log(err);
//        return { error: err.response ? err.response.data.message : err.message };
//    }
//};
//export const getSummary = async()=>{
//    try{
//        const { token } = getUserInfo();
//        const response = await axios({
//            url: `${apiURL}/api/orders/summary`,
//            method: "PUT",
//            headers: {
//                "Content-Type": "application/json",
//                Authorization: `Bearer ${token}`,
//            },
//        });
//        if(response.statusText !== 'OK'){
//            throw new Error(response.data.message);
//        }
//        return response.data;
//    }catch(err){
//        console.log(err);
//        return { error: err.response ? err.response.data.message : err.message };
//    }
//};