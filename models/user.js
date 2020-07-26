var mongoose = require('mongoose');
var UserSchema = mongoose.Schema({
    name: {type:String,required:true},
    email : {type:String,required:true},
    username : {type:String,required:true},
    gender : {type:String,required:true},
    password : {type:String,required:true},
    phone    : {type:String,required:true},
    admin : {type:Number}
});

var options = {
    errorMessages: {
     IncorrectPasswordError: 'Password is incorrect',
     IncorrectUsernameError: 'Username is incorrect',
    }
   };

var User= module.exports = mongoose.model('User', UserSchema);