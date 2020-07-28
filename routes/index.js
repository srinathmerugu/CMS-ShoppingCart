var express = require('express');
var router = express.Router();
var nodemailer            = require("nodemailer");
var Page          = require('../models/page');
var User = require('../models/user');
var Contact = require('../models/contact');
var Product         = require('../models/products');

var auth            = require('../config/auth');
var isUser          = auth.isUser;

var auth            = require('../config/auth');
var isAdmin          = auth.isAdmin;

router.get('/contact', function(req, res, next) {
  res.render('contactus');
});


router.get('/', function(req, res) {

  Product.find( function(err,products){
    if(err){
      return console.log(err.msg);
    }
  
        res.render('home',
       { title      : "Products",
         products   :  products
       }
      );
    

  });
});
/* GET home page. */
router.get('/', function(req, res, next) {

  Page.findOne({slug:'home'}, function(err,page){
    if(err){
      return console.log(err.msg);
    }
  
        res.render('index',
       { title     : page.title,
         content   : page.content
       }
      );
    

  });
});


//GET A PAGE

router.get('/:slug', function(req, res, next) {

  var slug = req.params.slug;

  Page.findOne({slug:slug}, function(err,page){
    if(err){
      return console.log(err.msg);
    }
    if(!page){
      res.redirect('/');
    }
    else{
      res.render('index',
       { title     : page.title,
         content   : page.content
       }
      );
    }

  });
  
});


//POST CONTACT
router.post('/contact',isUser, function(req,res){

    Contact.create(req.body.contact,function(err,contact){
      if(err) {
        req.flash("warning", "Something Went Wrong");
        console.log(err)
        return res.redirect("/contact");
      }
              req.flash('success', "Thankyou For Writing To Us");
              res.redirect('/contact');

    
    var transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
             user: "yelpcamp.srinathmerugu@gmail.com",
             pass: "yelpcamp777"
         }
     });
     const mailOptions = {
       from: "yelpcamp.srinathmerugu@gmail.com", // sender address
       to: "yelpcamp.srinathmerugu@gmail.com", // list of receivers
       subject: req.body.contact.username+ "'s Feedback From SnCart",
         text:"Hello You Have An Feedback From" + '\n' +
         "User: " + req.body.contact.username+ '\n' +
         "Email: " + req.body.contact.email+ '\n' +
         "Feedback: " +req.body.contact.textarea+ '\n' 
          
          
     };
     
     transporter.sendMail(mailOptions, (err, data) => {
         if (err) {
             return console.log('Error occurs');
         }
         return  console.log('Email sent!!!');
     });
    });
});

//contact feedbacks
router.get('/contact/feedbacks', isAdmin, function(req, res) {
  
      Contact.find({},function(err,info){
        if(err){
          req.flash("warning", err.message);
          return res.redirect("back");
      }
      res.render("contactus-info", {info:info});
      });
      
    
});



module.exports = router;
