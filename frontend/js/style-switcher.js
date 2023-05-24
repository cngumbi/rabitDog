/*-----------------------toggle switcher-------------------------------------------*/
const styleSwitcherToggler = document.querySelector('.style-switcher-taggler');
styleSwitcherToggler.addEventListener('click', () => {
    document.querySelector('.style-switcher').classList.toggle('open');
});

window.addEventListener('scroll', () => {
    if(document.querySelector('.style-switcher').classList.contains('open')){
        document.querySelector('.style-switcher').classList.remove('open');
    }
});

/*theme*/
const alternateStyles = document.querySelectorAll('.alternate-style');
function setActiveStyle(theme){
    alternateStyles.forEach((style) => {
        if(theme === style.getAttribute('title'))
        {
            style.removeAttribute('disabled');
        }else{
            style.setAttribute('disable', 'true');
        }
    })
}
//day night
const dayNight = document.querySelector('.day-night');
dayNight.addEventListener('click', ()=>{
    dayNight.querySelector('i').classList.toggle('fa-sun');
    dayNight.querySelector('i').classList.toggle('fa-moon');
    document.body.classList.taggle('dark');
})
window.addEventListener('load', () => {
    if(document.body.classList.contains('dark')){
        dayNight.querySelector('i').classList.add('fa-sun');
    }else{
        dayNight.querySelector('i').classList.add('fa-moon');
    }
})