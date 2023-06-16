import signupImg from '../../assets/account.png';
import { register } from '../../connection/api';
import { getUserInfo, setUserInfo } from '../../localStorage';
import { hideLoading, showLoading, showMessage, veer } from '../../utils';
const Registration = {
    vignette: ()=>{
        const signupImage = document.getElementById('signupImage');
        signupImage.src = signupImg;
        document.getElementById('registration-form').addEventListener('submit', async(e)=>{
            e.preventDefault();
            showLoading();
            const data = await register({
                name: document.getElementById('fullName').value,
                userName: document.getElementById('userName').value,
                phoneNumber: document.getElementById('phoneNumber').value,
                email: document.getElementById('email').value,
                password: document.getElementById('password').value
            });
            hideLoading();
            if(data.error){
                showMessage(data.error);
            }else{
                setUserInfo(data);
                veer();
            }
        });
    },
    render: ()=>{
        if(getUserInfo().name){
            veer();
        }
        return`
            <section class="login container">
                <div class="login-container">
                    <h2> Welcome, let's get started</h2>
                    <p>Already have an Account? <a href="/#/user-current">Sign In</a></p>
                    <!--login form-->
                    <form action="" id="registration-form">
                        <span>Full Name</span>
                        <input type="text" name="" id="fullName" placeholder="your Name PLease" required>
                        <span>User Name</span>
                        <input type="text" name="" id="userName" placeholder="User Name PLease" required>
                        <span>Phone Number</span>
                        <input type="text" name="" id="phoneNumber" placeholder="+254720123456" required>
                        <span>Enter your email address</span>
                        <input type="email" name="" id="email" placeholder="yourmail@gmail.com" required>
                        <span>Enter your Password</span>
                        <input type="password" name="" id="password" placeholder="At least 8" required>
                        <span>Confirm Password</span>
                        <input type="password" name="" id="confirmPassword" placeholder="Confirm Password" required>
                        <input type="submit" value="SignIn" class="button">
                    </form>
                </div>
                <div class="login-image">
                    <img alt="" id="signupImage">
                </div>
            </section>
        
        `;
    }
};

export default Registration;