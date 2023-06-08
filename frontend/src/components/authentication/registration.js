import signupImg from '../../assets/account.png';
const Registration = {
    vignette: ()=>{
        const signupImage = document.getElementById('signupImage');
        signupImage.src = signupImg;
    },
    render: ()=>{
        return`
            <section class="login container">
                <div class="login-container">
                    <h2> Welcome, let's get started</h2>
                    <p>Already have an Account? <a href="/#/user-current">Sign In</a></p>
                    <!--login form-->
                    <form action="">
                        <span>Full Name</span>
                        <input type="text" name="" id="fullName" placeholder="your Name PLease" required>
                        <span>User Name</span>
                        <input type="text" name="" id="userlName" placeholder="User Name PLease" required>
                        <span>Phone Number</span>
                        <input type="number" name="" id="phoneNumber" placeholder="Enter your Number" required>
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