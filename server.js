
const express = require('express');
const mongoose = require('mongoose');
const app = express();
const path = require('path');
const port = 8000;
const bodyParser = require('body-parser');
const { response } = require('express');
const { UserModel } = require('./models/userModel');
const bcrypt=require('bcrypt');
const flash=require('express-flash');
app.use(flash());
const session = require('express-session');
app.use(bodyParser.urlencoded({ extended: true }));
app.use(session({
    secret: 'keyboard cat',
    resave: false,
    saveUninitialized: true,
    cookie: { maxAge: 60000 }
  }))

mongoose.connect('mongodb://localhost/loginR');
app.set('views'+__dirname+ '/views');

app.set('view engine', 'ejs');

app.get('/',function(request,response){
    response.render('login');
});

app.get('/home',function(request,response){
    if(request.session.email===undefined){
        response.redirect('/');
    }
    else{
        UserModel
            .getUsers()
            .then(data=>{
                let currentUser={
                    first_name: request.session.first_name,
                    last_name: request.session.last_name,
                    email:request.session.email
                }
                response.render('home',{currentUser});
            });
    }
});

app.post('/newUser',function(request,response){
    const first_name= request.body.first_name;
    const last_name= request.body.last_name;
    const password= request.body.password;
    const email= request.body.email;
    bcrypt.hash(password,10)
        .then(encryptedPassword=>{
            const newUser={
                first_name,
                last_name,
                email,
                password:encryptedPassword 
            };
            console.log(newUser);
            UserModel
                
                .createUser(newUser)
                .then(result=>{
                    console.log(result);
                    request.session.first_name=first_name;
                    request.session.last_name=last_name;
                    request.session.email=email;
                    response.redirect('/home');
                })
                .catch(err=>{
                    request.flash('registration',err.message)
                    response.redirect('/');
                })
        });   
});

app.post('/login',function(request,response){
    let email=request.body.email_login;
    let password=request.body.password_login;
    UserModel
        .getUserByEmail(email)
        .then(result =>{
            console.log(result);
            if(result===null){
                throw new Error("That user doesn't exist");
            }

            bcrypt.compare(password,result.password)
                .then(flag=>{
                    if(!flag){
                        throw new Error("Wrong credentials")
                    }
                    request.session.first_name=result.first_name;
                    request.session.last_name=result.last_name;
                    request.session.email=result.email;
                    response.redirect('/home');

                })
                .catch(error=>{
                    request.flash('login',error.message);
                    response.redirect('/');
                });
        })
        .catch(error=>{
            request.flash('login',error.message);
            response.redirect('/');
        });
});

app.listen(port);


