import { signIn } from '../../connection/api';
import { setUserInfo } from '../../localStorage';
import { hideLoading, showLoading, showMessage} from '../../utils';
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
            //check if there is an error
            if(data.error){
                showMessage(data.error);
            }
            setUserInfo(data);
            if(!data.verified){
                try{
                    //send verification code to user's email
                    const response = await fetch(
                        '/api/users/sendVerificationCode',
                        {
                            method: 'PATCH',
                            headers: {
                                'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({
                            email: data.email
                        })
                    });
                    const verificationData = await response.json();
                    hideLoading();
                    if(!response.ok){
                        showMessage(verificationData.message || 'Failed to send verification email.');
                        return;
                    }
                    showMessage(
                        verificationData.message ||
                        'Verification code sent to your email. Please check your inbox.'
                    );
                    document.location.hash = '/verify-email';
                    return;
                } catch (error) {
                    hideLoading();
                    console.error(error);
                    showMessage('Failed to send verification email.');
                    return;
                }
            }
            document.location.hash = '/dashboard';
            
        });
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