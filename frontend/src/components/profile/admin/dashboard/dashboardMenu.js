const DashboardMenu = {
    render: (cons)=>{
        return `
        <!--side bar-->
        <aside class="sidebar">
            <nav class="sidebar-menu">
                <ul>
                    <li><a href="/#/dashboard" class="${cons.selected === 'dashboard' ? 'selected':''}">DASHBOARD</a></li>
                    <li><a href="/#/chicken" class="${cons.selected === 'chicken' ? 'selected':''}">CHICKEN</a></li>
                    <li><a href="/#/profile" class="${cons.selected === 'profile' ? 'selected': ''}">SETTING</a></li>
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