
import KJUR from 'jsrsasign';
import Keys from '../models/Keys.js';
// load private key from the server


let privateKey;

Keys.find().then(data => {
    if(data.length > 0){
        privateKey = data[0].privatekey
    }
})


const signMiddleWare = ((req, res, next) => {

    let data = 'random string for signing'
    // data ? null : data = 'random string for signing'
    var sig = new KJUR.crypto.Signature({ "alg": 'SHA256withECDSA' });
    sig.init({ d: privateKey, curve: 'secp256r1' });
    sig.updateString(data);
    var sigValueHex = sig.sign();

    res.setHeader('signature', sigValueHex);

    // console.log(sigValueHex)

    // return sigValueHex

    next()
});



export default signMiddleWare