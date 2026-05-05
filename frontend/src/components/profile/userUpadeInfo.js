import { update } from "../../connection/api";
import { clearUser, getUserInfo, setUserInfo } from "../../localStorage";
import { hideLoading, showLoading, showMessage } from "../../utils";
import DashboardMenu from "./admin/dashboard/dashboardMenu";

const UserInfo = {
    vignette: ()=>{
        document.getElementById('signout-button').addEventListener('click', () => {
            clearUser();
            document.location.hash = '/';
          });
          document
            .getElementById('user-info')
            .addEventListener('submit', async (e) => {
              e.preventDefault();
              showLoading();
              const data = await update({
                //name: document.getElementById('name').value,
                //userName: document.getElementById('userName').value,
                //phoneNumber: document.getElementById('phoneNumber').value,
                email: document.getElementById('email').value,
                password: document.getElementById('password').value,
              });
              hideLoading();
              if (data.error) {
                showMessage(data.error);
              } else {
                setUserInfo(data);
                //document.location.hash = '/';
              }
            });
          },
    render: async()=>{
        const { email } = getUserInfo();
        /*if(!email){
            document.location.hash = '/';
        }*/
        return `
          <form id="user-info">
            <ul class="form-items">
              <li>
                <h1>User Info</h1>
              </li>
              <li>
                <label for="email">Email</label>
                <input type="email" name="email" id="email" value="${ email || '' }" />
              </li>
              <li>
                <label for="password">Password</label>
                <input type="password" name="password" id="password" />
              </li>
              <li>
                <button type="submit" class="primary">Update</button>
              </li>
              <li>
                <button type="button" id="signout-button" >Sign Out</button>
              </li>        
            </ul>
          </form> 
          `;
    }
};
export default UserInfo;