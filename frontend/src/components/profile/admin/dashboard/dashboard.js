import DashboardMenu from "./dashboardMenu";

const Dashboard = {
    vignette: ()=>{},
    render: ()=>{
        return `
        <div class="wrap">
            ${DashboardMenu.render({selected: 'dashboard'})}
            <div class="main" id="dashboard">
                <h1> dashboard</h1>
                
            </div>
        </div>
        `;
    }
};
export default Dashboard;