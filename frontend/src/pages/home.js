const Home ={
    after_render: ()=>{},
    render: ()=>{
        return`
        <!--=========================home section-->
        <section class="home section" id="home">
            <div class="container">
                <div class="row">
                    <div class="home-info padding">
                        <h3 class="welcome"> Hello Welcome to <span class="atomic">Atomic internet</span></h3>
                        <h3 class="job">We deal with <span class="typing">Fiber internet connections</span></h3>
                        <p>Lorem ipsum dolor sit amet consectetur adipisicing elit. 
                            Laboriosam qui eveniet placeat facilis neque nam iste ipsa 
                            debitis possimus accusantium praesentium quidem, esse mollitia v
                            elit beatae dolorem sed harum enim!
                        </p>
                        <a href="#contact" class="btn hire-us">Hire Us</a>
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