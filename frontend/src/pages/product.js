const Product = {
    after_render: ()=>{},
    render: ()=>{
        return`
        <!--=========================projects section-->
        <section class="project section" id="projects">
            <div class="container">
                <div class="row">
                    <div class="section-title padding">
                        <h2>Products</h2>
                    </div>
                </div>
                <div class="row">
                    <div class="project-heading padding">
                        <h2>Our Products :</h2>
                    </div>
                </div>
                <div class="row">
                    <!--projects-->
                    <div class="project-item padding">
                        <div class="project-item-inner shadow-dark">
                            <div class="project-img">
                                <img src="images/index.jpg" alt="project image">
                            </div>
                        </div>
                    </div>                 
                </div>
            </div>
        </section>
        `;
    }
};

export default Product;