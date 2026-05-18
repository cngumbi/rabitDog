import { signIn } from '../../connection/api';
import { getUserInfo, setUserInfo } from '../../localStorage';
import { hideLoading, showLoading, showMessage, veer } from '../../utils';
const SignIn = {
    vignette: ()=>{
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
                document.location.hash = '/dashboard';
            }
        })
    },
    render: ()=>{
        return`
            <section class="login container">
                <div class="login-container">
                    <h2> Login to continue</h2>
                    <p> use the data Created During registration</p>
                    <!--login form-->
                    <form action="" method="post" id="signin-form">
                        <span>Enter your email address</span>
                        <input type="email" name="" id="email" placeholder="yourmail@gmail.com" required>
                        <span>Enter your Password</span>
                        <input type="password" name="" id="password" placeholder="Password" required>
                        <input type="submit" value="Sign In" class="button">
                        <a href="/#/forget">Forget Password?</a>
                        <a href="/#/new-user-create">Register for an Account.</a>
                    </form>
                </div>
            </section>
        `;
    }
};

export default SignIn;