//import { getUserInfo, getShipping, setShipping } from '../localStorage';
//import CheckoutSteps from '../components/CheckoutSteps';
import Checkout from '../components/Checkout';
import { getShipping, getUserInfo, setShipping } from '../localStorage';

const ShippingPage = {
  vignette: () => {
    document
      .getElementById('shipping-form')
      .addEventListener('submit', async (e) => {
        e.preventDefault();
        setShipping({
          address: document.getElementById('address').value,
          city: document.getElementById('city').value,
          postalCode: document.getElementById('postalCode').value,
          country: document.getElementById('country').value,
        });
        document.location.hash = '/payment';
      });
  },
  render: () => {
    const { name } = getUserInfo;
    if (!name) {
      document.location.hash = '/';
    }
    const { address, city, postalCode, country } = getShipping();
    return `
    ${Checkout.render({ step1: true, step2: true })}
    <section class="shipping container">
      <div class=" shipping-container">
        <form id="shipping-form">
            <span>Shipping</span>
            <input type="text" name="address" id="address" value="${address}" />
            <input type="text" name="city" id="city" value="${city}" />
            <input type="text" name="postalCode" id="postalCode" value="${postalCode}" />
            <input type="text" name="country" id="country" value="${country}" />
            <input type="submit" class="button" value="Continue">
        </form>
      </div>
    </section>
    `;
  },
};
export default ShippingPage;
