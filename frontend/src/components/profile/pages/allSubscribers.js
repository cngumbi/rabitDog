import DashboardMenu from "../admin/dashboard/dashboardMenu";
const AllSubscribers = {
    vignette: ()=>{},
    render: ()=>{
        return`
            <div class="wrap">
                ${DashboardMenu.render({selected: 'allsubscribers'})}
                <main class="main">
                    <h1> dashboard</h1>
                    
                </main>
            </div>
        `;
    }
};
export default AllSubscribers;