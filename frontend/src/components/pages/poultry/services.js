const Services = {
    vignette: ()=>{},
    render: ()=>{
        return `
            <section class="services container" id="services">
                <!--box1-->
                <div class="box">
                    <i class='bx bx-user'></i>
                    <h3>Make Your Dream True</h3>
                    <p> Rent Your first tent and start organising your events fast, easy and affordable</p>
                </div>
                <!--box2-->
                <div class="box">
                    <i class='bx bx-desktop'></i>
                    <h3>Start Your Membership</h3>
                    <p>Join us and start rent and design great Tent for your Events</p>
                </div>
                <!--box3-->
                <div class="box">
                    <i class='bx bx-home-alt'></i>
                    <h3>Enjoy Your New Tent</h3>
                    <p>Buy quality tents from Quick One Service</p>
                </div>
                <!--box4-->
                <div class="box">
                    <i class='bx bx-briefcase-alt'></i>
                    <h3>Repair Your Tent</h3>
                    <p>We offer tent repair service at Quick One Service</p>
                </div>
            </section>
        `;
    }
};

export default Services;