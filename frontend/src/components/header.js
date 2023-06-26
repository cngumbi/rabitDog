import profileImg from '../assets/account.png';
import { clearUser, getUserInfo } from "../localStorage";

const Header = {
    vignette: ()=>{
        //profile image
        const {name} = getUserInfo();
        if(name !== ""){
            const profileImage = document.getElementById('profileImage');
            profileImage.src = profileImg;
            //signout
            document.getElementById('signout').addEventListener('click', ()=>{
                clearUser();
                document.location.hash = '/';
            });
        }
        
    },
    render: ()=>{
        const {name}  = getUserInfo();
        return `
            <div class="nav container">
                <!--logo-->
                <a href="/" class="logo"><i class='bx bx-home'></i>Quick One Service</a>
                <!--Menu Icons-->
                <input type="checkbox" name="" id="menu">
                <label for="menu"><i class="bx bx-menu" id="menu-icon"></i></label>
                <!--Nav List -->
                ${
                    name ? `
                    <ul class="navbar">
                        <li><a href="/#/home" class="navbar__links active">Home</a></li>
                        <li><a href="/#/about" class="navbar__links">About Us</a></li>
                        <li><a href="/#/services" class="navbar__links">Services</a></li>
                        <li><a href="/#/properties" class="navbar__links">Properties</a></li>
                    </ul>
                    <div class="online">
                        <img class="nav-profile-img" id="profileImage">
                    </div>
                    <div class="user-info">
                        <div>
                            <a href="/#/profile"><h3>${name}</h3></a>
                        </div>
                    </div>
                    <!--Log in Button -->
                    <button type="button" id="signout" class="btn">Sign Out</button>
                    <!--<a href="" id="signout">Sign Out</a>-->
                    ` :` 
                    <ul class="navbar">
                        <li><a href="/#/home" class="navbar__links active">Home</a></li>
                        <li><a href="/#/about" class="navbar__links">About Us</a></li>
                        <li><a href="/#/services" class="navbar__links">Services</a></li>
                        <li><a href="/#/properties" class="navbar__links">Properties</a></li>
                    </ul>                   
                    <!--Log in Button -->
                    <a href="/#/user-current" class="btn">Log In</a>
                    `
                }
            </div>
        `;
    }
};
export default Header;