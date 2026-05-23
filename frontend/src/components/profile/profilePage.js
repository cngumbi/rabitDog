import { update } from "../../connection/api";
import { clearUser, getUserInfo, setUserInfo } from "../../localStorage";
import { hideLoading, showLoading, showMessage } from "../../utils";
import DashboardMenu from "./admin/dashboard/dashboardMenu";

const Profile = {
    vignette: ()=>{
          // Sign out button event listener
          const signoutButton = document.getElementById('signout-button');
          if (signoutButton) {
            signoutButton.onclick = async () => {
              await clearUser();
              document.location.hash = '/';
            };
          };
          // Update profile button event listener

          //document
          //  .getElementById('update-profile-button')
          //  .addEventListener('click', async (e) => {
          //    e.preventDefault();
          //    //e.stopPropagation();
          //    const currentPassword = document.getElementById('currentPassword').value;
          //    const newPassword = document.getElementById('password').value;
          //    const confirmPassword = document.getElementById('confirmPassword').value;
          //    if (newPassword !== confirmPassword) {
          //      showMessage('Password and confirm password are not match');
          //      return;
          //    }
          //    showLoading();
          //    const data = await update({
          //      email: document.getElementById('email').value,
          //      currentPassword,
          //      password: newPassword,
          //      
          //    });
          //    hideLoading();
          //    if (data.error) {
          //      showMessage(data.error);
          //    } else {
          //      setUserInfo(data);
          //      document.location.hash = '/';
          //    }
          //  });
          },
    render: ()=>{
        const { email } = getUserInfo();
        return `
        <div class="wrap">
          ${DashboardMenu.render({selected: 'profile'})}
          <div class="main" id="dashboard">
            <div class="content profile">
              <div class="profile-info">
                <div class="form-container">
                    <form id="profile-form">
                      <ul class="form-items" onsubmit="return false;">
                        <li>
                          <h1>User Profile</h1>
                        </li>
                        <li>
                          <label for="email">Email</label>
                          <input type="email" name="email" id="email" value="${email || ''}" />
                        </li>
                        <li>
                          <label for="currentPassword">Current Password</label>
                          <input type="password" name="currentPassword" id="currentPassword" placeholder="Current Password" />
                        </li>
                        <li>
                          <label for="password">Password</label>
                          <input type="password" name="password" id="password" placeholder="New Password" />
                        </li>
                        <li>
                          <label for="confirmPassword">Confirm Password</label>
                          <input type="password" name="confirmPassword" id="confirmPassword" placeholder="Confirm New Password" />
                        </li>
                        <li>
                          <button type="button" id="update-profile-button" class="primary">Update Profile</button>
                        </li>
                        <li>
                          <button type="button" id="signout-button" >Sign Out</button>
                        </li>    
                      </ul>
                    </form>
                  </div>
                </div>
            </div>
          </div>
        </div>  
          `;
    }
};
export default Profile;