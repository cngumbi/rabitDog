import { signIn } from '../../connection/api';
import { setUserInfo } from '../../localStorage';
import { hideLoading, showLoading, showMessage} from '../../utils';

let lockoutTimerId = null;

const renderLockoutCountdown = (lockedUntil) => {
    const element = document.getElementById('lockout-info');
    if (!element || !lockedUntil) return;

    const update = () => {
        const remaining = lockedUntil - Date.now();
        if (remaining <= 0) {
            element.textContent = 'Your account lockout has ended. You may try signing in again.';
            clearInterval(lockoutTimerId);
            lockoutTimerId = null;
            return;
        }
        const minutes = Math.floor(remaining / 60000);
        const seconds = Math.floor((remaining % 60000) / 1000);
        element.textContent = `Account locked. Try again in ${minutes} minute${minutes === 1 ? '' : 's'} ${seconds} second${seconds === 1 ? '' : 's'}.`;
    };

    if (lockoutTimerId) {
        clearInterval(lockoutTimerId);
    }
    update();
    lockoutTimerId = setInterval(update, 1000);
};

const SignIn = {
    vignette: ()=>{
        document.getElementById('signin-form').addEventListener('submit', async(e)=>{
            e.preventDefault();
            try{
                showLoading();
                const data = await signIn({
                    email: document.getElementById('email').value,
                    password: document.getElementById('password').value
                });
                //check if there is an error
                if(data.error){
                    hideLoading();
                    showMessage(data.error);
                    if(data.status === 423 && data.lockedUntil){
                        renderLockoutCountdown(data.lockedUntil);
                    }
                    return;
                }
                setUserInfo(data);
                if(!data.verified){
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
                        }
                    );
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
                }
                hideLoading();
                document.location.hash = '/dashboard';
            } catch(error){
                hideLoading();
                console.error(error);
                showMessage('Failed to sign in. Please check your email and password.');
            }
            
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
                    <div id="lockout-info" class="lockout-info"></div>
                </div>
            </section>
        `;
    }
};

export default SignIn;