import axios from 'axios';

const Properties = {
    vignette: ()=>{
    },
    render: async()=>{
        const response = await axios({
            url: 'http://localhost:5000/api/properties',
            headers: {
                'Content-Type': 'application/json',
            }
        });
        if(!response || response.statusText !== 'OK'){
            return `<div> error in geeting data</div>`;
        }
        const properties = response.data;
        return`
            <section class="properties container" id="properties">
                <div class="heading">
                    <span>Recent</span>
                    <h2>Our Featured Tents</h2>
                    <p>This are all the product and services our organisation offer from the largest to <br> smallest, afordable for all kinds of parties and events.<br>Checkout our Products and Services Wel come</p>
                </div>
                <div class="properties-container container">
                    <!--property boxes-->
                    ${properties.map( (property) => `
                        <div class="box">
                            <a href="/#/property/${property._id}>
                                <img src="${property.image}"alt="${property.name}">
                            </a>
                            <h3>Ksh ${property.price}</h3>
                            <div class="content">
                                <div class="text">
                                    <h3>${property.name}</h3> 
                                    <p>${property.event}</p>
                                </div>
                                <div class="icon">
                                    <i class='bx bx-user'><span>${property.capacity}</span></i>
                                </div>
                            </div>
                        </div>
                    `).join('\n')}
                </div>
            </section>
        `;
    }
};
export default Properties;