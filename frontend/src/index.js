//the main js file index.js
//import router engine
//==========import styles===============
import './style/css/kwito.min.css';
import favicon from './assets/favicon.ico';
import ParseRequestUrl from "./config/parseUrl";
import Error404 from "./components/errors/error404";
import Header from './components/header';
//pages
import SignIn from './components/authentication/signIn';
import Registration from './components/authentication/registration';
import VerifyEmail from './components/authentication/verifyEmail';
import Profile from './components/profile/profilePage';
import Forget from './components/authentication/forget';
import Dashboard from './components/profile/admin/dashboard/dashboard';
//Chicken (Nested Layout)
import Chicken from './components/pages/poultry/Chicken/chicken';
import MedicalLogs from './components/pages/utils/medicalLogs';
import Breeds from './components/pages/utils/breeds';
//utils
import { getUserInfo } from './localStorage';
//import { session } from 'passport';
//import CartPage from './components/order/cartpage';
//import ProductPage from './components/product/productPage';
//import ListingProduct from './components/product/listingProduct';
//import EditProduct from './components/product/editProduct';
//import AddProduct from './components/product/addProdut';
//import ShippingPage from './shipping/Shipping';
//import PaymentMethods from './components/payment/payment';
//import PlaceOrder from './components/order/PlaceOrder';
//import OrderPage from './components/order/order';
//import OrderList from './components/order/listingOrder';
//import NewSubscriber from './components/profile/pages/newSubscriber';
//import NewSubscriber from './components/profile/pages/newSubscriber';
//setting the favicon of the site
const faviconImg = document.getElementById('favicon');
faviconImg.href = favicon;

//==================ROUTE CONFIG ============
/*
    we define routes in two formats

    1.simple route:
        '/dashboard': Dashboard
    2. nested route:
        '/chicken': {
            component: Chichen,
            children: {
                'breeds': Breeds,
                'medicallogs': MedicalLogs
            }
        }
*/

const routes = {
    '/': SignIn,
    '/user-current': SignIn,
    '/new-user-create': Registration,
    '/verify-email': VerifyEmail,
    '/forget': Forget,
    '/profile': Profile,
    '/dashboard': Dashboard,
    //'/checken': Chicken,
    //'/chicken': { 
    //    component: Chicken,
    //    children: {
    //        'breeds': Breeds,
    //        'medicallogs': MedicalLogs,
    //    }
    //},
   /* '/newsubscriber': NewSubscriber,
    '/properties/:id':ProductPage,
    '/product/:id/edit': EditProduct,
    '/listproduct': ListingProduct,
    '/createproduct': AddProduct,
    '/cart': CartPage,
    '/cart/:id': CartPage,
    '/order/:id':OrderPage,
    '/shipping': ShippingPage,
    '/payment': PaymentMethods,
    '/placeorder': PlaceOrder,
    '/orderlist': OrderList,
    '/chicken/medicallogs': MedicalLogs,
    '/chicken/breeds': Breeds, */
};


const router = async () => {

    //Parse URL -> { resourece: 'chicken', verb: 'breeds', id: null}
    const request = ParseRequestUrl();
    //get user info from local storage
    const userInfo = getUserInfo();
    //check if the user is trying to access an auth page while being logged in or trying to access a protected page while being logged out
    //Auth Pages
    const authPages = [
        '/',
        '/new-user-create',
        '/forget',
        '/user-current',
    ];
    //Public Pages
    //const publicPages = [
    //    '/forget',
    //    '/verify-email',
    //];
    //Protected Pages
    const protectedPages = [
        '/profile',
        '/dashboard',
    ];
    //get the current path
    const currentPath = request.resource ? `/${request.resource}` : '/';
    //redirect to dashboard if the user is trying to access an auth page while being logged in 
    if(userInfo.email && userInfo.verified && authPages.includes(currentPath)){
        document.location.hash = '/dashboard';
        return;
    }
    //redirect unverified users to verify page
    if(userInfo.email && !userInfo.verified && authPages.includes(currentPath)){
        document.location.hash = '/verify-email';
        return;
    }
    //block unauthenticated users from accessing Verify page
    if(!userInfo.email && currentPath === '/verify-email'){
        document.location.hash = '/';
        return;
    }
    //prevent verified users from accessing verify page
    if(userInfo.email && userInfo.verified && currentPath === '/verify-email'){
        document.location.hash = '/dashboard';
        return;
    }
    //block unverified users from accessing protected pages
    if(userInfo.email && !userInfo.verified && protectedPages.includes(currentPath)){
        document.location.hash = '/verify-email';
        return;
    }
    //block unauthenticated users from accessing protected pages
    if(!userInfo.email && protectedPages.includes(currentPath)){
        document.location.hash = '/';
        return;
    }
    //allow access to public pages without authentication
    //if(publicPages.includes(currentPath)){
    //    //do nothing and allow access
    //}
    //Build base path -> '/chicken'
    /*'old style' -> const parseUrl = (request.resource ? `/${request.resource}`: '/') + (request.id ? '/:id' : '') + (request.verb ? `/${request.verb}` : '');
            const sessions = routes[parseUrl] ? routes[parseUrl] : Error404;
    */
    //new style -> for nested routes
    const basePath = request.resource ? `/${request.resource}` : '/';
    const sessions = routes[basePath];

    

    let Page = null;
    let childSessions = null;

    //=====================Sessions Matching====================
    if(sessions && sessions.component){
        //nested Sessions
        Page = sessions.component;
        childSessions = sessions.children;
    } else if (sessions){
        //Normal sessions
        Page = sessions //|| Error404;
    }else{
        Page = Error404;
    }
    //=====================Render Header  =======================
    //the header of the site
    const header = document.getElementById('header-content');
    header.innerHTML = await Header.render();
    if (Header.vignette) await Header.vignette();

    //===================Render Main Content=====================
    //the main content
    /* old style
    const main = document.getElementById('main-content');
    main.innerHTML = await sessions.render();
    if(sessions.vignette()) await sessions.vignette();
    */
   const main = document.getElementById('main-content');
   if(childSessions){
    //pass nested sessions + request into layout page
    main.innerHTML = await Page.render({
        childSessions,
        request
    });
   }else{
    main.innerHTML = await Page.render();
    if (Page.vignette) await Page.vignette();
   }



};
window.addEventListener('load', router);
window.addEventListener('hashchange', router);