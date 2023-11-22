import { getProducts } from '../../connection/api';
import ParseRequestUrl  from '../../config/parseUrl';
import Rating from '../rating';


const Properties = {
    vignette: ()=>{
        document.getElementById('search-form').addEventListener('submit', async (e) => {
            e.preventDefault();
            const searchKeyword = document.getElementById('q').value;
            document.location.hash = `/?q=${searchKeyword}`;
        });
    },
    render: async()=>{
        const { value } = ParseRequestUrl();
        const products = await getProducts({ searchKeyword: value });
        if(products.error){
            return `<div>${products.error}</div>`;
        }
        return`
            <section class="properties container" id="properties">
                <div class="heading">
                    <span>Recent</span>
                    <h2>Our Featured Tents</h2>
                    <p>This are all the product and services our organisation offer from the largest to <br> smallest, afordable for all kinds of parties and events.<br>Checkout our Products and Services Wel come</p>
                </div>
                <div class="search">
                    <form class="search-form"  id="search-form">
                      <input type="text" name="q" id="q" value="${value || ''}" /> 
                      <button type="submit"><i class="fa fa-search"></i></button>
                    </form>        
                </div>
                <div class="properties-container container">
                    <!--property boxes-->
                    ${products.map( (product) => `
                        <div class="box">
                            <a href="/#/properties/${product._id}">
                                <img src="${product.image}" alt="${product.name}">
                            </a>
                            <h3>Ksh ${product.price}</h3>
                            <div class="content">
                                <div class="text">
                                    <h3>${product.name}</h3> 
                                    <p>${product.brand}</p>
                                </div>
                                <div class="icon">
                                    <i class='bx bx-user'><span>${product.category}</span></i>
                                </div>
                            </div>
                            <div class="">
                                <div>${product.name}</div>
                                ${Rating.render({
                                    value: product.rating,
                                    text: `${product.numReviews} reviews`,
                                })}
                            </div>
                        </div>
                    `).join('\n')}
                </div>
            </section>
        `;
    }
};
export default Properties;