import { getUserInfo, setPayment } from '../../localStorage';
import Checkout from '../Checkout';

const PaymentMethods = {
    vignette: () => {
    document
      .getElementById('payment-form')
      .addEventListener('submit', async (e) => {
        e.preventDefault();
        const paymentMethod = document.querySelector(
          'input[name="payment-method"]:checked'
        ).value;
        setPayment({ paymentMethod });
        document.location.hash = '/placeorder';
      });
  },
  render: () => {
    const { name } = getUserInfo();
    if (!name) {
      document.location.hash = '/';
    }
    return `
    ${Checkout.render({ step1: true, step2: true, step3: true })}
    <section class="payment container">
        <div class="payment-container">
          <form id="payment-form">
            <span>Payment</span>
            <ul class="form-items">
              <li>
                <div>
                  <input type="radio"
                  name="payment-method"
                  id="paypal"
                  value="Paypal"
                  checked />
                  <label for="paypal" >PayPal</label>
                 </div> 
              </li>
              <li>
              <div>
                <input type="radio"
                name="payment-method"
                id="Mpesa"
                value="Mpesa"
                 />
                <label for="Mpesa" >Mpesa</label>
               </div> 
            </li>
              <li>
                <input type="submit" class="button" value="Continue">
              </li>        
            </ul>
          </form>
        </div>
    </section>
    `;
  },
};
export default PaymentMethods;
