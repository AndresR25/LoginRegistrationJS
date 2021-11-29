const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    
    first_name: {
        type:String,
        minlength:2,
        required: true
    },
   last_name:{
        type:String,
        minlength:2,
        required: true
   },
   email:{
        type:String,
        unique:true,
        required: true,
        minlength:2,
        
    },
   password:{
        type:String,
        minlength:5,
        required: true
   }, 

  });


const User = mongoose.model('users', userSchema);

const UserModel={
    createUser:function(newUser){
        return User.create(newUser);
    },
    getUserByEmail:function(email){
        return User.findOne({email});
    },
    getUsers:function(){
        return User.find();
    }
}


module.exports={UserModel};