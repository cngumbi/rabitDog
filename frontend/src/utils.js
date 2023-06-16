import { getUserInfo } from "./localStorage";

export const pasrseRequest = ()=>{
    const url = document.location.hash.toLowerCase();
    const request =url.split('/');
    return{
        resource: request[1],
        id: request[2],
        verb: request[3]
    };
};
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
    if(!getUserInfo().name){
        window.location.assign('/');
    }else{
        window.location.assign('/home');
    }
}