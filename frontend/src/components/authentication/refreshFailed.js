const RefreshFailed = {
    vignette: ()=>{
        // nothing dynamic for now
    },
    render: ()=>{
        return `
            <section class="login container">
                <div class="login-container">
                    <h2>Session Expired</h2>
                    <p>Your session could not be refreshed. Please sign in again to continue.</p>
                    <a href="/#/user-current" class="button">Sign In</a>
                </div>
            </section>
        `;
    }
};

export default RefreshFailed;
