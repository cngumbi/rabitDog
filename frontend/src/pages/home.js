import Typed from 'typed.js';
const Home ={
    after_render: ()=>{
        const options = {
            strings: [
                "",
                "Internet Connection",
                "Fiber Connection",
                "Phone Repair"
            ],
            typedSpeed: 40,
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
                        <h3 class="welcome"> Hello Welcome to <span class="atomic">Atomic internet</span></h3>
                        <h3 class="job">We deal with <span class="typing">Fiber internet connections</span></h3>
                        <p>
                        We as Atomic Internet have invested in affordable and accessible internet ranging from fibre to wireless.
                        We welcome all current and potential customers to <a href="#/contact" >contact us</a> for more details
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