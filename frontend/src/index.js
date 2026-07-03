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
import TrackTransfer from './components/transfers/trackTransfer';
//expenses
import Expenses from './components/expenses/expenses';
import RecordExpenses from './components/expenses/recordExpenses';
//livestock management
import LivestockManagement from './components/livestock/LivestockManagement';
import LivestockTypes from './components/livestock/livestockTypes';
import AddType from './components/livestock/addType';
import AddBatch from './components/livestock/addBatch';
import ViewBatch from './components/livestock/viewBatch';
import AnimalRecords from './components/livestock/animalRecords';
import AddAnimal from './components/livestock/addAnimal';
import ViewAnimal from './components/livestock/viewAnimal';
import AnimalHealthRecords from './components/livestock/animalHealthRecords';
import AddHealthRecord from './components/livestock/addHealthRecord';
import ViewHealth from './components/livestock/viewHealth';
import FeedingRecords from './components/livestock/feedingRecords';
import AddFeedingRecord from './components/livestock/addFeedingRecord';
import ViewFeeding from './components/livestock/viewFeeding';
import AddProductionRecord from './components/livestock/addProductionRecord';
import ProductionRecords from './components/livestock/productionRecords';
import ViewProduction from './components/livestock/viewProduction';
import CashBook from './components/accounting/Cashbook';
import AddAccount from './components/accounting/AddAccount';
import ChartOfAccounts from './components/accounting/ChartOfAccounts';
import EditAccount from './components/accounting/EditAccount';
import Budget from './components/accounting/Budget';
import BudgetNew from './components/accounting/BudgetNew';
import FinancialReports from './components/accounting/FinancialReports';
import Invoice from './components/accounting/Invoice';
import InvoiceCreate from './components/accounting/InvoiceCreate';
import InvoiceDetails from './components/accounting/InvoiceDetails';
import InvoiceEdit from './components/accounting/InvoiceEdit';
import JournalEntry from './components/accounting/JournalEntry';
import JournalEntryCreate from './components/accounting/JournalEntryCreate';
import JournalEntryDetails from './components/accounting/JournalEntryDetails';
//setting the favicon of the site
const faviconImg = document.getElementById('favicon');
if (faviconImg) {
  faviconImg.href = favicon;
}
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
    '/track-transfer/:id': TrackTransfer,
    //expenses
    '/expenses': Expenses,
    '/record-expense': RecordExpenses,
    //livestock
    '/livestock': LivestockManagement,
    '/livestock/types': LivestockTypes,
    '/livestock/types/add': AddType,
    '/livestock/animals': AnimalRecords,
    '/livestock/animals/add': AddAnimal,
    '/livestock/animal/:id': ViewAnimal,
    '/livestock/health': AnimalHealthRecords,
    '/livestock/health/add': AddHealthRecord,
    '/livestock/health/:id': ViewHealth,
    '/livestock/feeding': FeedingRecords,
    '/livestock/feeding/add': AddFeedingRecord,
    '/livestock/feeding/:id': ViewFeeding,
    '/livestock/production': ProductionRecords,
    '/livestock/production/add': AddProductionRecord,
    '/livestock/production/:id': ViewProduction,
    '/livestock/add': AddBatch,
    '/livestock/batch/:id': ViewBatch,
    //cash & bank
    '/cashbank': CashBook,
    '/accounts': ChartOfAccounts,
    '/account/add': AddAccount,
    '/account/:id/edit': EditAccount,
    '/budget': Budget,
    '/budget/new': BudgetNew,
    '/financial-reports': FinancialReports,
    '/financial-reports/:id': FinancialReports,
    '/invoices': Invoice,
    '/invoices/create': InvoiceCreate,
    '/invoices/:id': InvoiceDetails,
    '/invoices/:id/edit': InvoiceEdit,
    '/journal-entries': JournalEntry,
    '/journal-entries/create': JournalEntryCreate,
    '/journal-entries/:id': JournalEntryDetails,
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
        '/track-transfer/:id',
        '/expenses',
        '/record-expense',
        '/livestock',
        '/livestock/types',
        '/livestock/types/add',
        '/livestock/animals',
        '/livestock/animals/add',
        '/livestock/animal/:id',
        '/livestock/health',
        '/livestock/health/add',
        '/livestock/health/:id',
        '/livestock/feeding',
        '/livestock/feeding/add',
        '/livestock/feeding/:id',
        '/livestock/production',
        '/livestock/production/add',
        '/livestock/production/:id',
        '/livestock/add',
        '/livestock/batch/:id',
        '/cashbank',
        '/accounts',
        '/account/add',
        '/account/:id/edit',
        '/budget',
        '/budget/new',
        '/financial-reports',
        '/financial-reports/:id',
        '/invoices',
        '/invoices/create',
        '/invoices/:id',
        '/invoices/:id/edit',
        '/journal-entries',
        '/journal-entries/create',
        '/journal-entries/:id',
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
    if (Page.vignette) await Page.vignette(request);
   }
};
window.addEventListener('load', router);
window.addEventListener('hashchange', router);