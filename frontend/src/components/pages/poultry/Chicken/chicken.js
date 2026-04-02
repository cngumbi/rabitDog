import DashboardMenu from "../../../profile/admin/dashboard/dashboardMenu";
const Chicken = {
    vignette: ()=>{},
    render: ()=>{
        return`
            <div class="wrap">
                ${DashboardMenu.render({selected: 'chicken'})}
                <main class="main">
                    <h5>Chicken management</h5>
                    <aside>
                        <ul>
                            <li><a href="">Chick Care Log</a><li>
                        </ul>
                    </aside>
                    
                </main>
            </div>
        `;
    }
};
export default Chicken;