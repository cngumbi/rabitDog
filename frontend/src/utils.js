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
        <div>
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
//redirect function
export const veer = ()=>{
    //if(getCartItems().lenght !== 0){
    //    document.location.hash = '/dashboard';
    //}else{
    //    document.location.hash = '/'
    //}
    const user = getUserInfo();
    if(!user && !user.name && user.name.trim() !== ""){
        document.location.hash='/';
        return;
    }else{
        document.location.hash = '/dashboard';
    }
}

//export const veer = () => {
//    const user = getUserInfo();
//
//    if (!user || !user.name?.trim()) {
//        document.location.hash = '/';
//        return;
//    }
//
//    // If profile is not completed → treat as new user
//    if (!user.profileCompleted) {
//        document.location.hash = '/profile';
//    } else {
//        document.location.hash = '/dashboard';
//    }
//};