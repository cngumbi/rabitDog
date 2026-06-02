import DashboardMenu from "./dashboard/dashboardMenu";


const Profile = {
    vignette: ()=>{},
    render: ()=>{
        return `
        <div id="sidebarOverlay" class="sidebar-overlay"></div>
        <div class="wrap"> 
            ${DashboardMenu.render({selected: ''})}
            <div class="main" id="dashboard">
                <h1>profile</h1>
                
            </div>
        </div>
        `;
    }
};
export default Profile;