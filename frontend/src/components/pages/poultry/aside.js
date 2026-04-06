//the aside = tabs
//aside.js
/*
Generic Tabs Componets

used by:
-Chicken
-Products
*/

const Aside = {
    
    render: ({ basePath, routes, current }) => {
        return `
            <div class="aside-nav">
                <div class="aside">
                    ${Object.keys(routes).map(route => `
                        <a href="/#/${basePath}/${route}" class="aside-item ${current == route ? 'selected': ''}">${formatLabel(route)}</a>

                    `).join('')}
                </div>
            </div>        
        `;
    }
};

//Convert "medicallogs" -> "Medicallogs"
function formatLabel(text){
    return text.charAt(0).toUpperCase() + text.slice(1);
}

/*const Aside = {
    render: (sides)=>{
        return `   
        <!-- Aside Nav -->
        <div class="aside-nav">
           <div class="aside">
                <div class="aside-item ${sides.selected ==='breeds'? 'selected': ''}"><a href="/#/chicken/breeds">Breeds</a></div> 
                <div class="aside-item ${sides.selected ==='medicallogs'? 'selected': ''}"><a href="/#/chicken/medicallogs">Medical logs</a></div>
            </div>
        </div>         
        `;
    }
};

export default Aside;
*/