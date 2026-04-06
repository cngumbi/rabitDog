//this is the routing file with the routers 
//rouer.js
//==========import styles===============

import '../style/css/kwito.min.css';
import favicon from '../assets/favicon.ico';
import ParseRequestUrl from "./parseUrl";
//import ParseRequestUrl from "./config/parseUrl";
//error handling
import Error404 from "../components/errors/error404";
import Header from '../components/header';
import routes from './routes';



//setting the favicon of the site
const faviconImg = document.getElementById('favicon');
faviconImg.href = favicon;
/*
Router:
-matches URL
-decides what to render
-Handles nested routes
*/

const router = async () => {

    //Parse URL
    const request = ParseRequestUrl();

    //Build base path (/chicken, /products)
    const basePath = request.resource ? `/${request.resource}` : '/';

    const sessions = routes[basePath];

    let Page = null;
    let childSessions= null;

    //check if sessions has children (nested)
    if(sessions & sessions.component){
        //nested Sessions
        Page = sessions.component;
        childSessions = sessions.children;
    }else if(sessions) {
        //Normal Sessions
        Page = sessions;
    } else{
        Page = Error404;
    }

    //Render header 
    //=====================Render Header  =======================
    //the header of the site
    const header = document.getElementById('header-content');
    header.innerHTML = await Header.render();
    if (Header.vignette()) await Header.vignette();

    //===================Render Main Content=====================
    //the main content
    const main = document.getElementById('main-content');
    //if nested -> pass child sessions
    if (childSessions){
        //pass nested sessions + request into layout page
        main.innerHTML = await Page.render({
            childSessions,
            request
        });
    }else {
        main.innerHTML = await Page.render();
        if (Page.vignette()) await Page.vignette();
    }
};

export default router;