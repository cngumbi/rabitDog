import axios from 'axios';
import { apiURL } from "../config/config";

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
            url: `${apiURL}/api/users/sigin`,
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