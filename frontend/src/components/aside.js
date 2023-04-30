import { getUserInfo } from "../localStorage";

const Aside = {
  after_render: () => {},
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
            <ul class="aside__nav">
            ${ name ? `
                <li><a href="/#/newServicee"><i class="fa fa-list"></i>New Service</a></li>
                <li><a href="/#/adduser"><i class="fa fa-users"></i>Add User</a></li>
                <li><a href="/#/dashboard" class="active"><i class="fa fa-home"></i>Dashboard</a></li>
            ` : `
                <li><a href="/#/home" class="active"><i class="fa fa-home"></i> Home</a></li>
                <li><a href="/#/about"><i class="fa fa-user"></i>About</a></li>
                <li><a href="/#/service"><i class="fa fa-list"></i>Services</a></li>
                <!--<li><a href="/#/staff"><i class="fa fa-users"></i>Staff</a></li>-->
                <li><a href="/#/product"><i class="fa fa-briefcase"></i>Products</a></li>
                <li><a href="/#/contact"><i class="fa fa-comment"></i>Contact</a></li>               
                <!--<li><a href="/#/login"><i class="fa fa-users"></i>Login</a></li>-->
            ` }
            </ul>
        </div>
        `;
  },
};

export default Aside;
