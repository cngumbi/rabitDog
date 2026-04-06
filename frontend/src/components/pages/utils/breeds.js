/*const Breeds = {
    vignette: ()=>{},
    render: ()=>{
        return`
            <div class="wrap">
                ${DashboardMenu.render({selected: 'chicken'})}
                <div class="main">
                    ${Aside.render({selected:'breeds'})}
                </div>
            </div>
        `;
    }
};
export default Breeds;*/


// breeds.js

const Breeds = {

    render: async () => {

        /*
            This is ONLY the content area.
            No layout, no sidebar, no tabs.
        */

        return `
            <div>
                <h2>Chicken Breeds</h2>
                <p>List of available chicken breeds will appear here.</p>
            </div>
        `;
    }
};
export default Breeds
