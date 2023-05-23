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
                                <h3 class="job">We deal with <span class="typing">Tents Design, Tent Repair and Tents for Hire</span></h3>
                                <p>
                                Quick One Service is the Leading Tents service provider in Nairobi North Area.
                                Since back in 2017, we have strived to provide 
                                the best and most affordable tents around Nairobi with much success.
                                We have invested in good values and work ethics to create a network to satisfy our customers around Kahawa Ward and Kasarani.
                                Soon we are expanding to Kiambu County as our customers increase.
                                </p>
                            </div>
                        </div>
                        <div class="row">
                            <div class="company-info padding">
                                <div class="row">
                                    <div class="info-item padding">
                                        <p>Location : <span>Kahawa Ward</span></p>
                                    </div>
                                    <div class="info-item padding">
                                        <p>city : <span>Nairobi</span></p>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div class="row">
                            <div class="buttons padding">
                                <a href="/#/contact" class="btn">Hire Us</a>
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
