import Dashboard from "./admin/Dashboard";
import LoginSection from "./admin/login";
import newServiceSection from "./admin/newServices";
import RegistarSection from "./admin/registar";
import Aside from "./components/aside";
import Error404 from "./components/errors/error404";
import ParseRequestUrl from "./config/parseUrl";
import About from "./pages/about";
import Contact from "./pages/contact";
import Home from "./pages/home";
import Product from "./pages/product";
import Service from "./pages/service";
import Staff from "./pages/staff";

const routes = {
  '/': Home,
  '/home': Home,
  '/about': About,
  '/dashboard': Dashboard,
  '/contact': Contact,
  '/product': Product,
  '/service': Service,
  '/login': LoginSection,
  '/adduser': RegistarSection,
  '/staff': Staff,
  '/newService': newServiceSection
};

const router = async () => {
  const request = ParseRequestUrl();
  const parseUrl =
    (request.resource ? `/${request.resource}` : '/') +
    (request.id ? '/:id' : '') +
    (request.verb ? `/${request.verb}` : '');
  const section = routes[parseUrl] ? routes[parseUrl] : Error404;

  const aside = document.getElementById("aside-content");
  aside.innerHTML = await Aside.render();
  await Aside.after_render();
  const main = document.getElementById("atomic-content");
  main.innerHTML = await section.render();
  if(section.after_render()) {
    await section.after_render();
  }
};
window.addEventListener("load", router);
window.addEventListener("hashchange", router);
