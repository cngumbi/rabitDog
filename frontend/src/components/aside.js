const Aside = {
    after_render: ()=>{},
    render: ()=>{
        return`
        <div class="aside">
            <div class="aside__logo">
                <a href="home"><span>A</span>tomic <span>i</span>nternet</a>
            </div>
            <div class="aside__nav-toggler">
                <span></span>
            </div>
            <ul class="aside__nav">
                <li><a href="home" class="active"><i class="fa fa-home"></i> Home</a></li>
                <li><a href="about"><i class="fa fa-user"></i>About</a></li>
                <li><a href="services"><i class="fa fa-list"></i>Services</a></li>
                <li><a href="staff"><i class="fa fa-users"></i>Staff</a></li>
                <li><a href="projects"><i class="fa fa-briefcase"></i>Projects</a></li>
                <li><a href="contact"><i class="fa fa-comment"></i>Contact</a></li>
            </ul>
        </div>
        `;
    }
};

export default Aside;