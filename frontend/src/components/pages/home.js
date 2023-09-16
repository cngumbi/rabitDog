import homeImg from '../../assets/tent2.jpg'
const Home = {
    vignette: ()=>{
        const homeImage = document.getElementById('homeimage');
        homeImage.src = homeImg;
    },
    render: ()=>{
        return`
            <section class="home container" id="home">
                <div class="home-image">
                    <img  alt="main page image" id="homeimage" class="home-img">
                </div>
                <div class="home-text">
                    <h1> Find Your Next <br>Perfect Place To <br>Rent Tents.</h1>
                   <a href="/#/properties" class="btn">Rent Now</a>
                </div>
            </section>
        `;
    }
};

export default Home;