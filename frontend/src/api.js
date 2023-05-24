import axios from 'axios';
import { apiUrl } from './config/config';
//----------------------------------------------------------------
//registration
//----------------------------------------------------------------
export const login = async({ email, password }) => {
    try {
        const response = await axios({
            url: `${apiURL}/api/users/signin`,
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            data: {
                email,
                password,
            },
        });
        if (response.statusText !== 'OK') {
            throw new Error(response.data.message);
        }
        return response.data;

    } catch (err) {
        console.log(err);
        return { error: err.response ? err.response.data.message : err.massage };

    }
};
export const register = async({ name, email, password }) => {
    try {
        const response = await axios({
            url: `${apiURL}/api/users/register`,
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            data: {
                name,
                email,
                password,
            },
        });
        if (response.statusText !== 'OK') {
            throw new Error(response.data.message);
        }
        return response.data;

    } catch (err) {
        console.log(err);
        return { error: err.response ? err.response.data.message : err.massage };

    }
};
//--------------------------------------------------------------
//messages
//--------------------------------------------------------------
export const messages = async({name, email, number, subject, message}) => {
    try{
        const response = await axios({
            url: `${apiUrl}/api/contacts/contact`,
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            data: {
                name,
                email,
                number,
                subject,
                message
            }
        });
        if(response.statusText !== 'OK'){
            throw new Error(response.data.message);
        }
        return response.data;
    }catch(err){
        console.log(err);
        return { error: err.response ? err.response.date.message : err.message };
    }
};
export const getMessage = async(id) => {
    try{
        const response = await axios({
            url: `${apiUrl}/api/contacts/${id}`,
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
        });
        if (response.statusText !== 'OK') {
            throw new Error(response.data.message);
        }
        return response.data;
    }catch(err){
        console.log(err);
        return { error: err.response ? err.response.date.message : err.message };
    }
};
export const getMessages = async() => {
    try{
        const response = await axios({
            url: `${apiUrl}/api/contacts/`,
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
        });
        if (response.statusText !== 'OK') {
            throw new Error(response.data.message);
        }
        return response.data;
    }catch(err){
        console.log(err);
        return { error: err.response ? err.response.date.message : err.message };
    }
};
//--------------------------------------------------------------
//services
//--------------------------------------------------------------
export const services = async({ serviceTitle, serviceDescription }) => {
    try{
        const response = await axios({
            url: `${apiUrl}/api/services/service`,
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            data: {
                serviceTitle,
                serviceDescription
            }
        });
        if(response.statusText !== 'OK'){
            throw new Error(response.data.message);
        }
        return response.data;
    }catch(err){
        console.log(err);
        return { error: err.response ? err.response.date.message : err.message };
    }
};
export const getServices = async() => {
    try{
        const response = await axios({
            url: `${apiUrl}/api/services/`,
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
        });
        if (response.statusText !== 'OK') {
            throw new Error(response.data.message);
        }
        return response.data;
    }catch(err){
        console.log(err);
        return { error: err.response ? err.response.date.message : err.message };
    }
};