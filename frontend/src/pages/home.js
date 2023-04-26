import Typed from 'typed.js';
const Home ={
    after_render: ()=>{
        const options = {
            strings: [
                "",
                "Tent design",
                "Tent Repair",
                "Tent For Hire",
                "And Other Services"
            ],
            typedSpeed: 100,
            BackSpeed: 160,
            fadeOut: true,
            loop: true
        }
        const typed = new Typed('.typing', options);
    },
    render: ()=>{
        return`
        <!--=========================home section-->
        <section class="home section" id="home">
            <div class="container">
                <div class="row">
                    <div class="home-info padding">
                        <h3 class="welcome"> Hello Welcome to <span class="atomic">Quick One Service</span></h3>
                        <h3 class="job">We deal with <span class="typing"></span></h3>
                        <p>
                        We at Quick One Service have invested in affordable and accessible Tents designs ranging from medium to large Tents.
                        We welcome all current and potential customers to hire Tents from us. We are located in Kahawa Ward.
                        For more information <a href="#/contact" >Contact Us</a>
                        </p>
                        <a href="#/contact" class="btn">Hire Us</a>
                    </div>
                    <div class="home-image padding">
                       <img src="images/index.jpg" alt="site image">
                    </div>
                </div>
            </div>
        </section>
        `;
    }
};

export default Home;