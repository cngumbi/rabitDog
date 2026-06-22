//==========import styles===============
import './style/css/index.min.css';
import favicon from './assets/favicon.ico';
import ParseRequestUrl from "./config/parseUrl";
import Error404 from "./components/errors/error404";
import Header from './components/header';
//pages
import SignIn from './components/authentication/signIn';
import Registration from './components/authentication/registration';
import VerifyEmail from './components/authentication/verifyEmail';
import Forget from './components/authentication/forget';
import Dashboard from './components/dashboard/dashboard';
import Settings from './components/authentication/settings';
import Profile from './components/authentication/profile';
import RefreshFailed from './components/authentication/refreshFailed';
//pages
import ProductPage from './components/product/productPage';
import ListingProduct from './components/product/listingProduct';
import AddProduct from './components/product/addProdut';
import EditProduct from './components/product/editProduct';
//orders
import OrderPage from './components/order/order';
import OrderList from './components/order/listingOrder';
import PlaceOrder from './components/order/PlaceOrder';
import CartPage from './components/order/cartpage';
import ShippingPage from './shipping/Shipping';
import PaymentMethods from './components/payment/payment';
//Health records
import MedicalLogs from './components/mediacal/medicalLogs';
import ListMedicalLogs from './components/mediacal/listingMedical';
import EditHealthRecord from './components/mediacal/editHealthRecord';
import ManageBatches from './components/mediacal/manageBatches';
//parties
import Parties from './components/partner/parties';
import AddParties from './components/partner/addParties';
import Party from './components/partner/party';
//utils
import { getUserInfo } from './localStorage';
//Sales
import SalesList from './components/order/sales';
//purchases
import Purchases from './components/purchases/purchases';
import AddPurchases from './components/purchases/addPurchases';
//transfers
import StackTransfers from './components/transfers/transfers';
import NewTransfer from './components/transfers/createTransfer';
//expenses
import Expenses from './components/expenses/expenses';
import RecordExpenses from './components/expenses/recordExpenses';
//livestock management
import LivestockManagement from './components/livestock/LivestockManagement';
import LivestockTypes from './components/livestock/livestockTypes';
import AnimalRecords from './components/livestock/animalRecords';
import AnimalHealthRecords from './components/livestock/animalHealthRecords';
import FeedingRecords from './components/livestock/feedingRecords';
import ProductionRecords from './components/livestock/productionRecords';
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
    '/refresh-failed': RefreshFailed,
    '/settings': Settings,
    '/dashboard': Dashboard,
    '/profile': Profile,
    //products
    '/listproduct': ListingProduct,
    '/product/:id':ProductPage,
    '/createproduct': AddProduct,
    '/product/:id/edit': EditProduct,
    //orders
    '/orderlist': OrderList,
    '/saleslist': SalesList,
    '/placeorder': PlaceOrder,
    '/order/:id': OrderPage,
    '/cart': CartPage,
    '/cart/:id': CartPage,
    '/shipping': ShippingPage,
    '/payment': PaymentMethods,
    //medical records
    '/medicallogs': MedicalLogs,
    '/listingmedical': ListMedicalLogs,
    '/health/:id/edit': EditHealthRecord,
    '/manage-batches': ManageBatches,
    //parties
    '/parties': Parties,
    '/add-party': AddParties,
    '/party/:id': Party,
    //purchases
    '/purchases': Purchases,
    '/create-po': AddPurchases,
    //transfers
    '/transfers': StackTransfers,
    '/new-transfer': NewTransfer,
    //expenses
    '/expenses': Expenses,
    '/record-expense': RecordExpenses,
    //livestock
    '/livestock': LivestockManagement,
    '/livestock/types': LivestockTypes,
    '/livestock/animals': AnimalRecords,
    '/livestock/health': AnimalHealthRecords,
    '/livestock/feeding': FeedingRecords,
    '/livestock/production': ProductionRecords,
};
//==================ROUTER FUNCTION===========
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
    //Protected Pages
    const protectedPages = [
        '/settings',
        '/dashboard',
        '/profile',
        '/listproduct',
        '/product/:id',
        '/createproduct',
        '/product/:id/edit',
        '/orderlist',
        '/saleslist',
        '/placeorder',
        '/order/:id',
        '/cart',
        '/cart/:id',
        '/shipping',
        '/payment',
        '/medicallogs',
        '/listingmedical',
        '/health/:id/edit',
        '/manage-batches',
        '/parties',
        '/add-party',
        '/party/:id',
        '/purchases',
        '/create-po',
        '/transfers',
        '/new-transfer',
        '/expenses',
        '/record-expense',
        '/livestock',
        '/livestock/types',
        '/livestock/animals',
        '/livestock/health',
        '/livestock/feeding',
        '/livestock/production',
    ];
    //get the current hash path and route pattern for nested routes
    const hashPath = window.location.hash.slice(1).toLowerCase() || '/';
    const currentPath = request.resource ? `/${request.resource}` : '/';
    const lookupPath = request.resource ? `/${request.resource}${request.id ? '/:id' : ''}${request.verb ? `/${request.verb}` : ''}` : '/';
    const findRouteKey = (path) => {
        if (routes[path]) return path;
        const pathSegments = path.split('/').filter(Boolean);
        return Object.keys(routes).find((routeKey) => {
            const routeSegments = routeKey.split('/').filter(Boolean);
            if (routeSegments.length !== pathSegments.length) return false;
            return routeSegments.every((segment, index) =>
                segment.startsWith(':') || segment === pathSegments[index]
            );
        });
    };
    //find the matched route key for the current path, lookup path, or hash path
    const matchedRoute = findRouteKey(hashPath) || findRouteKey(lookupPath) || findRouteKey(currentPath) || currentPath;
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
    if(userInfo.email && !userInfo.verified && protectedPages.includes(matchedRoute)){
        document.location.hash = '/verify-email';
        return;
    }
    //block unauthenticated users from accessing protected pages
    if(!userInfo.email && protectedPages.includes(matchedRoute)){
        document.location.hash = '/';
        return;
    }
    // Build lookup path for nested routes, e.g. /product/:id/edit
    const sessions = routes[matchedRoute] || routes[currentPath];
    // If no route matches, use Error404
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