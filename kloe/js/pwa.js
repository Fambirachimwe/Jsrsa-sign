

var swgetheaders = require('swgetheaders');


const getPublicKey =  () => {
    const publicKey = localStorage.getItem('key');
    return publicKey
}




const verify = (publicKey, signature, data) => {

    const curve = 'secp256r1';
    const sigalg = 'SHA256withECDSA'
    var sig = new KJUR.crypto.Signature({ "alg": sigalg, "prov": "cryptojs/jsrsa" });
    sig.init({ xy: publicKey, curve: curve });  // public key and curve
    sig.updateString(data);  // data to be verified
    // console.log(publicKey)
    var result = sig.verify(signature);   // signature verification
    if (result) {
        // alert("valid ECDSA signature");
        console.log(result)
    } else {
        window.location.replace("https://morning-badlands-59571.herokuapp.com/404.html");;

        // here terminate the users session
        // and redirect to a 404 page
        
    }
}


swgetheaders.registerServiceWorker('/swgetheaders-worker.js', {
    debug: true,
    corsExceptions: [
        'code.jquery.com',
        'platform.twitter.com'
    ]
});

// Console log when the service worker is ready to do things
swgetheaders.on('plugged', function (request, response) {
    // console.log(response);

    console.log('serveice worker installed and ready for use ')

});




swgetheaders.on('response',  (req, response) => {

    let data;
    let headers;
    let signature;

    if(response.data){
        data =  response.data.data
    }

    if(response.headers){
        headers =  response.headers.filter(header => header.name === "signature")[0];

    }
    
    if(headers !== undefined){
        signature =  headers.value;
        verify(getPublicKey(), signature, data)
    }
    
});