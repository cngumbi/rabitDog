import { update } from "../../connection/api";
import { clearUser, getUserInfo, setUserInfo } from "../../localStorage";
import { hideLoading, showLoading, showMessage } from "../../utils";
import DashboardMenu from "../dashboard/dashboardMenu";

const Profile = {
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
                <h2>Amina Wanjohi</h2>
                <p>Operations Admin • PoultryHub</p>
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
                      <tr><td>Full name</td><td>Amina Wanjohi</td></tr>
                      <tr><td>Email</td><td>${email || ''}</td></tr>
                      <tr><td>Phone number</td><td>0712 223 334</td></tr>
                      <tr><td>Role</td><td>Administrator</td></tr>
                      <tr><td>Last login</td><td>June 2, 2026 at 09:24</td></tr>
                      <tr><td>Member since</td><td>March 2024</td></tr>
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
                  <label class="form-label" for="profileEmail">Email address</label>
                  <input class="form-control" id="profileEmail" type="email" value="" placeholder="e.g. your.email@example.com">
                </div>
                <div class="form-block">
                  <label class="form-label" for="profilePhone">Phone number</label>
                  <input class="form-control" id="profilePhone" type="tel" value="" placeholder="e.g. 0712 345 678">
                </div>
              </div>
              <div class="profile-actions">
                <button class="btn btn-primary" type="button">Save profile</button>
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
                <li class="activity-item"><strong>Profile updated</strong><span>Changed email address and contact number.</span></li>
                <li class="activity-item"><strong>Password reset</strong><span>Security update completed 2 days ago.</span></li>
                <li class="activity-item"><strong>Team settings modified</strong><span>Updated access levels for support staff.</span></li>
              </ul>
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