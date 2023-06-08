
//import styles
import './style/scss/kwito.scss';
//images
import favicon from './assets/favicon.ico';
import ParseRequestUrl from "./config/parseUrl";
import Error404 from "./components/errors/error404";
import Header from './components/header';
import Home from './components/pages/home';
import About from './components/pages/about';
import Services from './components/pages/services';
import Properties from './components/pages/properties';
import SignIn from './components/authentication/signIn';
import Registration from './components/authentication/registration';


//setting the favicon of the site
const faviconImg = document.getElementById('favicon');
faviconImg.href = favicon;

const routes = {
    '/': Home,
    '/home': Home,
    '/about': About,
    '/services': Services,
    '/properties': Properties,
    '/user-current': SignIn,
    '/new-user-create': Registration
};

const router = async () => {
    const request = ParseRequestUrl();
    const parseUrl = (request.resource ? `/${request.resource}`: '/') + (request.id ? '/:id' : '') + (request.verb ? `/${request.verb}` : '');
    const sessions = routes[parseUrl] ? routes[parseUrl] : Error404;
    //the header of the site
    const header = document.getElementById('header-content');
    header.innerHTML = await Header.render();
    await Header.vignette();
    const main = document.getElementById('main-content');
    main.innerHTML = await sessions.render();
    if(sessions.vignette()) await sessions.vignette();
}
window.addEventListener('load', router);
window.addEventListener('hashchange', router);


