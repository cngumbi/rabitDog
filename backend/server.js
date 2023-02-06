const express = require('express');

const app = express();

const PORT = process.env.PORT || 5000;

//middleware
app.use(express.static('public'));
app.use(express.json());

app.get('/', (req, res)=>{
    res.sendFile(__dirname + '/public/src/index.html');
});

app.post('/',(req, res)=>{
    console.log(req.body);
    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: 'cngumbi35@gmail.com',
            pass: '0720543605'
        }
    })
    const mailOptions = {
        from: req.body.email,
        to: 'cngumbi35@gmail.com',
        subject: `Message from ${req.body.email}: ${req.body.subject}`,
        text: req.body.message
    }
    transporter.sendMail(mailOptions, (error, info)=>{
        if(error){
            console.log(error);
            res.send('error');
        }else{
            console.log('Email sent: ' + info.response);
            res.send('Seccess');
        }
    })
})

app.listen(PORT, ()=>{
    console.log(`server running on port ${PORT}`);
})