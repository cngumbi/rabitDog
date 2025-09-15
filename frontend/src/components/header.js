import profileImg from '../assets/account.png';
import { getUserInfo } from "../localStorage";

const Header = {
    vignette: ()=>{        
    },
    render: ()=>{
        const { userName, isAdmin } = getUserInfo();
        return `
            <div class="nav container">
                <!--logo-->
                <a href="/" class="logo"><i class='bx bx-home'></i>Mwendya</a>
                <!--Menu Icons-->
                <input type="checkbox" name="" id="menu">
                <label for="menu"><i class="bx bx-menu" id="menu-icon"></i></label>
                ${
                    userName ? `<a href="/#/profile" class="">${userName}</a>` : ``
                }               
                
                ${ isAdmin ? `<a href="/#/new-user-create" class="">Sign Up new User</a>` : ''}
            </div>
        `;
    }
};
export default Header;