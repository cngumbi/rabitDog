import DashboardMenu from "../../../profile/admin/dashboard/dashboardMenu";
const Chicken = {
    vignette: ()=>{},
    render: ()=>{
        return`
            <div class="wrap">
                ${DashboardMenu.render({selected: 'chicken'})}
                <div class="main">
                    <div class="aside-nav">
                        <h5>Chicken management</h5>
                        <aside class="aside">
                            <div class="aside-item"><a href="">Chick care log</a><div> 
                        </aside>
                    </div>    
                </div>
            </div>
        `;
    }
};
export default Chicken;