import { getUserInfo } from "../localStorage";

const Aside = {
  after_render: () => {
    const sideLinkEls = document.querySelectorAll('.aside__nav--link');

    sideLinkEls.forEach(sideLinkEl => {
        sideLinkEl.addEventListener('click', function(){
            document.querySelector('.active').classList.remove('active');
            this.classList.add('active');
        });
    });
  },
  render: () => {
    const { name } = getUserInfo();
    return `
        <div class="aside">
            ${ name ? `
                <div class="aside__logo">
                <a href="/#/dashboard"><span>Q</span>uick One <span>i</span>service</a>
                 </div>` : `
                 <div class="aside__logo">
                    <a href="/#/home"><span>Q</span>uick One <span>i</span>service</a>
                </div>
             `}
            <div class="aside__nav-toggler">
                <span></span>
            </div>
            <div id="menu_content">
                <ul class="aside__nav">
                ${ name ? `
                    <li class="aside__nav--item"><a href="/#/newServicee" class="aside__nav--link"><i class="fa fa-list"></i>New Service</a></li>
                    <li class="aside__nav--item"><a href="/#/adduser" class="aside__nav--link"><i class="fa fa-users"></i>Add User</a></li>
                    <li class="aside__nav--item"><a href="/#/dashboard" class="aside__nav--link active"><i class="fa fa-home"></i>Dashboard</a></li>
                ` : `
                    <li class="aside__nav--item"><a href="/#/home" class="aside__nav--link active"><i class="fa fa-home"></i> Home</a></li>
                    <li class="aside__nav--item"><a href="/#/about" class="aside__nav--link"><i class="fa fa-user"></i>About</a></li>
                    <li class="aside__nav--item"><a href="/#/service" class="aside__nav--link"><i class="fa fa-list"></i>Services</a></li>
                    <!--<li class="aside__nav--item"><a href="/#/staff" class="aside__nav--link"><i class="fa fa-users"></i>Staff</a></li>
                    <li class="aside__nav--item"><a href="/#/product" class="aside__nav--link"><i class="fa fa-briefcase"></i>Products</a></li>-->
                    <li class="aside__nav--item"><a href="/#/contact" class="aside__nav--link"><i class="fa fa-comment"></i>Contact</a></li>               
                    <li class="aside__nav--item"><a href="/#/login" class="aside__nav--link"><i class="fa fa-users"></i>Login</a></li>
                ` }
                </ul>
            </div>
        </div>
        `;
  },
};

export default Aside;
