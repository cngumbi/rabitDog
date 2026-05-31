import { hideLoading, showLoading, showMessage } from "../../utils";

const Forget = {
    vignette: ()=>{
        document.getElementById('send-reset-code-form').addEventListener('submit', async(e)=>{
            e.preventDefault();
            try{
                showLoading();
                const response = await fetch('/api/users/sendForgetPasswordCode', {
                    method: 'PATCH',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        email: document.getElementById('email').value
                    })
                });
                const data = await response.json();
                hideLoading();
                if (!response.ok) {
                    showMessage(data.message || 'failed to send reset code. please try again later.');
                    return;
                }
                showMessage(data.message || 'Reset code sent to your email. Please check your inbox.');
                //hide the send verification code form
                document.getElementById('send-reset-code-button').classList.add('hidden');
                // Show the reset password form
                document.getElementById('reset-password-section').classList.remove('hidden'); 
            } catch (error) {
                hideLoading();
                console.error('Error:', error);
                showMessage('An error occurred while sending the reset code.');
            }
        });
        // Add event listener for reset password form submission
        document.getElementById('reset-password-form').addEventListener('submit', async(e)=>{
            e.preventDefault();
            const email = document.getElementById('email').value;
            const verificationCode = document.getElementById('verificationCode').value;
            const newPassword = document.getElementById('newPassword').value;
            const confirmPassword = document.getElementById('confirmPassword').value;
            if(newPassword !== confirmPassword){
                showMessage('Passwords do not match. Please try again.');
                return;
            }
            if(newPassword.length < 8){
                showMessage('Password must be at least 8 characters long. Please try again.');
                return;
            }
            try{
                showLoading();
                const response = await fetch('/api/users/verifyForgottenPassword', {
                    method: 'PATCH',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        email: email,
                        verificationCodeProvided: verificationCode,
                        newPassword: newPassword
                    })
                });
                const data = await response.json();
                hideLoading();
                if (!response.ok) {
                    showMessage(data.message || 'Failed to reset password. Please try again later.');
                    return;
                }
                showMessage(data.message || 'Password reset successfully.');
                // Redirect to login page or show success message
                document.location.hash = '/user-current';
            } catch (error) {
                hideLoading();
                console.error('Error:', error);
                showMessage('An error occurred while resetting the password.');
            }
        });
    },
    render: ()=>{
        return`
         <section class="login container">
                <div class="login-container">
                    <h2>Forgot Password</h2>
                    <p> Enter your email address to receive a password reset code. </p>
                    <!-- SEND RESET CODE FORM -->
                    <div class="send-reset-code-section">
                        <form id="send-reset-code-form">
                            <span>Email Address</span>
                            <input type="email" id="email" placeholder="yourmail@gmail.com" required>
                            <input type="submit" value="Send Verification Code" id="send-reset-code-button" class="button">
                            <a href="/#/user-current">Back to Login.</a>
                        </form>
                    </div>
                    <!-- RESET PASSWORD FORM -->
                    <div id="reset-password-section" class="hidden">
                        <form id="reset-password-form">
                            <span>Verification Code</span>
                            <input type="text" id="verificationCode" placeholder="6-digit code" required>
                            <span>New Password</span>
                            <input type="password" id="newPassword" placeholder="New Password" required>
                            <span>Confirm Password</span>
                            <input type="password" id="confirmPassword" placeholder="Confirm Password" required>
                            <input type="submit" value="Reset Password" class="button">
                        </form>
                    </div>
                </div>

            </section>
        `;
    }

};
export default Forget;
