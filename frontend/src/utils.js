//import { getCartItems } from "./localStorage";

import { getUserInfo } from "./localStorage";


//rerender function
export const vitalize = async(componet)=>{
    document.getElementById('main-content').innerHTML = await componet.render();
    await componet.vignette();
};
//loading message 
export const showLoading = ()=>{
    document.getElementById('loading-overlay').classList.add('active');
};
export const hideLoading = ()=>{
    document.getElementById('loading-overlay').classList.remove('active');
};
//error message display
export const showMessage = (message, callback)=>{
    //get the message overlay element
    const messageOverlay = document.getElementById('message-overlay');
    //create the message content
    const messageContent = `
        <div class="message-box">
            <div id="message-content">${message}</div>
            <button id="close-button">OK</button>
        </div>
    `;
    //set the message overlay content and show it
    messageOverlay.innerHTML = messageContent;
    messageOverlay.classList.add('active');
    //add a click listener to the OK button
    const okButton = document.getElementById('close-button');
    okButton.addEventListener('click', ()=>{
        //hide the message ovarlay
        messageOverlay.classList.remove('active');
        //call the callback function
        if(callback){
            callback();
        }
    });
};
// toast notification (non-blocking)
export const showToast = (message, type = 'info', timeout = 3000) => {
    const container = document.getElementById('toast-container');
    if(!container) return;
    const toast = document.createElement('div');
    toast.className = `app-toast${type === 'error' ? ' app-toast-error' : ''}`;
    toast.innerText = message;
    container.appendChild(toast);
    setTimeout(()=>{
        toast.classList.add('visible');
    }, 10);
    setTimeout(()=>{
        toast.classList.remove('visible');
        setTimeout(()=> container.removeChild(toast), 300);
    }, timeout);
};
export const isValidSku = (sku) => {
    return /^[A-Za-z0-9_-]+$/.test(sku);
};
//redirect function
export const veer = ()=>{
    //if(getCartItems().lenght !== 0){
    //    document.location.hash = '/dashboard';
    //}else{
    //    document.location.hash = '/'
    //}
    //const user = getUserInfo();
}