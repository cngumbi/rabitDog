import profileImg from '../assets/account.png';
import logoImg from '../assets/SOFTCRAZE_LOGO.PNG';
import { getUserInfo } from "../localStorage";

const Header = {
    vignette: ()=>{
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
                    <div class="navbar-action">
                        <div class="dropdown" id="userDropdown">
                            <button class="dropdown-toggle">
                                <span style="margin-right:0.5em;">👤</span> Admin ▼
                            </button>
                            <div class="dropdown-menu">
                                <a href="profile.html">Profile</a>
                                <a href="settings.html">Settings</a>
                                <a href="#">Sign Out</a>
                            </div>
                        </div>
                    </div>
                `:''
            }
        `;
    }
};
export default Header;