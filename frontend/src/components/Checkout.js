const Checkout = {
    render: (cons)=>{
        return `
            <div class="checkout-steps">
                <div class="${cons.step1 ? 'active' : ''}">SignIn</div>
                <div class="${cons.step2 ? 'active' : ''}">Shipping</div>
                <div class="${cons.step3 ? 'active' : ''}">Payment</div>
                <div class="${cons.step4 ? 'active' : ''}">Place Order</div>
            </div>
        `;
        
    },
};
export default Checkout;