export const setContactInfo = ({
    _id = '',
    name = '',
    email = '',
    number = '',
    subject = '',
    message = ''
})=>{
    localStorage.setItem(
        'contactInfo',
        JSON.stringify({
            _id,
            name,
            email,
            number,
            subject,
            message
        })
    );
};

export const getContactInfo = () => {
    return localStorage.getItem('contactInfo') ? 
        JSON.parse(localStorage.getItem('contactInfo')) :
        {name:'', email:'', number:'', subject:'', message:''};
}