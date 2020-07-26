var express       = require('express');
var router        = express.Router();
var Page          = require('../models/page');

var auth            = require('../config/auth');
var isAdmin          = auth.isAdmin;


//GET pages index

router.get('/',isAdmin, function(req, res, next) {
  Page.find({}).sort({sorting: 1}).exec(function(err,pages){
    res.render('admin/pages', {
      pages : pages
    });
  });
});


//GET add page

router.get('/add-page',isAdmin, function(req, res, next) {

  var title= "";
  var slug = "";
  var content= "";
  
  res.render('admin/add_page', {
    title : title,
    slug : slug,
    content : content
  });


});

//POST add page

router.post('/add-page', function(req, res, next) {
  req.checkBody('title' , 'Title Cannot Be Empty').notEmpty();
  req.checkBody('content' , 'Content Cannot Be Empty').notEmpty();

  var title = req.body.title;
  var slug = req.body.slug.replace(/\s+/g, '-').toLowerCase();
  if(slug == ""){
    slug= title.replace(/\s+/g, '-').toLowerCase();
  }
  var content = req.body.content;
  var errors = req.validationErrors();
  if(errors){
    console.log(errors.msg);
    res.render('admin/add_page', {
      errors:errors,
      title : title,
      slug : slug,
      content : content
    });
  }
    else{
      Page.findOne({slug:slug}, function(err,page){
          if(page){
            req.flash('warning','Page ' +slug+ ' exists, Please choose Another Page');
            res.render('admin/add_page', {
              title : title,
              slug : slug,
              content : content
            });
          }
          else{
            var page = new Page(
              {
                title:title,
                slug:slug,
                content:content,
                sorting:100
              });
            page.save(function(err){
              if(err) 
              {
                return console.log(err);
              }
              Page.find({}).sort({sorting: 1}).exec(function (err, pages) {
                if (err) {
                    console.log(err);
                } else {
                    req.app.locals.pages = pages;
                }
            });
              req.flash('success', "Page Added");
              res.redirect('/admin/pages');
            });
          }
      });
    }
  });

  //Sort Pages Function

  function sortPages(ids, callback) {
    var count = 0;
  for(var i = 0; i < ids.length ; i++){
    var id = ids[i];
    count++;

    (function(count){
      
      Page.findById(id,function (err,page){
       
        if(err){
          console.log(err);
        }
        else{
           page.sorting = count;  //This is the line that is showing error 
           page.save(function(err){
            if(err)
              return console.log(err);
            ++count;
            if(count >= ids.length){
              callback();
              }
        });
        }  
      });
    }) (count);
  }
  }


//POST reorder pages

router.post('/reorder-pages', function(req, res) {

  var ids= req.body['id[]'];

  sortPages(ids,function(){

    Page.find({}).sort({sorting: 1}).exec(function (err, pages) {
      if (err) {
          console.log(err);
      } else {
          req.app.locals.pages = pages;
      }
  });

  });
    
});


//GET edit page

router.get('/edit-page/:id',isAdmin, function(req, res) {

  Page.findById(req.params.id, function(err,page){
    if(err){
      return console.log(err);
    }
    res.render('admin/edit_page', {
      title     : page.title,
      slug      : page.slug,
      content   : page.content,
      id        : page._id
    });
  
  });
  
 

});



//POST update page

router.post('/edit-page/:id', function(req, res, next) {
  req.checkBody('title' , 'Title Cannot Be Empty').notEmpty();
  req.checkBody('content' , 'Content Cannot Be Empty').notEmpty();

  var title = req.body.title;
  var slug = req.body.slug.replace(/\s+/g, '-').toLowerCase();
  if(slug == ""){
    slug= title.replace(/\s+/g, '-').toLowerCase();
  }
  var content = req.body.content;
  var id      = req.params.id;

  var errors = req.validationErrors();
  if(errors){
    console.log(errors.msg);
    res.render('admin/edit_page', {
      errors:errors,
      title   : title,
      slug    : slug,
      content : content,
      id      : id
    });
  }
    else{
      Page.findOne({slug:slug, _id:{'$ne' :id}}, function(err,page){
          if(page){
            req.flash('warning','Page ' +slug+ ' exists, Please choose Another Page');
            res.render('admin/edit_page', {
              title    : title,
              slug    : slug,
              content : content,
              id      : id
            });
          }
          else{
            Page.findById(id, function(err, page){
              if(err){
                return console.log(err.msg);
              }
              page.title=title;
              page.slug=slug;
              page.content=content;

              page.save(function(err){
                if(err) 
                {
                  return console.log(err);
                }

                Page.find({}).sort({sorting: 1}).exec(function (err, pages) {
                  if (err) {
                      console.log(err);
                  } else {
                      req.app.locals.pages = pages;
                  }
              });
                req.flash('success', "Page Updated");
                res.redirect('/admin/pages/edit-page/'+id);
              });
            });
            
          }
      });
    }
  });


//GET delete page

router.get('/delete-page/:id',isAdmin, function(req, res, next) {
  Page.findByIdAndRemove(req.params.id, function(err){
    if(err){
      return console.log(err.msg);
    }
    Page.find({}).sort({sorting: 1}).exec(function (err, pages) {
      if (err) {
          console.log(err);
      } else {
          req.app.locals.pages = pages;
      }
  });
    req.flash('success', "Page Deleted");
    res.redirect('/admin/pages/');
  });
});


module.exports = router;
