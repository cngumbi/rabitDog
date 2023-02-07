export const rerender = async (component) => {
    document.getElementById('atomic-content').innerHTML = await component.render();
    await component.after_render();
};