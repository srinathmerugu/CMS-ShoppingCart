var express = require('express');
var router = express.Router();

var Product         = require('../models/products');
var Category        = require('../models/category');
var Order   = require('../models/order');
const nodemailer            = require("nodemailer");

var auth            = require('../config/auth');
var isUser          = auth.isUser;

/* GET add product. */
router.get('/add/:product', function (req, res) {
    var slug = req.params.product;

    Product.findOne({
        slug: slug
    }, function (err, p) {
        if (err) {
            return console.log(err.msg);
        }

        if (typeof req.session.cart == "undefined") {
            req.session.cart = [];
            req.session.cart.push({
                title: slug,
                qty: 1,
                price: parseFloat(p.price).toFixed(2),
                image: '/images/product_imgs/' + p._id + '/' + p.image
            });
        } else {
            var cart = req.session.cart;
            var newItem = true;
            for (var i = 0; i < cart.length; i++) {
                if (cart[i].title == slug) {
                    cart[i].qty++;
                    newItem = false;
                    break;
                }
            }
            if (newItem) {
                cart.push({
                    title: slug,
                    qty: 1,
                    price: parseFloat(p.price).toFixed(2),
                    image: '/images/product_imgs/' + p._id + '/' + p.image
                });

            }
        }
        //console.log(req.session.cart);
        req.flash("success", slug + " Added To Cart ");
        res.redirect('back');

    });
});

/* GET checkout page. */
router.get('/checkout',isUser, function (req, res) {
    if (req.session.cart && req.session.cart.length == 0) {
        delete req.session.cart;
        res.redirect('/cart/checkout');
    } else {
        res.render('checkout', {
            title: 'Checkout',
            cart: req.session.cart
        });
    }
});

/* GET update product. */
router.get('/update/:product', function (req, res) {
    var slug = req.params.product;
    var cart = req.session.cart;
    var action = req.query.action;
    for (var i = 0; i < cart.length; i++) {
        if (cart[i].title == slug) {
            switch (action) {
                case "add":
                    cart[i].qty++;
                    break;
                case "subtract":
                    cart[i].qty--;
                    if (cart[i].qty < 1) cart.splice(i, 1);
                    break;
                case "remove":
                    cart.splice(i, 1);
                    if (cart.length == 0)
                        delete req.session.cart;
                    break;
                default:
                    console.log("Update Failed");
                    break;

            }
            break;
        }
    }
    req.flash("success", 'Cart Updated');
    res.redirect('/cart/checkout');
});


//buy now

router.get('/buynow',isUser, function (req, res) {

    var cart = req.session.cart;
    var total = 0
    var sub = (cart[0].qty * cart[0].price)
    var total=+sub;
    //var slug = req.params.product;
    var order = new Order({
        user : req.user,
        username : req.user.username,
        email    : req.user.email,
        phone    : req.user.phone,
        cart     : cart

    });
    order.save(function(err, result){
        delete req.session.cart;
        req.flash('success', 'Order Placed');
        res.redirect('/');
       
        
    });
    var transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
               user: "yelpcamp.srinathmerugu@gmail.com",
               pass: "yelpcamp777"
           }
       });
       const mailOptions = {
         from: "yelpcamp.srinathmerugu@gmail.com", // sender address
         to: req.user.email, // list of receivers
         subject: 'Order Placed Successfully',
           text:"Hello " + req.user.username+ "," + '\n' + "Thanks for shopping with us" + '\n' + 
            "We really appreciate you coming in today. Have a great day :)" + '\n' +
            "Your Order-id: #" +order._id+   '\n' +
            "Product: "+cart[0].title+   '\n' +
            "Quantity: "+cart[0].qty+  '\n' +
            "Price x 1: "+cart[0].price+   '\n' +
            "Total: "+total+   '\n' +
            "Regards" + '\n' +
            " TEAM SnCart" 
            
            
       };
       
       transporter.sendMail(mailOptions, (err, data) => {
           if (err) {
               return console.log('Error occurs');
           }
           return  console.log('Email sent!!!');
       });
   

});


module.exports = router;