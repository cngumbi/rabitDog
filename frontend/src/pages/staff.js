const Staff = {
    after_render: ()=>{},
    render: ()=>{
        return`
        <!--=========================projects section-->
             <section class="project section" id="staff">
                <div class="container">
                    <div class="row">
                        <div class="section-title padding">
                            <h2>Staff</h2>
                        </div>
                    </div>
                    <div class="row">
                        <div class="project-heading padding">
                            <h2>Quick One Service Staff :</h2>
                        </div>
                    </div>
                    <div class="row">
                        <!--staff-->
               
                        <div class="project-item padding">
                            <div class="project-item-inner shadow-dark">
                                <div class="project-img">
                                    <img src="images/1.jpeg" alt="project image">
                                </div>
                            </div>
                        </div>
                      
                        
                    </div>
                </div>
            </section>
        `;
    }
};
export default Staff;