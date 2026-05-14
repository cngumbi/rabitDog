//the main js file index.js
//import router engine

/*import router from "./config/router";
import routes from "./config/routes";






const init = ()=>{
    router(routes);
};

/*
Listen for:
-Page load
-URL hash changes (#/something new)

*
window.addEventListener('load', init);
window.addEventListener('hashchange', ()=>router(routes))
*/


//==========import styles===============
import './style/css/kwito.min.css';
import favicon from './assets/favicon.ico';
import ParseRequestUrl from "./config/parseUrl";
import Error404 from "./components/errors/error404";
import Header from './components/header';

//pages
import SignIn from './components/authentication/signIn';
import Registration from './components/authentication/registration';
import Profile from './components/profile/profilePage';
import Forget from './components/authentication/forget';
import Dashboard from './components/profile/admin/dashboard/dashboard';

//Chicken (Nested Layout)
import Chicken from './components/pages/poultry/Chicken/chicken';
import MedicalLogs from './components/pages/utils/medicalLogs';
import Breeds from './components/pages/utils/breeds';
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



}
window.addEventListener('load', router);
window.addEventListener('hashchange', router);







