import profileImg from '../assets/account.png';
import { clearUser, getUserInfo } from "../localStorage";

const Header = {
    vignette: ()=>{
        //profile image
        //const {name} = getUserInfo();
        //if(name !== ""){
        //    const profileImage = document.getElementById('profileImage');
        //    profileImage.src = profileImg;
        //    //signout
        //    document.getElementById('signout').addEventListener('click', ()=>{
        //        clearUser();
        //        document.location.hash = '/';
        //    });
        //}
        
    },
    render: ()=>{
        return `
            <div class="nav container">
                <!--logo-->
                <a href="/" class="logo"><i class='bx bx-home'></i>Mwendya planners</a>
                <!--Menu Icons-->
                <input type="checkbox" name="" id="menu">
                <label for="menu"><i class="bx bx-menu" id="menu-icon"></i></label>
                <!--Nav List -->
                <ul class="navbar">
                    <li><a href="/#/home" class="navbar__links active">Home</a></li>
                    <li><a href="/#/about" class="navbar__links">About Us</a></li>
                    <li><a href="/#/services" class="navbar__links">Services</a></li>
                    <li><a href="/#/properties" class="navbar__links">Properties</a></li>
                </ul>                   
                <!--Log in Button 
                <a href="/#/user-current" class="btn">Log In</a> -->
            </div>
        `;
    }
};
export default Header;