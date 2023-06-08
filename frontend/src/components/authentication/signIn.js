import loginImage from '../../assets/welcome.jpg';
const SignIn = {
    vignette: ()=>{
        const loginImg = document.getElementById('loginImage');
        loginImg.src = loginImage;
    },
    render: ()=>{
        return`
            <section class="login container">
                <div class="login-container">
                    <h2> Login to continue</h2>
                    <p> use the data Created During registration</p>
                    <!--login form-->
                    <form action="">
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