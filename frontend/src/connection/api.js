import axios from 'axios';
import { apiURL } from "../config/config";
import { getUserInfo } from '../localStorage';

export const register = async({ name, userName, phoneNumber, email, password })=>{
    try{
        const response = await axios({
            url: `${apiURL}/api/users/register`,
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            data: {
                name,
                userName,
                phoneNumber,
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
        return { error: err.response ? err.response.data.message : err.message };
    }

};
export const update = async({ name, userName, phoneNumber, email, password })=>{
    try{
        const { _id, token } = getUserInfo();
        const response = await axios({
            url: `${apiURL}/api/users/${_id}`,
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`,
            },
            data: {
                name,
                userName,
                phoneNumber,
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
        return {error: err.response.data.message || err.message };
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
        return {error: err.response.data.message || err.message };
    }
};
export const createProduct = async(name, price, image, brand, category, countInStock, description)=>{
    try{
        const { token } = getUserInfo();
        const response = await axios({
            url: `${apiURL}/api/products/createdproducts`,
            method: 'POST',
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
            },
            data: {
                name,
                price,
                image,
                brand,
                category,
                countInStock,
                description
            },
        });
        if(response.statusText !== 'OK'){
            throw new Error(response.data.message);
        }
        return response.data;
    }catch(err){
        console.log(err);
        return {error: err.response.data.message || err.message };
    }
};
export const createReview = async(productId, review)=>{
    try{
        const { token } = getUserInfo();
        const response = await axios({
            url: `${apiURL}/api/products/${productId/reviews}`,
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
            },
            data: review,
        });
        if(response.statusText !== 'OK'){
            throw new Error(response.data.message);
        }
        return response.data;
    }catch(err){
        console.log(err);
        return {error: err.response.data.message || err.message };
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
        if(response.statusText !== 'OK'){
            throw new Error(response.data.message);
        }
        return response.data;
    }catch(err){
        console.log(err);
        return {error: err.response.data.message || err.message };
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
        if(response.statusText !== 'OK'){
            throw new Error(response.data.message);
        }
        return response.data;
    }catch(err){
        console.log(err);
        return {error: err.response.data.message || err.message };
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
                "Content-Type": "multipart/form-data",
            },
            data: formData,
        });
        if(response.statusText !== 'OK'){
            throw new Error(response.data.message);
        }
        return response.data;
    }catch(err){
        console.log(err);
        return {error: err.response.data.message || err.message };
    }
};
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
        if(response.statusText !== 'OK'){
            throw new Error(response.data.message);
        }
        return response.data;
    }catch(err){
        console.log(err);
        return {error: err.response.data.message || err.message };
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
        if(response.statusText !== 'OK'){
            throw new Error(response.data.message);
        }
        return response.data;
    }catch(err){
        console.log(err);
        return {error: err.response.data.message || err.message };
    }
};
export const deleteOrder = async(orderId)=>{
    try{
        const { token } = getUserInfo();
        const response = await axios({
            url: `${apiURL}/api/order/${orderId}`,
            method: "DELETE",
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
        return {error: err.response.data.message || err.message };
    }
};
export const getOrder = async(id)=>{
    try{
        const { token } = getUserInfo();
        const response = await axios({
            url: `${apiURL}/api/orders/${id}`,
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
        return {error: err.response.data.message || err.message };
    }
};
export const getMyOrders = async()=>{
    try{
        const { token } = getUserInfo();
        const response = await axios({
            url: `${apiURL}/api/orders/mine`,
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
        return {error: err.response.data.message || err.message };
    }
};
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
        return {error: err.response.data.message || err.message };
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
        return {error: err.response.data.message || err.message };
    }
};
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
        return {error: err.response.data.message || err.message };
    }
};
export const getSemmary = async()=>{
    try{
        const { token } = getUserInfo();
        const response = await axios({
            url: `${apiURL}/api/orders/summary`,
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
        return {error: err.response.data.message || err.message };
    }
};