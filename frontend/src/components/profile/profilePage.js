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
          const updateProfileButton = document.getElementById('update-profile-button');
          if (updateProfileButton) {
            updateProfileButton.addEventListener('click', async (e) => {
              e.preventDefault();
              console.log('Update profile button clicked');
              try{
                const email = document.getElementById('email').value.trim();
                const currentPassword = document.getElementById('currentPassword').value;
                const newPassword = document.getElementById('password').value;
                const confirmPassword = document.getElementById('confirmPassword').value;
                if (!email) {
                  showMessage('Email is required');
                  return;
                }
                // Validate current password is provided
                if (!currentPassword) {
                  showMessage('Current password is required to update profile');
                  return false;
                }
                if(!newPassword){
                  showMessage('New password is required to update profile');
                  return false;
                }
                // Validate passwords match
                if (newPassword !== confirmPassword) {
                  showMessage('Passwords do not match');
                  return false;
                }
                if (newPassword.length < 8) {
                  showMessage('New password must be at least 8 characters');
                  return false;
                }
                showLoading();
                // axios put request to update profile
                const data =  await update({
                  email,
                  currentPassword,
                  password: newPassword
                });
                console.log('Axios response:', data);
                hideLoading();
                if (data.error) {
                  showMessage(data.error);
                  return false;
                }
                setUserInfo(data);
                showMessage('Profile updated successfully');
                document.location.hash = '/';
              } catch (error) {
                console.error('Error updating profile:', error);
                hideLoading();
                showMessage(error.message || 'An error occurred while updating profile');
                return false;
              }
            });
          }
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
                  <!--IMORTANT-->
                  <!--NO FORM TAG-->
                    <div id="profile-form" class="profile-form">
                      <ul class="form-items">
                        <li>
                          <h1>User Profile</h1>
                        </li>
                        <!--Email -->
                        <li>
                          <label for="email">Email</label>
                          <input type="email" name="email" id="email" value="${email || ''}" />
                        </li>
                        <!--Current Password-->
                        <li>
                          <label for="currentPassword">Current Password</label>
                          <input type="password" name="currentPassword" id="currentPassword" placeholder="Current Password" />
                        </li>
                        <!--New Password-->
                        <li>
                          <label for="password">Password</label>
                          <input type="password" name="password" id="password" placeholder="New Password" />
                        </li>
                        <!-- Confirm password -->
                        <li>
                          <label for="confirmPassword">Confirm Password</label>
                          <input type="password" name="confirmPassword" id="confirmPassword" placeholder="Confirm New Password" />
                        </li>
                       </ul>
                      <!-- BUTTONS OUTSIDE UL -->
                      <div class="profile-buttons">
                        <button type="button" formnovalidate id="update-profile-button" class="primary">Update Profile</button>
                        <button type="button" id="signout-button" class="secondary">Sign Out</button>
                      </div>
                    </div>
                  </div>
                </div>
            </div>
          </div>
        </div>  
          `;
    }
};
export default Profile;