import profileImg from '../assets/account.png';
import logoImg from '../assets/SOFTCRAZE_LOGO.PNG';
import { clearUser, getUserInfo } from "../localStorage";

const Header = {
    vignette: ()=>{
        // Sign out button event listener
        const signoutButton = document.getElementById('signout-button');
        if (signoutButton) {
          signoutButton.onclick = async () => {
            await clearUser();
            document.location.hash = '/';
          };
        };
        const btn = document.querySelector('.dropdown-toggle');

        btn?.addEventListener('click', (e)=>{
            console.log('dropdown clicked');
            e.stopPropagation();
            document.getElementById('userDropdown')?.classList.toggle('open');
        });
        document.addEventListener('click', ()=>{
            document.getElementById('userDropdown')?.classList.remove('open');
        });
    },
    render: ()=>{
        const { email, isAdmin } = getUserInfo();
        return `
            <!--logo-->
            <div class="navbar-left">
                <div class="navbar-logo">
                    <a href="/" class="logo">
                        <span>Mwandya</span>
                    </a>
                </div>
                <button id="sidebarToggle" class="sidebar-toggle" aria-label="Toggle menu">☰</button>
                ${
                    email ?`
                    <div class="navbar-title">
                       Dashboard
                    </div>`:''
                }
            </div>
            ${
                email ? `
                    <div class="navbar-action">
                        <div class="dropdown" id="userDropdown">
                            <button class="dropdown-toggle">
                                <span style="margin-right:0.5em;">👤</span> Admin ▼
                            </button>
                            <div class="dropdown-menu">
                                <a href="profile.html">Profile</a>
                                <a href="settings.html">Settings</a>
                                <a href="#" id="signout-button">Sign Out</a>
                            </div>
                        </div>
                    </div>
                `:''
            }
        `;
    }
};
export default Header;