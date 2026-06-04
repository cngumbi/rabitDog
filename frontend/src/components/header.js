import profileImg from '../assets/account.png';
import { clearUser, getSettings, getUserInfo } from "../localStorage";

const Header = {
    vignette: ()=>{
        (function(){
            const btn = document.getElementById('sidebarToggle');
            const overlay = document.getElementById('sidebarOverlay');
            const MOBILE_BREAKPOINT = 780;
            if(btn){
                btn.addEventListener('click', function(){
                    if(window.innerWidth < MOBILE_BREAKPOINT){
                        document.body.classList.toggle('sidebar-open');
                    } else {
                        document.body.classList.toggle('sidebar-collapsed');
                        localStorage.setItem('panzefarm-sidebar-collapsed', document.body.classList.contains('sidebar-collapsed'));
                    }
                });
            }
            overlay?.addEventListener('click', ()=>{
                document.body.classList.remove('sidebar-open');
            });
            if(window.innerWidth >= MOBILE_BREAKPOINT && localStorage.getItem('panzefarm-sidebar-collapsed') === 'true') {
                document.body.classList.add('sidebar-collapsed');
            }
        })();
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
        const settings = getSettings();
        return `
            <!--logo-->
            <div class="navbar-left">
                <div class="navbar-logo">
                    <a href="/" class="logo">
                        <span>Mwandya</span>
                    </a>
                </div>
                ${
                    email ?`
                    <button id="sidebarToggle" class="sidebar-toggle" aria-label="Toggle menu">☰</button>
                    <div class="navbar-title">
                       ${settings.workspaceName || 'Dashboard'}
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
                                <a href="/#/profile">Profile</a>
                                <a href="/#/settings">Settings</a>
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