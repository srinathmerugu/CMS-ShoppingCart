var mongoose = require('mongoose');
var ContactSchema = mongoose.Schema({
    
    username : {type:String,required:true,ref: 'User'},
    email : {type:String,required:true,ref: 'User'},
    textarea: {type:String,required:true,ref: 'User'}
});

var Contact= module.exports = mongoose.model('Contact', ContactSchema);
