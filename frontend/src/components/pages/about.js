import aboutImg from '../../assets/tent1.jpg';
const About = {
    vignette: ()=>{
        const aboutImage = document.getElementById('aboutimage');
        aboutImage.src = aboutImg;
    },
    render: ()=>{
        return `
            <section class="about container" id="about>
                <div class="about-img">
                    <img id="aboutimage" alt="about image" class="image">
                </div>
                <div class="about-text">
                    <span> About Us</span>
                    <h2> We Provide The Best <br>Tents For You !</h2>
                    <p>Quick One Service is the Leading Tents service provider in Nairobi North Area.
                    Since back in 2017, we have strived to provide the best and most affordable 
                    tents around Nairobi with much success.</p>
                    <p>We have invested in good values and work ethics to create a network to satisfy our customers around Kahawa Ward and Kasarani.</p>
                    <p>Soon we are expanding to Kiambu County as our customers increase.</p>
                    <a href="#" class="btn"> Learn More</a>
                </div>
            </section>
        `;
    }
};

export default About;