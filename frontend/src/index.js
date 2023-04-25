import Aside from "./components/aside";
import Error404 from "./components/errors/error404";
import ParseRequestUrl from "./config/parseUrl";
import About from "./pages/about";
import Contact from "./pages/contact";
import Home from "./pages/home";
import Project from "./pages/project";
import Service from "./pages/service";
import Staff from "./pages/staff";

const routes = {
  '/': Home,
  '/home': Home,
  '/about': About,
  '/contact': Contact,
  '/project': Project,
  '/service': Service,
  '/staff': Staff,
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
