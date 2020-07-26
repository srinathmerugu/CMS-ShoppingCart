var mongoose = require('mongoose');
var Schema = mongoose.Schema ;

var schema = new Schema({
    user: {type: Schema.Types.ObjectId, ref: 'User'},
    username : {type: String, ref: 'User'},
    email : {type: String, ref: 'User'},
    phone : {type: String, ref: 'User'},
    cart: {type: Object, required: true }
    
    
});

var Order = module.exports = mongoose.model('Order', schema);