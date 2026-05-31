import profileImg from '../assets/account.png';
import logoImg from '../assets/SOFTCRAZE_LOGO.PNG';
import { getUserInfo } from "../localStorage";

const Header = {
    vignette: ()=>{        
    },
    render: ()=>{
        const { email, isAdmin } = getUserInfo();
        return `
            <!--logo-->
            <div class="navbar-logo">
                <a href="/" class="logo">
                    <span>Mwandya</span>
                </a>
            </div>
            ${
                email ? `
                    <div class="navbar-title">
                       Dashboard
                    </div>
                    <div class="navbar-action>
                    <div class="dropdown" id="userDropdown">
                        <button class="dropdown-toggle" onclick="document.getElementById('userDropdown').classList.toggle('open)">
                            <span style="margin-right:0.5em;">👤</span> Admin ▼
                        </button>
                        <div class="dropdown">
                            <a href="profile.html">Profile</a>
                            <a href="settings.html">Settings</a>
                            <a href="#">Sign Out</a>
                        </div>
                `:''

            }
            
            <!--<div class="nav container">
                
                <a href="/" class="logo"><i class='bx bx-home'></i>Mwendya</a>
                <!--Menu Icons--
                <input type="checkbox" name="" id="menu">
                <label for="menu"><i class="bx bx-menu" id="menu-icon"></i></label>-->
                ${
                    //userName ? `<a href="/#/profile" class="">${userName}</a>` : ``
                    email ? email:``
                }
            <!--</div>-->
        `;
    }
};
export default Header;