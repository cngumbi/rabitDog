const Service = {
    after_render: ()=>{},
    render: ()=>{
        return `
        <!--=========================service section-->
        <section class="service section" id="services">
            <div class="container">
                <div class="row">
                    <div class="section-title padding">
                        <h2>Services</h2>
                    </div>
                </div>
                <div class="row">
                    <!--service items-->
                    <div class="service-item padding">
                        <div class="service-item-inner">
                            <div class="icon">
                                <i class="fa fa-laptop-code"></i>
                            </div>
                            <h4><a href="/#/serviceinfo">internet conection</a></h4>
                            <p>Lorem ipsum dolor sit amet, consectetur adipisicing elit.</p>
                        </div>
                    </div>
                </div>
            </div>
        </section>
        `;
    }
};
export default Service;