const DashboardMenu = {
    render: (cons)=>{
        return `
        <!--Sidebar-->
        <aside class="sidebar">
            <!--Main Navigation-->
            <nav><div class="nav-item ${cons.selected === 'dashboard' ? 'selected':''}"><a href="/#/dashboard">Dashboard</a></div>
                <h3>Sales Dispath</h3>
                <div class="nav-item ${cons.selected === 'dashboard' ? 'selected':''}"><a href="/#/dashboard">Paid(Sales Dispatch)</a></div>
                <div class="nav-item ${cons.selected === 'products' ? 'selected':''}"><a href="/#/listproduct">My Dispatch Subs</a></div>
                <h3>Subscribers</h3>
                <div class="nav-item ${cons.selected === 'orderlist'?'selected':''}"><a href="/#/orderlist">New Subscriber</a></div>
                <div class="nav-item ${cons.selected === 'createproducts'?'selected':''}"><a href="/#/createproduct">All Subscriber</a></div>
                <div class="nav-item ${cons.selected === 'dashboard' ? 'selected':''}"><a href="/#/dashboard">Pendiing Approval</a></div>
                <div class="nav-item ${cons.selected === 'products' ? 'selected':''}"><a href="/#/listproduct">Declined</a></div>
                <div class="nav-item ${cons.selected === 'products' ? 'selected':''}"><a href="/#/listproduct">Registered pendin Pay</a></div>
                <div class="nav-item ${cons.selected === 'products' ? 'selected':''}"><a href="/#/listproduct">Paid</a></div>
                <div class="nav-item ${cons.selected === 'products' ? 'selected':''}"><a href="/#/listproduct">Pending Installation</a></div>
                <div class="nav-item ${cons.selected === 'products' ? 'selected':''}"><a href="/#/listproduct">Closed</a></div>
                <h3>Reports</h3>
                <div class="nav-item ${cons.selected === 'orderlist'?'selected':''}"><a href="/#/orderlist">Subscriber Report</a></div>
                <div class="nav-item ${cons.selected === 'createproducts'?'selected':''}"><a href="/#/createproduct">Payment Report</a></div>
                <div class="nav-item ${cons.selected === 'createproducts'?'selected':''}"><a href="/#/createproduct">Terms & Conditions</a></div>
                <h6> copy rigtht Softcraze Corporation</6>
                
            </nav>
        </div>
        `;
    }
};

export default DashboardMenu;