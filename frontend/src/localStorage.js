export const setUserInfo = ({
    _id = '',
    email = '',
    token = '',
    isAdmin = false,
    verified = false,
    lastLogin = null,
    memberSince = null,
})=>{
    localStorage.setItem(
        'userInfo',
        JSON.stringify({
            _id,
            email,
            token,
            isAdmin,
            verified,
            lastLogin,
            memberSince
        })
    );
};
export const getUserInfo = ()=>{
    return localStorage.getItem('userInfo') ? JSON.parse(localStorage.getItem('userInfo')) : { _id: '', email:'', token:'', isAdmin: false, verified: false };
};
export const clearUser = async ()=>{
    try {
        await fetch('/api/users/signout', {
            method: 'POST',
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json'
            }
        });
    } catch (error) {
        console.error('Error occurred while signing out:', error);
    }
    localStorage.removeItem('userInfo');
};
export const getSettings = ()=>{
    const settings = localStorage.getItem('poultryhub.settings');
    if(settings){
        try {
            return JSON.parse(settings);
        } catch {
            return {
                currency: 'Ksh',
                dateformat: 'DD/MM/YYYY',
                workspaceName: '',
                businessEmail: '',
                emailAlerts: true,
                lowStockAlerts: true,
                digestTime: '06:00',
                sessionTimeout: 120,
                admin2fa: false,
            };
        }
    }
    return {
        currency: 'Ksh',
        dateformat: 'DD/MM/YYYY',
        workspaceName: '',
        businessEmail: '',
        emailAlerts: true,
        lowStockAlerts: true,
        digestTime: '06:00',
        sessionTimeout: 120,
        admin2fa: false,
    };
};
export const setSettings = (settings)=>{
    localStorage.setItem('poultryhub.settings', JSON.stringify(settings));
};
export const getCartItems = ()=>{
    const cartItems = localStorage.getItem('cartItems') ? JSON.parse(localStorage.getItem('cartItems')) : [];
    return cartItems;
};
export const setCartItems = (cartItems)=>{
    localStorage.setItem('cartItems', JSON.stringify(cartItems));
};
export const getShipping = ()=>{
    const shipping = localStorage.getItem('shipping') ? JSON.parse(localStorage.getItem('shipping')) : { address:'', city:'', postalCode:'', country:''};
    return shipping;
};
export const setShipping = ({address='', city='', postalCode='', country=''})=>{
    localStorage.setItem('shipping', JSON.stringify({address, city, postalCode, country}));
};
export const getPayment = ()=>{
    const payment = localStorage.getItem('payment') ? JSON.parse(localStorage.getItem('payment')) : { paymentMethod: 'paypal', };
    return payment;
};
export const setPayment = ({ paymentMethod = 'paypal' })=>{
    localStorage.setItem('payment', JSON.stringify({ paymentMethod }));
};
export const cleanCart = ()=>{
    localStorage.removeItem('cartItems');
};
//########################################################################################################################################################################
//########################################################################################################################################################################
//########################################################################################################################################################################