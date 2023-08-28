const DashboardMenu = {
    render: (cons)=>{
        return `
        <div class="dashboard-menu">
            <ul class="navbar">
                <li class="${cons.selected === 'dashboard'}"><a href="/#/dashboard">Dashboard</a></li>
                <li class="${cons.selected === 'products'}"><a href="/#/listproduct">Product list</a></li>
                <li class="${cons.selected === 'createproducts'}"><a href="/#/createproduct">Create products</a></li>
            </ul>
        </div>
        `;
    }
};

export default DashboardMenu;