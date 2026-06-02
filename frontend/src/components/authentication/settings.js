import { update } from "../../connection/api";
import { clearUser, getUserInfo, setUserInfo } from "../../localStorage";
import { hideLoading, showLoading, showMessage } from "../../utils";
import DashboardMenu from "../profile/admin/dashboard/dashboardMenu";

const Settings = {
    vignette: ()=>{
      // Prevent form submission and handle profile update
      const profileForm = document.getElementById('profile-form');
      if (profileForm) {
        profileForm.addEventListener('submit', async (e) => {
          e.preventDefault();
          e.preventDefault();
          e.stopPropagation();
          e.stopImmediatePropagation();
          if(typeof e.cancelBubble !== "undefined"){
            e.cancelBubble = true;
          }
        });
      }
      setTimeout(()=>{
        document.getElementById('update-profile-button').addEventListener('click', async(e)=>{
          showLoading();
          try{
            const email = document.getElementById('email').value.trim();
            const currentPassword = document.getElementById('currentPassword').value;
            const newPassword = document.getElementById('password').value;
            const confirmPassword = document.getElementById('confirmPassword').value;
            if (!email) {
              showMessage('Email is required');
              return;
            }
            if (!currentPassword) {
              showMessage('Current password is required to update profile');
              return false;
            }
            if(!newPassword){
              showMessage('New password is required to update profile');
              return false;
            }
            if (newPassword !== confirmPassword) {
              showMessage('Passwords do not match');
              return false;
            }
            const data = await update({
              email,
              currentPassword,
              password: newPassword
            });
            hideLoading();
            console.log('API RESPONSE:', data);
            if (data.error) {
              showMessage(data.error);
              return false;
            }else{
              setUserInfo(data);
              showMessage('Profile updated successfully');
              document.location.hash = '/';
            }
          }catch(error){
            hideLoading();
            showMessage(error.message || 'An error occurred  while updating profile');
          }
        });
      }, 0);
    },
    render: ()=>{
      const { email } = getUserInfo();
      return `
      <div class="wrap">
        ${DashboardMenu.render({selected: ''})}
        <div class="main" id="dashboard">
          <div class="content profile">
            <div class="profile-info">
              <div class="form-container">
                <!--IMORTANT-->
                <!--NO FORM TAG-->
                  <div id="profile-form" role="form">
                    <ul class="form-items">
                      <li>
                        <h1>User Profile</h1>
                      </li>
                      <!--Email -->
                      <li>
                        <label for="email">Email</label>
                        <input type="email" id="email" value="${email || ''}" />
                      </li>
                      <!--Current Password-->
                      <li>
                        <label for="currentPassword">Current Password</label>
                        <input type="password" id="currentPassword" placeholder="Current Password" />
                      </li>
                      <!--New Password-->
                      <li>
                        <label for="password">Password</label>
                        <input type="password" id="password" placeholder="New Password" />
                      </li>
                      <!-- Confirm password -->
                      <li>
                        <label for="confirmPassword">Confirm Password</label>
                        <input type="password" id="confirmPassword" placeholder="Confirm New Password" />
                      </li>
                     </ul>
                    <!-- BUTTONS OUTSIDE UL -->
                    <button type="button" formnovalidate id="update-profile-button" class="primary">Update Profile</button>
                  </div>
                </div>
              </div>
          </div>
        </div>
      </div>  
        `;
    }
};
export default Settings;