import propertiesImg from '../../assets/tent1.jpg';
import tent2 from '../../assets/tent2.jpg';
const Properties = {
    vignette: ()=>{
        const propertiesImage = document.getElementById('propertiesimage');
        propertiesImage.src = propertiesImg;
        const propImage = document.getElementById('propertyimg');
        propImage.src = propertiesImg;
        const tent2img = document.getElementById('propertiesimages');
        tent2img.src = tent2;
        const propertyImage = document.getElementById('propertiesimg');
        propertyImage.src = tent2;
    },
    render: ()=>{
        return`
            <section class="properties container" id="properties">
                <div class="heading">
                    <span>Recent</span>
                    <h2>Our Featured Tents</h2>
                    <p>This are all the product and services our organisation offer from the largest to <br> smallest, afordable for all kinds of parties and events.<br>Checkout our Products and Services Wel come</p>
                </div>
                <div class="properties-container container">
                <!--box 1-->
                    <div class="box">
                        <img alt="" id="propertiesimage">
                        <h3>Ksh 12,999</h3>
                        <div class="content">
                            <div class="text">
                                <h3>The Tent</h3> 
                                <p>For Tent</p>
                            </div>
                            <div class="icon">
                                <i class='bx bx-user'><span>500</span></i>
                            </div>
                        </div>
                    </div>
                    <!--box 2-->
                    <div class="box">
                        <img alt="" id="propertiesimages">
                        <h3>Ksh 12,999</h3>
                        <div class="content">
                            <div class="text">
                                <h3>The Tent</h3>
                                <p>For Tent</p>
                            </div>
                            <div class="icon">
                                <i class='bx bx-user'><span>50</span></i>
                            </div>
                        </div>
                    </div>
                    <!--box 3-->
                    <div class="box">
                        <img alt="" id="propertiesimg">
                        <h3>Ksh 12,999</h3>
                        <div class="content">
                            <div class="text">
                                <h3>The Tent</h3>
                                <p>For Tent</p>
                            </div>
                            <div class="icon">
                                <i class='bx bx-user'><span>1000</span></i>
                            </div>
                        </div>
                    </div>
                    <!--box 3-->
                    <div class="box">
                        <img alt="" id="propertyimg">
                        <h3>Ksh 12,999</h3>
                        <div class="content">
                            <div class="text">
                                <h3>The Tent</h3>
                                <p>For Tent</p>
                            </div>
                            <div class="icon">
                                <i class='bx bx-user'><span>200</span></i>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        `;
    }
};
export default Properties;