const passport = require('passport');
const User = require('../model/user.model');

const isAuthenticated = (req,res,next) => {
    passport.authenticate('jwt', {session: false}, (err, user, info)=>{
        if(info){
            return res.status(401).json({
                data: null,
                success: false,
                error: info
            });
        }
        if (err) {
            return res.status(401).json({
                data: null,
                success: false,
                error: err
            });
        }
        if (!user) {
            return res.status(401).json({
                data: null,
                success: false,
                error: "No user"
            });
        }

        req.user = user;
        next();
    })(req, res, next);
}

module.exports = isAuthenticated;