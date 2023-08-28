import ParseRequestUrl from "../../config/parseUrl";
import { getProduct } from "../../connection/api";
import { getCartItems, setCartItems } from "../../localStorage";
import { vitalize } from "../../utils";

const addToCart = ( item, forceUpdate = false ) =>{
    let cartItems = getCartItems();
    const existItem = cartItems.find( (x) => x.product === item.product );
    if(existItem){
        if(forceUpdate){
            cartItems = cartItems.map((x) => x.product === existItem.product ? item : x);
        }
    }else{
        cartItems = [ ...cartItems, item ];
    }
    setCartItems(cartItems);
    if(forceUpdate){
        vitalize(CartPage);
    }
};

const removeFromCart = (id) => {
    setCartItems(getCartItems().filter((x)=> x.product !== id));
    if(id === ParseRequestUrl().id){
        document.location.hash = '/cart';
    }else{
        vitalize(CartPage);
    }
};

const CartPage = {
    vignette: ()=>{
        const qtySelects = document.getElementsByClassName('qty-select');
        Array.from(qtySelects).forEach((qtySelect) => {
            qtySelect.addEventListener('change', (e) => {
                const item = getCartItems().find((x)=>x.product === qtySelect.id);
                addToCart({ ...item, qty: Number(e.target.value) }, true);
            });
        });
        document.getElementById('checkout-button').addEventListener('click', ()=>{
            document.location.hash = '/user-current';
        })
    },
    render: async()=>{
        const request = ParseRequestUrl()
        if(request.id){
            const product = await getProduct(request.id);
            addToCart(
                {
                    product: product._id,
                    name: product.name,
                    image: product.image,
                    price: product.price,
                    countInStock: product.countInStock,
                    qty: 1,
                }
            );
        }
        const cartItems = getCartItems();
        return `
        <div class="">
            <div class="">
                <ul class="">
                    <li>
                        <h3>Shopping Cart</h3>
                        <div>Price</div>
                    </li>
                    ${
                        cartItems.length === 0 ? '<div>Cart is Empty. <a href="/#/">Go Shopping</a>': cartItems.map((item)=>{
                            `
                                <li>
                                    <div class="">
                                        <img src="${item.image}"/>
                                    </div>
                                    <div class="">
                                        <div><a href="/#/product/${item.product}">${item.name}</a></div>
                                        <div>Qty: <select class="qty-select" id="${item.product}">
                                            ${[...Array(item.countInStock).keys()].map((x)=>item.qty === x + 1 ? `<option selected value="${x + 1}"> ${x + 1}</option>` : `<option value="${x + 1}"> ${x + 1}</option>`)}
                                        </select></div>
                                        <button type="button" class="" id="${item.product}">Delete</button>
                                    </div>
                                    <div class=""> Ksh ${item.price}</div>
                                </li>
                            `
                        }).join('\n')
                    }
                </ul>
            </div>
            <div class="">
                    <h3>Subtotal (${cartItems.reduce((a, c)=> a + c.qty, 0)} items) : Ksh${cartItems.reduce((a, c)=> a + c.price * c.qty, 0)}</h3>
                    <button id="checkout-button" class="">Proceed to Checkout</button>
            </div>
        </div>
        `
    }
};
export default CartPage;