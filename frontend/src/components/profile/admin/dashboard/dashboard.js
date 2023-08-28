import DashboardMenu from "./dashboardMenu";

const Dashboard = {
    vignette: ()=>{},
    render: ()=>{
        return `
        ${DashboardMenu.render({selected: 'dashboard'})}
        <section class="dashboard container" id="dashboard">
            <div class="">
                <h3> dashboard</h3>
            </div>
        </section>
        `;
    }
};
export default Dashboard;