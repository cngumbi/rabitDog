import { update } from "../../connection/api";
import { clearUser, getUserInfo, setUserInfo } from "../../localStorage";
import { hideLoading, showLoading, showMessage } from "../../utils";

const Profile = {
    vignette: ()=>{
        document.getElementById('signout-button').addEventListener('click', () => {
            clearUser();
            document.location.hash = '/';
          });
          document
            .getElementById('profile-form')
            .addEventListener('submit', async (e) => {
              e.preventDefault();
              showLoading();
              const data = await update({
                name: document.getElementById('name').value,
                userName: document.getElementById('userName').value,
                phoneNumber: document.getElementById('phoneNumber').value,
                email: document.getElementById('email').value,
                password: document.getElementById('password').value,
              });
              hideLoading();
              if (data.error) {
                showMessage(data.error);
              } else {
                setUserInfo(data);
                document.location.hash = '/';
              }
            });
          },
    render: async()=>{
        const {name, userName, phoneNumber, email} = getUserInfo();
        if(!name){
            document.location.hash = '/';
        }
        return `
        <div class="content profile">
          <div class="profile-info">
          <div class="form-container">
          <form id="profile-form">
            <ul class="form-items">
              <li>
                <h1>User Profile</h1>
              </li>
              <li>
                <label for="name">Name</label>
                <input type="name" name="name" id="name" value="${name}" />
              </li>
              <li>
                <label for="userName">userName</label>
                <input type="text" name="userName" id="userName" value="${userName}" />
              </li>
              <li>
                <label for="phoneNumber">phoneNumber</label>
                <input type="text" name="phoneNumber" id="phoneNumber" value="${phoneNumber}" />
              </li>
              <li>
                <label for="email">Email</label>
                <input type="email" name="email" id="email" value="${email}" />
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
        </div>`;
    }
};
export default Profile;