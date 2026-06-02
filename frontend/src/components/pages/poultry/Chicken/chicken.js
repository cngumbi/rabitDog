import DashboardMenu from "../../../dashboard/dashboardMenu";
import Aside from "../aside";

/*
    Chicken acts as a LAYOUT page.

    It:
    * Keeps sidebar (DashboardManu)
    *Shows tabs (Breeds / Medical Logs)
    *Dynamically loads child content

*/
const Chicken = {
    vignette: ()=>{},
    render: async({ childSessions, request })=>{
        //===================== DETERMINE ACTIVE TAB ===========
        //IF no sub-route -> default to 'breeds'
        //Active tab or default
        const currentTab = request.verb || Object.keys(childSessions)[0];

        //=====Active Component==============
        //Get corresponding componet
        const ActiveComponent = childSessions[currentTab];

        //Load child Page
        let content = '';
        //const content = ActiveComponent ? await ActiveComponent.render(request): `<div> Not Found </div>`;

        if (ActiveComponent && ActiveComponent.render){
            content = await ActiveComponent.render(request);
        } else{
            content = `<div> Page not Found </div>`;
        }
        //==========Generate Tabs Dynamically =============
        /*const tabs = Object.keys(childSessions).map(route =>{
            return`
                <a href="/#/chicken/${route}"
                   class="tab ${currentTab === route ? 'active' : ''}">
                   ${formatLabel(route)}
                </a>
            `
        }).join('');*/
        return`
            <div class="wrap">
                <!--Left Sidebar -->
                ${DashboardMenu.render({selected: 'chicken'})}

                <!--Main content area -->
                <div class="main">
                    
                    <!-- Top Tabs -->
                    ${Aside.render({
                        basePath: 'chicken',
                        routes: childSessions,
                        current: currentTab
                    })}
                    <!--<hr/>-->
                    <!--Dynamci Content-->
                    <div class="content">
                        ${content}
                    </div>
                </div>
            </div>
        `;
    }
};
export default Chicken;
