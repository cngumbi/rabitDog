export const parseRequestUrl = ()=> {
    const address = document.location.hash.slice(1).split('?')[0];
    const queryString = (document.location.hash.slice(1).split('?').length === 2) ? (document.location.hash.slice(1).split('?')[1]) : '';
    const url = address.toLowerCase() || '/';
    const r = url.split('/');
    const q = queryString.split('=');
    //const url = document.location.hash.toLowerCase();
    //const request = url.split("/");
    return {
        resource: r[1],
        id: r[2],
        verb: r[3],
        name: q[0],
        value: q[1],
    };
};
export const rerender = async (component) => {
    document.getElementById('atomic-content').innerHTML = await component.render();
    await component.after_render();
};