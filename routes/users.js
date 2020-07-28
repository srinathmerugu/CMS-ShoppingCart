var express = require('express');
var router = express.Router();
var passport = require('passport');
var bcrypt = require('bcryptjs');
var Order   = require('../models/order');
const nodemailer            = require("nodemailer");

var auth            = require('../config/auth');
var isUser          = auth.isUser;
var isAdmin          = auth.isAdmin;

var User = require('../models/user');




//LOGOUT
router.get('/logout', function(req,res){
    req.logout();
    req.flash("success","Logged Out");
    res.redirect('/');
});


//Saving Orders into Database
router.get('/profile/:id',isUser,  function(req,res,next){
    User.findById(req.params.id, function(err, foundUser) {
        if(err) {
          req.flash("error", "Something went wrong.");
          return res.redirect("/");
        }
    Order.find({user:req.user},function(err,orders){
        if(err){
            req.flash("warning", err.message);
            return res.redirect("/");
        }
        
        res.render('profile', {user:foundUser,orders : orders});
        
    });
});
    
});

//Delte User Account
router.delete("/profile/:id",function(req,res){
    User.findByIdAndRemove(req.params.id,function(err){
     if(err){
         res.redirect("back");
     } 
     else{
       req.flash("success", "Deleted Your Account" );
      return res.redirect("/");
     }
  });
  
  

});

//EDIT USER INFO

router.get("/profile/:id/edit", function(req, res){
    User.findById(req.params.id, function(err,foundUser){
  if (err) {
    req.flash("error", "Something went wrong.");
    return res.redirect("back");
  }
  Order.find({user:req.user},function(err, orders) {
    if (err) {
      req.flash("error", "Something went Wrong!");
      return res.redirect("back");
    }
    res.render("edit", {user: foundUser, orders : orders});
  })
});
});


//UPDATE USER INFO

router.put("/profile/:id",  function(req, res){
    User.findByIdAndUpdate(req.params.id, req.body.user, function(err, updatedUser){
          if(err){
            req.flash("error", err.message);
            res.redirect("back");
          } else {
            req.flash("success", "Successfully Updated!");
            return res.redirect("/users/profile/" + updatedUser._id);
          }
      });
  });


//Get Register
router.get('/register', function (req, res, next) {

    res.render('register', {
        title: "Register"
    });
});

//POST register  

router.post('/register', function (req, res, next) {

    var name = req.body.name;
    var email = req.body.email;
    var username = req.body.username;
    var phone      = req.body.phone;
    var gender      = req.body.gender;
    var password = req.body.password;
    var password2 = req.body.password2;
    
    req.checkBody("name", "You Must Enter A Name").notEmpty();
    req.checkBody("email", "You Must Enter A Email").notEmpty();
    req.checkBody("username", "You Must Enter A Username").notEmpty();
    req.checkBody("phone", "Phone Cannot Be Empty").notEmpty();
    req.checkBody("gender", "Please Choose A Gender").notEmpty();
    req.checkBody("password", "Password Cannot Be Empty").notEmpty();
    req.checkBody("password2", "Passwords Did not Match").equals(password);

    var errors = req.validationErrors();

    if (errors) {
        res.render('register', {
            errors: errors,
            user: null,
            title: "Register"
        });
    } else {
        User.findOne({username: username}, function (err, user) {
            if (err) console.log(errors);
            if (user) {
                req.flash('danger', 'Username exists,Please Choose Another Username');
                res.redirect('/users/register');
            } else {
                var user = new User({
                    name: name,
                    email: email,
                    username: username,
                    phone  : phone,
                    gender : gender,
                    password: password,
                    admin: 0
                });

                bcrypt.genSalt(10, function (err, salt) {
                    bcrypt.hash(user.password, salt, function (err, hash) {
                        if (err) console.log(errors);
                        user.password = hash;
                        user.save(function (err) {
                            if (err) {
                                console.log(errors);
                            } else {
                                req.flash("success", "Please Login " + user.username );
                                res.redirect('/users/login');
                            }

                        });
                    });
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
                     to: req.body.email, // list of receivers
                     subject: 'Welcome To SnCart',
                       text:"Hello " + req.body.username+ "," + '\n' + "Welcome To SnCart!" + '\n' + 
                        "We really appreciate you coming in today. Have a great day :)" + '\n' +
                        " TEAM SnCart"
                        
                   };
                   
                   transporter.sendMail(mailOptions, (err, data) => {
                       if (err) {
                           return console.log('Error occurs');
                       }
                       return  console.log('Email sent!!!');
                   });
        
            }

        });
    }

      
    
});


//Get Login

router.get('/login', function (req, res, next) {

    if(res.locals.user) 
    {res.redirect("/");}
    else {
    res.render('login', {
        title: "Login"
    });
}
});

//POST Login

router.post('/login', function (req, res, next) {

    passport.authenticate("local", function(err, user, info) {
        if (err) { 
            req.flash("wdanger", err.message);
            return res.redirect("/users/login"); 
        }
        // User is set to false if auth fails.
        if (!user) { 
            req.flash("danger", info.message); 
            return res.redirect("/users/login"); 
        }
        // Establish a session manually with req.logIn
        req.logIn(user, function(err) {
            if (err) { 
                req.flash("danger", err.message);
                res.redirect("/users/login");
            }
            
            // Login success! Add custom success flash message.
            req.flash("success", "Welcome back " + user.username );
            res.redirect("/");
          
        });
    })(req, res, next);


    
});

//ADMIN PROFILE


router.get("/profile/:id/admin", isAdmin, function(req, res){
    Order.find({},function(err, allOrders) {
      if (err) {
          req.flash("error", err.message);
          res.redirect("back");
      } else {
        User.find({},function(err, allUsers){
          if (err) {
              req.flash("error", err.message);
              res.redirect("back");
            } else {
            return res.render("admin/admincontrolpanel", {orders: allOrders, users: allUsers});
          }
        });
      }
      
    });
  });





module.exports = router;