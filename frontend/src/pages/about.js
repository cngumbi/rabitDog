const About = {
    after_render: ()=>{},
    render: ()=>{
        return `
        <!--=========================about section-->
        <section class="about section" id="about">
            <div class="container">
                <div class="row">
                    <div class="section-title padding">
                        <h2>About Us</h2>
                    </div>
                </div>
                <div class="row">
                    <div class="about-content padding">
                        <div class="row">
                            <div class="about-text padding">
                                <h3 class="job">We deal with <span class="typing">Fiber internet connections</span></h3>
                                <p>Lorem ipsum dolor sit amet consectetur, adipisicing elit. 
                                    Corporis perferendis odit facilis, sed recusandae sint, 
                                    similique deleniti aperiam est labore rem! 
                                    Possimus officia harum nemo sunt dolor impedit itaque aspernatur!
                                </p>
                            </div>
                        </div>
                        <div class="row">
                            <div class="company-info padding">
                                <div class="row">
                                    <div class="info-item padding">
                                        <p>Location : <span>kahawa west</span></p>
                                    </div>
                                    <div class="info-item padding">
                                        <p>city : <span>Nairobi</span></p>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div class="row">
                            <div class="buttons padding">
                                <a href="#contact" class="btn">Hire Us</a>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
        `;
    }
};

export default About;