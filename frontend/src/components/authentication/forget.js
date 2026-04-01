const Forget = {
    vignette: ()=>{},
    render: ()=>{
        return`
         <section class="login container">
                <div class="login-container">
                    <h2> Forgot Password</h2>
                    <p>Kindly input you Registered Email below</p>
                    <!--login form-->
                    <form action="" id="forgot-form">
                        <span>Email</span>
                        <input type="email" name="email" id="email" placeholder="yourmail@gmail.com" required>
                        <input type="submit" value="Submit" class="button">
                    </form>
                </div>
            </section>
        `;
    }

};
export default Forget;
