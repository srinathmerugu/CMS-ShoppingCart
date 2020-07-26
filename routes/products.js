var express         = require('express');
var router          = express.Router();
var fs              = require('fs-extra');
var Product         = require('../models/products');
var Category        = require('../models/category');
var auth            = require('../config/auth');
var isUser          = auth.isUser;

/* GET all products page. */
router.get('/', function(req, res) {
  var noMatch = null;
  var search = req.query.search;
  if(req.query.search) {
      const regex = new RegExp(escapeRegex(req.query.search), 'gi');
  Product.find({$or: [{slug: regex}, {title: regex}, {category: regex}]}, function(err,products){
    if(err){
      return console.log(err.msg);
    }  else {
      if(products.length < 1) {
          noMatch = "Sorry, no results found for " +search+ " please try again.";
      }
  
        res.render('all_products',
       { title      : "Products",
         products   :  products,
         noMatch    : noMatch,
         search     : search
       });
    }
    

  });
 } else {
    // Get all campgrounds from DB
    Product.find({}, function(err, products){
       if(err){
           console.log(err);
       } else {
        res.render('all_products',
        { title      : "Products",
          products   :  products,
          noMatch    : noMatch
        });
       }
    });
}
});

/* GET products by category */
router.get('/:category', function(req, res) {

  var categorySlug = req.params.category;
  Category.findOne({slug : categorySlug},function(err,c){
    Product.find({category:categorySlug} , function(err,products){
      if(err){
        return console.log(err.msg);
      }
    
          res.render('cat_products',
         { title      : c.title,
           products   :  products
         }
        );
      
  
    });
  });
  
});

//home

router.get('/:category', function(req, res) {

  var categorySlug = req.params.category;
  Category.findOne({slug : categorySlug},function(err,c){
    Product.find({category:categorySlug} , function(err,products){
      if(err){
        return console.log(err.msg);
      }
    
          res.render('home',
         { title      : c.title,
           products   :  products
         }
        );
      
  
    });
  });
  
});


/* GET products details */
router.get('/:category/:product', function(req, res) {

 var galleryImages = null;
 var loggedIn = (req.isAuthenticated()) ? true :false

 Product.findOne({slug : req.params.product},function(err,product){
      if(err){
        console.log(err.msg);
      }
      else{
        var galleryDir = 'public/images/product_imgs/'+product._id+'/gallery';
        fs.readdir(galleryDir, function(err, files){
          if(err){
            console.log(err.msg);
          }
          else{
            galleryImages = files; 
            res.render('product',{
              title : product.title,
              p:product,
              galleryImages : galleryImages,
              loggedIn : loggedIn
            });
          }
        });


      }
 });
  
});


function escapeRegex(text) {
  return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
};




module.exports = router;
