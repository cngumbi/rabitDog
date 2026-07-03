const DashboardMenu = {
    render: (cons)=>{
        return `
        <!--side bar-->
        <aside class="sidebar">
            <nav class="sidebar-menu">
                <ul>
                    <li><a href="/#/dashboard" class="${cons.selected === 'dashboard' ? 'selected':''}">DASHBOARD</a></li>
                    <li><a href="/#/parties" class="${cons.selected === 'parties' ? 'selected':''}">Parties</a></li>
                    <!--<li><a href="/#/listproduct" class="${cons.selected === 'products' ? 'selected': ''}">Product Manager</a></li>
                    <li><a href="/#/saleslist" class="${cons.selected === 'salesList' ? 'selected': ''}">Sales</a></li>
                    <li><a href="/#/purchases" class="${cons.selected === 'purchases' ? 'selected': ''}">Purchases</a></li>-->
                    <li><a href="/#/transfers" class="${cons.selected === 'transfers' ? 'selected': ''}">Stock Transfers</a></li>
                    <li><a href="#" class="${cons.selected === 'profile' ? 'selected': ''}">POS</a></li>
                    <li><a href="/#/cashbank" class="${cons.selected === 'cashbank' ? 'selected': ''}">Cash & Bank</a></li>                    <li><a href="/#/accounts" class="${cons.selected === 'accounts' ? 'selected':''}">Chart of Accounts</a></li>                    <!--<li><a href="/#/expenses" class="${cons.selected === 'expenses' ? 'selected': ''}">Expenses</a></li>-->
                    <li><a href="/#/medicallogs" class="${cons.selected === 'medicallogs' ? 'selected': ''}">Health Records</a></li>
                    <li><a href="/#/livestock" class="${cons.selected === 'livestock' ? 'selected': ''}">Livestock Management</a></li>
                    <!--<li><a href="#" class="${cons.selected === 'profile' ? 'selected': ''}">Sales Reports</a></li>
                    <li><a href="/#/orderlist" class="${cons.selected === 'onlineOrders' ? 'selected': ''}">Online Orders</a></li>
                    <li><a href="#" class="${cons.selected === 'profile' ? 'selected': ''}">STAFF MEMBERS</a></li>-->
                </ul>
            </nav>
            <div class="sidebar-footer">
                <p> &#169;<b>Softcraze</b> Corporation</p>
            </div>      
        </aside>
        `;
    }
};

export default DashboardMenu;