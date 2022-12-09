/*-----------------------toggle switcher-------------------------------------------*/
const styleSwitcherToggler = document.querySelector(".style-switcher-taggler");
styleSwitcherToggler.addEventListener("click", () => {
    document.querySelector(".style-switcher").classList.toggle("open");
});

window.addEventListener('scroll', () => {
    if(document.querySelector('.style-switcher').classList.contains('open')){
        document.querySelector('.style-switcher').classList.remove('open');
    }
});