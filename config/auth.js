exports.isUser = function(req,res,next){
    if(req.isAuthenticated()){
        next();
    }
    else{
        req.flash('danger','Please Login');
        req.session.oldUrl = req.url;
        res.redirect('/users/login');
    }
}

exports.isAdmin = function(req,res,next){
    if(req.isAuthenticated() && res.locals.user.admin ==1){
        next();
    }
    else{
        req.flash('danger','Please Login As Admin');
        res.redirect('/users/login');
    }
}

exports.notLoggedIn = function(req,res,next) {
    if(!req.isAuthenticated()){
        return next();
    }
    res.redirect('/');
}