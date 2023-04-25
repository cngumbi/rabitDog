import axios from 'axios';
import { apiUrl } from './config/config';

export const messages = async({name, email, number, subject, message}) => {
    try{
        const response = await axios({
            url: `${apiUrl}/api/contacts/messages`,
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