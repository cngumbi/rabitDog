export const setUserInfo = ({
    _id = '',
    name = '',
    userName = '',
    phoneNumber = '',
    email = '',
    password = '',
    token = '',
    isAdmin = false
})=>{
    localStorage.setItem(
        'userInfo',
        JSON.stringify({
            _id,
            name,
            userName,
            phoneNumber,
            email,
            password,
            token,
            isAdmin
        })
    );
};
export const getUserInfo = ()=>{
    return localStorage.getItem('userInfo') ? JSON.parse(localStorage.getItem('userInfo')) : { name:'', userName:'', phoneNumber:'', email:'',password:'' };
};
export const clearUser = ()=>{
    localStorage.removeItem('userInfo');
}
//########################################################################################################################################################################
//########################################################################################################################################################################
//########################################################################################################################################################################