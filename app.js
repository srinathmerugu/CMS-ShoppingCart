var createError       = require('http-errors');
var express           = require('express');
var path              = require('path');
var bodyParser = require('body-parser');
var cookieParser      = require('cookie-parser');
var logger            = require('morgan');
var mongoose          = require('mongoose');
var indexRouter       = require('./routes/index');
var routes            = require('./routes/index');
var products            = require('./routes/products');
var cart            = require('./routes/cart');
var users            = require('./routes/users');
var adminRouter       = require('./routes/admin_page');
var adminCategories   = require('./routes/admin_categories');
var adminProducts   = require('./routes/admin_products');
var methodOverride        = require("method-override");

var config            = require('./config/database');
var app               = express();
var bodyParser        = require('body-parser');
var session           = require('express-session');
var validator         = require('express-validator');
var fileUpload        = require('express-fileupload');
var passport          = require('passport');



let url = config.database;

mongoose.connect(url, 
  {   useNewUrlParser: true,
      useUnifiedTopology: true ,
      useFindAndModify : false ,
      useCreateIndex: true
  }).then(() => {
      console.log("db connected");
  }).catch(err =>{
      console.log("error",err.message);
  });
  

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({ extended: true }))
app.use(methodOverride('_method'))

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

//set global error variables
app.locals.errors = null;




app.use(validator({
  customValidators : {
    isImage : function  (value, filename){
      var extension = (path.extname(filename)).toLowerCase();
      switch (extension) {

        case '.jpg':
          return '.jpg';
          case '.png':
          return '.png';
          case '.jpeg':
          return '.jpeg';
          case '':
          return '.jpg';
          default:
            return false;
      }
    }
}
}));


// Get Page Model
var Page = require('./models/page');

// Get all pages to pass to header.ejs
Page.find({}).sort({sorting: 1}).exec(function (err, pages) {
    if (err) {
        console.log(err);
    } else {
        app.locals.pages = pages;
    }
});

// Get Category Model
var Category= require('./models/category');

// Get all categories to pass to header.ejs
Category.find(function (err, categories) {
    if (err) {
        console.log(err);
    } else {
        app.locals.categories = categories;
    }
});

//express fileUpload middleware
app.use(fileUpload());


//body-parser
app.use(bodyParser.urlencoded({extended:true}));
app.use(bodyParser.json());

//session
app.use(session({
  secret: 'doraemon',
  resave: false, 
  saveUninitialized: false,
  //store: new MongoStore({ mongooseConnection: mongoose.connection }),
  //cookie: { secure:true }
}));


//Express Messages
app.use(require('connect-flash')());
app.use(function (req, res, next) {
  res.locals.messages = require('express-messages')(req, res);
  next();
});

// Passport Config
require('./config/passport')(passport);

// Passport Middleware
app.use(passport.initialize());
app.use(passport.session());

//get star
app.get('*', function(req,res,next){
    res.locals.cart = req.session.cart;
    res.locals.user = req.user || null;
    next();
});


//ROUTES

app.use('/admin/pages', adminRouter);
app.use('/admin/categories', adminCategories);
app.use('/admin/products', adminProducts);
app.use('/products', products);
app.use('/cart', cart);
app.use('/users', users);
app.use('/', routes);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

app.listen(8800, function(){
  console.log("server running");
})
module.exports = app;
