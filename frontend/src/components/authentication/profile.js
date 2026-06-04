import { getProfileSummary, getActivityLog, update, updateProfile } from "../../connection/api";
import { getUserInfo, setUserInfo } from "../../localStorage";
import { hideLoading, showLoading, showMessage } from "../../utils";
import DashboardMenu from "../dashboard/dashboardMenu";

const Profile = {
    vignette: async ()=>{
      const saveButton = document.getElementById('save-profile-button');
      const resetButton = document.getElementById('reset-profile-button');
      const updateButton = document.getElementById('update-profile-button');

      const fillProfileForm = (profile = {}) => {
        document.getElementById('profileName').value = profile.name || '';
        document.getElementById('profileUserName').value = profile.userName || '';
        document.getElementById('profilePhone').value = profile.phoneNumber || '';
        document.getElementById('profileNationalID').value = profile.nationalID || '';
        document.getElementById('bio').value = profile.bio || '';
      };

      if (saveButton) {
        saveButton.addEventListener('click', async ()=>{
          try{
            showLoading();
            const profileData = {
              name: document.getElementById('profileName').value,
              userName: document.getElementById('profileUserName').value,
              phoneNumber: document.getElementById('profilePhone').value,
              nationalID: document.getElementById('profileNationalID').value,
              bio: document.getElementById('bio').value,
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
      }

      if (resetButton) {
        resetButton.addEventListener('click', async ()=>{
          try{
            showLoading();
            const response = await getProfileSummary();
            hideLoading();
            if (response.error) {
              return showMessage(response.error);
            }
            fillProfileForm(response.profile || {});
            showMessage('Profile form restored to saved values.');
          }catch(error){
            hideLoading();
            showMessage(error.message || 'Unable to reset profile form');
          }
        });
      }

      const previousPage = document.getElementById('previous-page');
      const nextPage = document.getElementById('next-page');
      if (previousPage) {
        previousPage.addEventListener('click', () => {
          const currentPage = Number(previousPage.dataset.page) || 1;
          if (currentPage > 1) {
            const baseHash = window.location.hash.split('?')[0];
            document.location.hash = `${baseHash}?page=${currentPage - 1}`;
          }
        });
      }
      if (nextPage) {
        nextPage.addEventListener('click', () => {
          const currentPage = Number(nextPage.dataset.page) || 1;
          const baseHash = window.location.hash.split('?')[0];
          document.location.hash = `${baseHash}?page=${currentPage + 1}`;
        });
      }

      if (updateButton) {
        updateButton.addEventListener('click', async()=>{
          showLoading();
          try{
            const email = document.getElementById('email').value.trim();
            const currentPassword = document.getElementById('currentPassword').value;
            const newPassword = document.getElementById('password').value;
            const confirmPassword = document.getElementById('confirmPassword').value;
            if (!email) {
              hideLoading();
              showMessage('Email is required');
              return;
            }
            if (!currentPassword) {
              hideLoading();
              showMessage('Current password is required to update profile');
              return;
            }
            if(!newPassword){
              hideLoading();
              showMessage('New password is required to update profile');
              return;
            }
            if (newPassword !== confirmPassword) {
              hideLoading();
              showMessage('Passwords do not match');
              return;
            }
            const data = await update({
              email,
              currentPassword,
              password: newPassword
            });
            hideLoading();
            if (data.error) {
              showMessage(data.error);
              return;
            }
            setUserInfo(data);
            showMessage('Profile updated successfully');
            document.location.hash = '/';
          }catch(error){
            hideLoading();
            showMessage(error.message || 'An error occurred while updating profile');
          }
        });
      }
    },
    render: async ()=>{
      const { email: currentEmail } = getUserInfo();
      const profilesummary = await getProfileSummary();
      if (profilesummary.error) {
        return `
        <div class="wrap">
          ${DashboardMenu.render({selected: ''})}
          <div class="main" id="dashboard">
            <div class="page-header">
              <div><h1 class="font-xl">Profile</h1><p class="text-muted">Unable to load profile information: ${profilesummary.error}</p></div>
            </div>
          </div>
        </div>`;
      }

      const profile = profilesummary.profile || {};
      const email = profilesummary.email || currentEmail || '';
      const lastLoginFormatted = profilesummary.lastLogin ? new Date(profilesummary.lastLogin).toLocaleDateString() : "Never";
      const memberSinceFormatted = profilesummary.memberSince ? new Date(profilesummary.memberSince).toLocaleDateString() : "-";
      const isAdmin = profilesummary.isAdmin || false;
      const verified = profilesummary.verified ? 'Verified' : 'Unverified';
      const profileCompleted = profilesummary.profileCompleted ? 'Complete' : 'Incomplete';
      const currentHashQuery = window.location.hash.split('?')[1] || '';
      const currentPage = Number(new URLSearchParams(currentHashQuery).get('page')) || 1;
      const activityResponse = await getActivityLog(currentPage, 9);
      const activityLog = Array.isArray(activityResponse.activities) ? activityResponse.activities : [];
      const totalPages = activityResponse.totalPages || 1;

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
              <div class=" bg-primary text-white avatar">${(profile.name || 'U').slice(0, 2).toUpperCase()}</div>
              <div class="profile-user-info">
                <h2>${profile.name || 'No Name'}</h2>
                <p>${isAdmin ? 'Administrator' : 'User'}</p>
                <div class="profile-badges">
                  <span class="badge-pill">${isAdmin ? 'Administrator' : 'Standard user'}</span>
                  <span class="badge-pill">${verified}</span>
                  <span class="badge-pill">${profileCompleted}</span>
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
                      <tr><td>Full name</td><td>${profile.name || 'No Name Set'}</td></tr>
                      <tr><td>Email</td><td>${email}</td></tr>
                      <tr><td>Phone number</td><td>${profile.phoneNumber || 'Not available' }</td></tr>
                      <tr><td>Role</td><td>${isAdmin ? 'Administrator' : 'User'}</td></tr>
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
              <p class="text-muted">Update your name, username, phone number, and profile bio.</p>
              <div class="field-grid">
                <div class="form-block">
                  <label class="form-label" for="profileName">Full name</label>
                  <input class="form-control" id="profileName" type="text" value="${profile.name || ''}" placeholder="e.g. Amina Wanjohi">
                </div>
                <div class="form-block">
                  <label class="form-label" for="profileUserName">User name</label>
                  <input class="form-control" id="profileUserName" type="text" value="${profile.userName || ''}" placeholder="e.g. aminawanjohi">
                </div>
                <div class="form-block">
                  <label class="form-label" for="profilePhone">Phone number</label>
                  <input class="form-control" id="profilePhone" type="text" value="${profile.phoneNumber || ''}" placeholder="e.g. 0712 345 678">
                </div>
                <div class="form-block">
                  <label class="form-label" for="profileNationalID">National ID</label>
                  <input class="form-control" id="profileNationalID" type="number" value="${profile.nationalID || ''}" placeholder="e.g. 12345678">
                </div>
                <div class="form-block">
                  <label class="form-label" for="bio">Bio</label>
                  <textarea class="form-control" id="bio" placeholder="Tell us about yourself...">${profile.bio || ''}</textarea>
                </div>
              </div>
              <div class="profile-actions">
                <button id="save-profile-button" class="btn btn-primary" type="button">Save profile</button>
                <button id="reset-profile-button" class="btn btn-outline" type="button">Reset form</button>
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
                  <input class="form-control" type="email" id="email" value="${email}" />
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
              <div class="profile-actions">
                  <button type="button" formnovalidate id="update-profile-button" class="btn btn-primary">Update Profile</button>
              </div>
            </div>
            <!--end of profile password change form-->
          </div>
          <!--end of profile grid-->
           <!--profile activity feed-->
            <div class="panel">
              <div class="card-title">Recent activity</div>
              <div class="activity-grid">
                ${
                  activityLog && activityLog.length ? activityLog
                  .map(
                    (activity) => {
                      const createdAtDate = activity.createdAt ? new Date(activity.createdAt).toLocaleString() : 'Date unavailable';
                      return `
                    <div class="activity-card">
                      <strong>${activity.action || 'Activity'}</strong>
                      <span>
                        ${activity.description || 'No description'}
                        <br>
                        <small>${createdAtDate}</small>
                      </span>
                    </div>
                    `;
                    }
                  )
                  .join('') : `
                  <div class="activity-empty">
                    <span>No recent activity</span>
                  </div>
                  `
                }
              </div>
              <div class="pagination-container">
                <button id="previous-page" class="btn-outline-primary" data-page="${currentPage}" ${currentPage === 1 ? 'disabled' : ''}>Previous</button>
                <span class="pagination-info">Page ${currentPage} of ${totalPages}</span>
                <button id="next-page" class="btn-outline-secondary" data-page="${currentPage}" ${currentPage >= totalPages ? 'disabled' : ''}>Next</button>
              </div>
            <!--end of profile activity feed-->
        </div>
      </div>  
        `;
    }
};
export default Profile;