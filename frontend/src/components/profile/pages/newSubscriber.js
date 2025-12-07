import { createSubscriber } from "../../../connection/api";
import { hideLoading, showLoading, showMessage } from "../../../utils";
import DashboardMenu from "../admin/dashboard/dashboardMenu";

const NewSubscriber = {
    vignette: ()=>{
        document
            .getElementById('create-subcriber-form')
            .addEventListener('submit', async(e)=>{
                e.preventDefault();
                showLoading();
                const data = await createSubscriber({
                    telePhone: document.getElementById('telePhone').value,
                });
                hideLoading();
                if(data.error){
                    showMessage(data.error);
                }else{
                    //start creating the subscriber
                    document.location.hash = '/';
                }
            });
    },
    render: async()=>{
        return `
            <div class="wrap">
                ${DashboardMenu.render({selected: 'newsubscriber'})}
                <main class="main">
                    <header class="topbar">
                        <form action="POST" id="create-subscriber-form" class="search">
                            <!--Search box-->
                            <span> Telephone*</span>
                            <input type="text"  class="text-box" name="telePhone" id="telePhone" placeholder="Telephone....">
                            <input type="submit" class="button" value="Continue">
                        </form>
                    </header>
                    
                </main>
            </div>
        `;
    }
};

export default NewSubscriber;