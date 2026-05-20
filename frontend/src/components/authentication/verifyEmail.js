import { getUserInfo, setUserInfo } from "../../localStorage";
import { hideLoading, showLoading, showMessage } from "../../utils";

const VerifyEmail = {
    vignette: ()=>{
        document.getElementById('verify-form').addEventListener('submit', async(e)=>{
            e.preventDefault();
            const user = getUserInfo();
            const verificationCodeProvided = document.getElementById('verificationCode').value;

            showLoading();
            //call the verify email API
            const response = await fetch(
                '/api/users/verifyEmail', 
                {
                    method: 'PATCH',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ 
                        email: user.email, 
                        verificationCodeProvided: verificationCodeProvided
                    })
                }
            );
            //get the response data
            const verificationData = await response.json();
            hideLoading();
            if(verificationData.message === 'Email verified successfully'){
                setUserInfo({
                    ...user,
                    verified: true
                });
                showMessage('Email verified successfully');
                document.location.hash = '/dashboard';
                return;
            }else{
                showMessage(verificationData.message || 'Failed to verify email');
                return;
            }
        });
    },
    render: ()=>{
        const { email, verified } = getUserInfo();
        return`
           <section class="login container">
                <div class="login-container">
                    <h2>Email Verification</h2>
                    <p>
                        A verification code has been sent to:
                    </p>
                    <h3>${email}</h3>
                    <form id="verify-form">
                        <span>Enter Verification Code</span>
                        <input 
                            type="text"
                            id="verificationCode"
                            placeholder="6-digit code"
                            required
                        >
                        <input
                            type="submit"
                            value="Verify Email"
                            class="button"
                        >
                    </form>
                </div>
            </section>
        `;
    }
};

export default VerifyEmail;