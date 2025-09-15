import DashboardMenu from "./dashboardMenu";

const Dashboard = {
    vignette: ()=>{},
    render: ()=>{
        return `
        <div class="wrap">
            ${DashboardMenu.render({selected: 'dashboard'})}
            <main class="main" id="dashboard">
                <h1> dashboard</h1>
                
            </main>
        </div>
        `;
    }
};
export default Dashboard;