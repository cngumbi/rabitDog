import { getProfileSummary, update } from "../../connection/api";
import { clearUser, getUserInfo, setUserInfo } from "../../localStorage";
import { hideLoading, showLoading, showMessage } from "../../utils";
import DashboardMenu from "../dashboard/dashboardMenu";

const Profile = {
    vignette: async ()=>{
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
        document.getElementById('save-profile-button').addEventListener('click', async(e)=>{
          try{
            showLoading();
            const profileData = {
              name: document.getElementById('profileName').value,
              userName: document.getElementById('userName').value,
              phoneNumber: document.getElementById('profilePhone').value,
              nationalID: document.getElementById('profileNationalID').value,
              bio: document.getElementById('Bio').value,
            };
            const response = await updateProfile(profileData);
            hideLoading();
            if(response.error){
              return showMessage(response.error);
            }
            showMessage('Profile updated successfully');
            document.location.reload();
          }catch(error){
            hideLoading();
            showMessage(error.message || 'An error occurred while updating profile');
          }
        });
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
    render: async ()=>{
      const { email, lastLogin, memberSince } = getUserInfo();
      const profilesummary = await getProfileSummary();
      const { profile, account } = profilesummary;
      const lastLoginFormatted = account.lastLogin ? new Date(account.lastLogin).toLocaleDateString() : "Never";
      const memberSinceFormatted = account.memberSince ? new Date(account.memberSince).toLocaleDateString() : "-";
      const activityLog = account.activityLog || [];
      return `
      <div class="wrap">
        ${DashboardMenu.render({selected: ''})}
        <div class="main" id="dashboard">
        <!--profile header-->
          <div class="page-header">
            <div><h1 class="font-xl">Admin Profile</h1><p class="text-muted">Review and update your account details, security preferences, and activity summary.</p></div>
            <div class="profile-actions">
              <a class="btn btn-outline-primary" href="/#/settings">Workspace settings</a>
              <a class="btn btn-outline-secondary" href="/#/dashboard">Return to dashboard</a>
            </div>
          </div>
          <!--end of profile header-->
          <!--profile top content and cards-->
          <div class="profile-top">
            <div class="profile-user">
              <div class=" bg-primary text-white avatar">AW</div>
              <div class="profile-user-info">
                <h2>${profile?.name || 'No Name'}</h2>
                <p>${profilesummary.isAdmin ? 'Administrator' : 'User'}</p>
                <div class="profile-badges">
                  <span class="badge-pill">Administrator</span>
                  <span class="badge-pill">2FA enabled</span>
                </div>
              </div>
            </div>
            <div class="profile-stats">
              <div class="stat-card"><strong>24</strong><span>Active teams</span></div>
              <div class="stat-card"><strong>8</strong><span>Recent logins</span></div>
              <div class="stat-card"><strong>3</strong><span>Pending approvals</span></div>
            </div>
          </div>
          <!--end of profile top content and cards-->
          <div class="profile-grid">
            <!--profile details-->
            <div class="panel">
              <div class="card-title">Account overview</div>
              <p class="text-muted">Your account details and contact information are shown below. Update any item to keep your profile current.</p>
              <div class="profile-details">
                <div class="table-responsive">
                  <table class="profile-table">
                    <tbody>
                      <tr><td>Full name</td><td>${profile?.name || 'No Name Set'}</td></tr>
                      <tr><td>Email</td><td>${email || ''}</td></tr>
                      <tr><td>Phone number</td><td>${profile?.phoneNumber || 'No Set' }</td></tr>
                      <tr><td>Role</td><td>${profilesummary.isAdmin ? 'Administrator' : 'User'}</td></tr>
                      <tr><td>Last login</td><td>${lastLoginFormatted}</td></tr>
                      <tr><td>Member since</td><td>${memberSinceFormatted}</td></tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
            <!--end of profile details-->
            <!--profile edit form-->
            <div class="panel">
              <div class="card-title">Profile information</div>
              <p class="text-muted">Update your name, email, and phone number for your account.</p>
              <div class="field-grid">
                <div class="form-block">
                  <label class="form-label" for="profileName">Full name</label>
                  <input class="form-control" id="profileName" type="text" value="" placeholder="e.g. Amina Wanjohi">
                </div>
                <div class="form-block">
                  <label class="form-label" for="profileUserName">Email address</label>
                  <input class="form-control" id="profileUserName" type="text" value="" placeholder="user name">
                </div>
                <div class="form-block">
                  <label class="form-label" for="profilePhone">Phone number</label>
                  <input class="form-control" id="profilePhone" type="text" value="" placeholder="e.g. 0712 345 678">
                </div>
                <div class="form-block">
                  <label class="form-label" for="profileNationalID">National ID</label>
                  <input class="form-control" id="profileNationalID" type="number" value="" placeholder="e.g. 12345678">
                </div>
                <div class="form-block">
                  <label class="form-label" for="bio">Bio</label>
                  <textarea class="form-control" id="bio" placeholder="Tell us about yourself..."></textarea>
                </div>
              </div>
              <div class="profile-actions">
                <button id="save-profile-button" class="btn btn-primary" type="button">Save profile</button>
                <button class="btn btn-outline" type="button">Reset form</button>
              </div>
            </div>  
            <!--end of profile edit form-->
            <!--profile password change form-->
            <div class="panel">
              <div class="card-title">Change password</div>
              <p class="text-muted">Set a new password to keep your account secure.</p>
              <div id="profile-form" class="field-grid">
                <!--Email-->
                <div class="form-block">
                  <label class="form-label" for="email">Email</label>
                  <input class="form-control" type="email" id="email" value="${email || ''}" />
                </div>
                <!--Current Password-->
                <div class="form-block">
                  <label class="form-label" for="currentPassword">Current Password</label>
                  <input class="form-control" type="password" id="currentPassword" placeholder="Current Password" />
                </div>
                <!--New Password-->
                <div class="form-block">
                  <label class="form-label" for="password">Password</label>
                  <input class="form-control" type="password" id="password" placeholder="New Password" />
                </div>
                <!-- Confirm password -->
                <div class="form-block">
                  <label class="form-label" for="confirmPassword">Confirm new password</label>
                  <input class="form-control" type="password" id="confirmPassword" placeholder="Confirm new password" />
                </div>
              </div>
              <!-- BUTTONS OUTSIDE UL -->
              <div class="profile-actions">
                  <button type="button" formnovalidate id="update-profile-button" class="btn btn-primary">Update Profile</button>
              </div>
            </div>
            <!--end of profile password change form-->
            <!--profile activity feed-->
            <div class="panel">
              <div class="card-title">Recent activity</div>
              <ul class="activity-list">
                ${
                  activityLog.length ? activityLog
                  .map(
                    (activity) => `
                    <li class="activity-item">
                      <strong>${activity.action}</strong>
                      <span>
                        ${activity.description}
                        <br>
                        <small>
                          ${new Date(activity.createdAt).toLocaleString()}
                        </small>
                      </span>
                    </li>
                    `
                  )
                  .join('') : `
                  <li class="activity-item">
                    <span>No recent activity</span>
                  </li>
                  `
                }
                <li class="activity-item">
                  <strong>Profile updated</strong>
                  <span>Changed email address and contact number.</span>
                </li>
                
            </div>
            <!--end of profile activity feed-->
          </div>
          <!--end of profile grid-->
        </div>
      </div>  
        `;
    }
};
export default Profile;