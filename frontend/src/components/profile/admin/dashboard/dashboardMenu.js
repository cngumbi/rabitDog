const DashboardMenu = {
    render: (cons)=>{
        return `
        <!--side bar-->
        <aside class="sidebar">
            <nav class="sidebar-menu">
                <ul>
                    <li><a href="/#/dashboard" class="${cons.selected === 'dashboard' ? 'selected':''}">DASHBOARD</a></li>
                    <li><a href="#" class="${cons.selected === 'chicken' ? 'selected':''}">Parties</a></li>
                    <li><a href="#" class="${cons.selected === 'profile' ? 'selected': ''}">Product Manager</a></li>
                    <li><a href="#" class="${cons.selected === 'profile' ? 'selected': ''}">Sales</a></li>
                    <li><a href="#" class="${cons.selected === 'profile' ? 'selected': ''}">Purchases</a></li>
                    <li><a href="#" class="${cons.selected === 'profile' ? 'selected': ''}">Stock Transfers</a></li>
                    <li><a href="#" class="${cons.selected === 'profile' ? 'selected': ''}">POS</a></li>
                    <li><a href="#" class="${cons.selected === 'profile' ? 'selected': ''}">Cash & Bank</a></li>
                    <li><a href="#" class="${cons.selected === 'profile' ? 'selected': ''}">Expenses</a></li>
                    <li><a href="#" class="${cons.selected === 'profile' ? 'selected': ''}">Health Records</a></li>
                    <li><a href="#" class="${cons.selected === 'profile' ? 'selected': ''}">Sales Reports</a></li>
                    <li><a href="#" class="${cons.selected === 'profile' ? 'selected': ''}">Online Orders</a></li>
                    <li><a href="#" class="${cons.selected === 'profile' ? 'selected': ''}">STAFF MEMBERS</a></li>
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