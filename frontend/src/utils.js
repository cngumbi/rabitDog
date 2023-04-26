import { getUserInfo } from "./localStorage";

export const rerender = async (component) => {
    document.getElementById('atomic-content').innerHTML = await component.render();
    await component.after_render();
};
//------------------------------------------
//redirect function
//------------------------------------------
export const redirectUser = () => {
    if (!getUserInfo().name) {
      window.location.assign('/');
    } else {
      window.location.assign('/#/dashboard');
    }
};