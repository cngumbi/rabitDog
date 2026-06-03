import {register} from '../../connection/api';
import { getUserInfo, setUserInfo } from '../../localStorage';
import { hideLoading, showLoading, showMessage, veer } from '../../utils';
const Registration = {
    vignette: ()=>{
        document.getElementById('register-form').addEventListener('submit', async(e)=>{
            e.preventDefault();
            //password match validation
            if(document.getElementById('password').value !== document.getElementById('confirmPassword').value){
                showMessage('Passwords do not match');
                return;
            }
            //password length validation
            if(document.getElementById('password').value.length < 8){
                showMessage('Password must be at least 8 characters');
                return;
            }
            showLoading();
            const data = await register({
                email: document.getElementById('email').value,
                password: document.getElementById('password').value
            });
            if(data.error){
                hideLoading();
                showMessage(data.error);
                return;
            }
            //store user info in local storage
            setUserInfo(data);
            //send verification email
            try {
                const response = await fetch(
                    '/api/users/sendVerificationCode', 
                    {
                        method: 'PATCH',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({ email: data.email })
                    }
                );
                const verificationData = await response.json();
                hideLoading();
                //if the email sending fails, show an error message but still redirect to the verify email page so the user can try again
                if(!response.ok){
                    showMessage(verificationData.message || 'Failed to send verification email. Please check your email or request a new code.');
                } else {
                    //show success message
                    showMessage(verificationData.message || 'Verification email sent successfully');
                }
            } catch (error) {
                hideLoading();
                showMessage('Network error. Please check your connection and try again.');
                console.error('Error sending verification email:', error);
            }
            //redirect to verify email page regardless of email sending success/failure
            //user can resend the code from the verify-email page
            setTimeout(() => {
                document.location.hash = '/verify-email';
            }, 1500);
            
        });
    },
    render: ()=>{
        return`
            <section class="login">
                <div class="login-container">
                    <h2> Welcome, let's get started</h2>
                    <!--login form-->
                    <form action="" id="register-form">
                        <span>Enter your email address</span>
                        <input type="email" name="email" id="email" placeholder="yourmail@gmail.com" required>
                        <span>Enter your Password</span>
                        <input type="password" name="password" id="password" placeholder="At least 8" required>
                        <span>Confirm Password</span>
                        <input type="password" name="confirmPassword" id="confirmPassword" placeholder="Confirm Password" required>
                        <input type="submit" value="Sign Up" class="button">
                        <p>Already have an Account? <a href="/#/user-current">Sign In</a></p>
                    </form>
                </div>
            </section>
        `;
    }
};

export default Registration;