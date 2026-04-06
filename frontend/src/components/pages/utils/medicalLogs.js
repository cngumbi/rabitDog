/*import DashboardMenu from "../../profile/admin/dashboard/dashboardMenu"
import Aside from "../poultry/aside";
import { renderMap } from "../poultry/Chicken/chicken";

const MedicalLogs={
    vignette: ()=>{},
    render: ()=>{
        `   
        <div class="wrap">
            ${DashboardMenu.render({selected: 'chicken'})}
            <div class="main">
                ${Aside.render({selected: 'medicallogs'})}
            </div>
            <h1>test2</h1>
        </div>
        `
    },
};

export default MedicalLogs;*/

// medicalLogs.js

const MedicalLogs = {

    render: async () => {

        return `
            <div>
                <h2>Medical Logs</h2>
                <p>Track vaccinations and health records here.</p>
            </div>
        `;
    }
};

export default MedicalLogs;