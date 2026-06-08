import { deleteOrder, getOrders } from "../../connection/api";
import { hideLoading, showLoading, showMessage, vitalize } from "../../utils";
import DashboardMenu from "../dashboard/dashboardMenu";

const OrderList = {
  vignette: () => {
    const deleteButtons = document.getElementsByClassName('delete-button');
    Array.from(deleteButtons).forEach((deleteButton) => {
      deleteButton.addEventListener('click', async () => {
        if (confirm('Are you sure to delete this order?')) {
          showLoading();
          const data = await deleteOrder(deleteButton.id);
          if (data.error) {
            showMessage(data.error);
          }
          vitalize(OrderList);
          hideLoading();
        }
      });
    });
    const editButtons = document.getElementsByClassName('edit-button');
    Array.from(editButtons).forEach((editButton) => {
      editButton.addEventListener('click', async () => {
        document.location.hash = `/order/${editButton.id}`;
      });
    });
  },
  render: async () => {
    const ordersResult = await getOrders();
    const orders = Array.isArray(ordersResult) ? ordersResult : [];
    const ordersError = ordersResult.error;
    return `
    <div class="wrap">
    ${DashboardMenu.render({ selected: 'orderList' })}
    <div class="main">
      <div class="order-list">
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>DATE</th>
              <th>TOTAL</th>
              <th>USER</th>
              <th>PAID AT</th>
              <th>DELIVERED AT</th>
              <th class="tr-action">ACTION</th>
            </tr>
          </thead>
          <tbody>
            ${orders
              .map(
                (order) => `
            <tr>
              <td>${order._id}</td>
              <td>${order.createdAt}</td>
              <td>${order.totalPrice}</td>
              <td>${order.user?.name || 'Unknown'}</td>
              <td>${order.paidAt || 'No'}</td>
              <td>${order.deliveredAt || 'No'}</td>
              <td>
              <button id="${order._id}" class="edit-button">Edit</button>
              <button id="${order._id}" class="delete-button">Delete</button>
              </td>
            </tr>
            `
              )
              .join('\n')}
          </tbody>
        </table>
      </div>
      ${ordersError ? `<div class="message-error">${ordersError}</div>` : ''}
    </div>
  </div>
    `;
  },
};
export default OrderList;
