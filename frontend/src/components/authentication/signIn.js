import loginImage from '../../assets/welcome.jpg';
import { signIn } from '../../connection/api';
import { getUserInfo, setUserInfo } from '../../localStorage';
import { hideLoading, showLoading, showMessage, veer } from '../../utils';
const SignIn = {
    vignette: ()=>{
        const loginImg = document.getElementById('loginImage');
        loginImg.src = loginImage;
        document.getElementById('signin-form').addEventListener('submit', async(e)=>{
            e.preventDefault();
            showLoading();
            const data = await signIn({
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
        })
    },
    render: ()=>{
        if(getUserInfo().name){
            veer();
        }
        return`
            <section class="login container">
                <div class="login-container">
                    <h2> Login to continue</h2>
                    <p> use the data Created During registration</p>
                    <!--login form-->
                    <form action="" id="signin-form">
                        <span>Enter your email address</span>
                        <input type="email" name="" id="email" placeholder="yourmail@gmail.com" required>
                        <span>Enter your Password</span>
                        <input type="password" name="" id="password" placeholder="Password" required>
                        <input type="submit" value="Sign In" class="button">
                        <a href="#">Forget Password?</a>
                    </form>
                    <a href="/#/new-user-create" class="btn">Sign Up</a>
                </div>
                <div class="login-image">
                    <img alt="" id="loginImage">
                </div>
            </section>
        
        `;
    }
};

export default SignIn;