var jwtSecret = 'your_jwt_secret';
var jwt = require ('jsonwebtoken');
const passport = require('passport');
require('./passport');

function generateJWTToken(user){
    return jwt.sign(user, jwtSecret,{
        subject:user.Username,   /* username for encoding in the JWT */
        expiresIn: '7d',   /* token expiration */
        algorithm: 'HS256'  /* algorithm used to “sign” or encode the values of the JWT */ 
    });
}

// Post login-------------------
module.exports = (router) => {
    router.post('/login', (req, res) => {
        passport.authenticate('local', { session : false}, (error, user, info) => {
            if (error || !user) {
                return res.status(400).json({
                    message: 'Something is not right',
                    user: user
                });
            }
            req.login(user, { session: false }, (error) => {
            if (error) {
                res.send(error);
            }
            var token = generateJWTToken(user.toJSON());
            return res.json({ user, token });
            });
        })(req, res);
    });
}