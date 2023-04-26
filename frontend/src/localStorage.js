//user info
export const setUserInfo = ({
    _id = '',
    name = '',
    email = '',
    password = '',
    token = '',
    isAdmin = true
}) => {
    localStorage.setItem(
        'userInfo',
        JSON.stringify({
            _id,
            name,
            email,
            password,
            token,
            isAdmin
        })
    );
};
//Sign out
export const clearUser = () => {
    localStorage.removeItem('userInfo');

};
export const getUserInfo = () => {
    return localStorage.getItem('userInfo') ?
        JSON.parse(localStorage.getItem('userInfo')) : 
        { name: '', email: '', password: '' };
};
//contact info
export const setContactInfo = ({
    _id = '',
    name = '',
    email = '',
    number = '',
    subject = '',
    message = ''
})=>{
    localStorage.setItem(
        'contactInfo',
        JSON.stringify({
            _id,
            name,
            email,
            number,
            subject,
            message
        })
    );
};
export const getContactInfo = () => {
    return localStorage.getItem('contactInfo') ? 
        JSON.parse(localStorage.getItem('contactInfo')) :
        {name:'', email:'', number:'', subject:'', message:''};
}

//service info
export const setServiceInfo = ({
    _id = '',
    serviceTitle = '',
    serviceDescription = ''
    
})=>{
    localStorage.setItem(
        'serviceInfo',
        JSON.stringify({
            _id,
            serviceTitle,
            serviceDescription
        })
    );
};
export const getServiceInfo = () => {
    return localStorage.getItem('serviceInfo') ? 
        JSON.parse(localStorage.getItem('serviceInfo')) :
        { serviceTitle:'', serviceDescription:'' };
}