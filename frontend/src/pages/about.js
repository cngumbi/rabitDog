const About = {
  after_render: () => {},
  render: () => {
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
                                <p>
                                Atomic Internet is the Leading Internet service provider in Nairobi North Area.
                                Since back in 2017, we have strived to provide 
                                the best and most affordable internet around Nairobi with much success.
                                We have invested in good values and work ethics to create a network of more than satisfied customers.
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
  },
};

export default About;
