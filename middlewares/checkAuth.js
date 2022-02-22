//  check auth midddleware
import jwt from 'jsonwebtoken';
import User from '../models/User.js';


const CheckAuth = (req, res, next) => {
    // Verify the token 

    const {token} = req.headers['Authorization'];
    jwt.verify(token, 'MyJWTSECRET', function(err, data) {
        User.find({email: data.email}).then(data => {
            if(data){
                next()
            } else {
                res.send('token not verified')
            }
        })
      });

}



export default CheckAuth;
