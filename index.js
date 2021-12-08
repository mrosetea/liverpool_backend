const express = require('express');
const app = express();
const controllers = require('./controller');
const { DB_URL } = require('./config/constants');
const mongoose = require('mongoose');
const JwtStrategy = require('passport-jwt').Strategy;
const LocalStrategy = require('passport-local').Strategy;
const ExtractJwt = require('passport-jwt').ExtractJwt;
const passport = require("passport");
const bcrypt = require('bcrypt');
const User = require('./model/user.model');
const {JWT_SECRET} = require('./config/constants');
const cors = require('cors');
const fileParser = require('express-multipart-file-parser')

app.use(cors());
app.use(fileParser);

mongoose.connect(DB_URL);

passport.use(new LocalStrategy({
    usernameField: "username",
    passwordField: "password",
    session: false
}, async (username, password, done)=>{
    const user = await User.findOne({
        username,
    })
    if(!user) return done("El usuario no existe.", null);
    else if(!bcrypt.compareSync(password, user.password)) return done("Contraseña inválida.", null);
    else return done(null, user);
}));

let opts = {}
opts.jwtFromRequest = ExtractJwt.fromAuthHeaderAsBearerToken();
opts.secretOrKey = JWT_SECRET;

passport.use(new JwtStrategy(opts, async (jwt_payload, done)=>{
    try {
        const user = await User.findById(jwt_payload.sub);
        done(null, user);
    } catch (e) {
        done(e, false);
    }
}));

app.use(passport.initialize());

app.use(express.json());
app.use(controllers);

app.listen(8080, () => {
    console.log('App running in: ', 8080);
});