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
};
/*set product info
export const setProductInfo = ({
    _id = '',
    name = '',
    price = '',
    image = '',
    brand = '',
    category = '',
    countInStock = '',
    description = ''
  }) => {
    localStorage.setItem(
      'userInfo',
      JSON.stringify({
        _id,
        name,
        price,
        image,
        brand,
        category,
        countInStock,
        description
      })
    );
  };
  export const getProductInfo = () => {
    return localStorage.getItem('userInfo')
      ? JSON.parse(localStorage.getItem('userInfo'))
      : { name: '', price: '', image: '', brand: '', category: '', countInStock: '', description: '' };
  };
  */
export const getCartItems = ()=>{
    const cartItems = localStorage.getItem('cartItems') ? JSON.parse(localStorage.getItem('cartItems')) : [];
    return cartItems;
};
export const setCartItems = (cartItems)=>{
    localStorage.setItem('cartItems', JSON.stringify(cratItems));
};
export const getShipping = ()=>{
    const shipping = localStorage.getItem('shipping') ? JSON.parse(localStorage.getItem('shipping')) : { address:'', city:'', postalCode:'', country:''};
    return shipping;
};
export const setShipping = ({address='', city='', postalCode='', country=''})=>{
    localStorage.setItem('shiipping', JSON.stringify({address, city, postalCode, country}));
};
export const getPayment = ()=>{
    const payment = localStorage.getItem('payment') ? JSON.parse(localStorage.get('payment')) : { paymentMethod: 'paypal', };
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