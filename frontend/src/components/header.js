const Header = {
    vignette: ()=>{
        //const headerLinkEls = document.querySelectorAll('.navbar__links');
//
        //headerLinkEls.forEach(headerLinkEl => {
        //    headerLinkEl.addEventListener('click', function(){
        //        if(document.querySelector('.active') !== null){
        //            document.querySelector('.active').classList.remove('active');
        //        }
        //        this.classList.add('active');
        //    });
        //});
    },
    render: ()=>{
        return `
            <div class="nav container">
                <!--logo-->
                <a href="/#/home" class="logo"><i class='bx bx-home'></i>Quick One Service</a>
                <!--Menu Icons-->
                <input type="checkbox" name="" id="menu">
                <label for="menu"><i class="bx bx-menu" id="menu-icon"></i></label>
                <!--Nav List -->
                <ul class="navbar">
                    <li><a href="/#/home" class="navbar__links active">Home</a></li>
                    <li><a href="/#/about" class="navbar__links">About Us</a></li>
                    <li><a href="/#/services" class="navbar__links">Services</a></li>
                    <li><a href="/#/properties" class="navbar__links">Properties</a></li>
                </ul>
                <!--Log in Button -->
                <a href="/#/user-current" class="btn">Log In</a>
            </div>
        `;
    }
};
export default Header;