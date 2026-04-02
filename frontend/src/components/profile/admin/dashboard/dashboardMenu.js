const DashboardMenu = {
    render: (cons)=>{
        return `
        <!--Sidebar-->
        <aside class="sidebar">
            <!--Main Navigation-->
            <nav>
                <div class="nav-item ${cons.selected === 'dashboard' ? 'selected':''}"><a href="/#/dashboard">DASHBOARD</a></div>
                <h3>POULTRY</h3>
                <div class="nav-item ${cons.selected === 'chicken' ? 'selected':''}"><a href="/#/chicken">Chicken</a></div>
                <div class="setting ${cons.selected === 'profile' ? 'selected': ''}"><a href="/#/profile">Setting</a></div>
                <h6> copy rigtht &#169; Softcraze Corporation</6>   
            </nav>
        </div>
        `;
    }
};

export default DashboardMenu;