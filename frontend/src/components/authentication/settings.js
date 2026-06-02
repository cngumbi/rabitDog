import DashboardMenu from "../dashboard/dashboardMenu";


const Settings = {
    vignette: ()=>{},
    render: ()=>{
        return `
        <div id="sidebarOverlay" class="sidebar-overlay"></div>
        <div class="wrap"> 
            ${DashboardMenu.render({selected: ''})}
            <div class="main" id="dashboard">
                <h1>Settings</h1>
                
            </div>
        </div>
        `;
    }
};
export default Settings;