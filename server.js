import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import KJUR from 'jsrsasign';
import Keys from "./models/Keys.js";
import path from 'path';
import { readFileSync } from 'fs';
import User from './models/User.js';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import Transaction from './models/Transaction.js';
// import CheckAuth from './middlewares/checkAuth.js';
import bodyParser from 'body-parser';

const app = express();
const __dirname = path.resolve(path.dirname(''));

let privateKey
let publicKey;


mongoose.connect('mongodb://localhost:27017/Jsrasa').then( async () => {
    console.log('connected to the database');
    await loaKeys();
    
});

app.use(cors());
app.use(express.static(path.join(__dirname, 'kloe'),{
    index: false,
    setHeaders: (response, file_path, file_stats) => {

        const file = readFileSync(file_path);
        // console.log(file.toString())

        // console.log(file_path)
        if(file_path.endsWith('.js')){
            const data = file.toString();

            // console.log(data)
            const signature = sign(data, privateKey);
            response.setHeader('signature', signature)
        }

    }
}));

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json())


const PORT = 3333;
// const HTTPS_PORT = 4444;

const loaKeys = async () => {
    Keys.find().then(async (data) => {

        // console.log(data)
        if(data.length > 0){
            privateKey = data[0].privatekey;
            publicKey = data[0].publickey;
        } else {
            // generate keys and store them into the database 
            await saveKeys();

        }
    }).catch(err => {
        console.log(err)
    })
}

const saveKeys = async () => {

    const keypair  = await generateKey();
    const newKeys = new Keys({
        privatekey: keypair.ecprvhex,
        publickey: keypair.ecpubhex
    }).save().then(() => {
        console.log('new keys generated')
    })
    .then( async () => {
        await loaKeys()
    })
}

const generateKey = async () => {

    var ec = new KJUR.crypto.ECDSA({ "curve": 'secp256r1' });  // from the cdn file function
    var keypair = ec.generateKeyPairHex();

    console.log(keypair.ecpubhex)
    return keypair

}

const sign = (data, privateKey) => {
    // let data = 'random string for signing'
    // data ? null : data = 'random string for signing'
    var sig = new KJUR.crypto.Signature({ "alg": 'SHA256withECDSA' });
    sig.init({ d: privateKey, curve: 'secp256r1' });
    sig.updateString(data);
    var sigValueHex = sig.sign();
    return sigValueHex;

}



// register
app.post('/register',  (req, res, next) => {

    const {username, email, password} = req.body;

    console.log('before hashing')
    bcrypt.hash(password, 10, (err, hash) => { 
        // Store hash in your password DB.
        new User({
            username: username,
            email: email,
            password: hash

        }).save().then(data => {
            res.json({
                message: "user registered",
                user: data
            })
        }).catch(err => {
            console.log(err)
        })
    });

    // console.log('after hashing')

});


app.post('/login', (req, res, next) => {
    const {email, password} = req.body;
    User.find({email: email}).then(data => {
        if(data){
            bcrypt.compare(password, data[0].password).then(function (result) {
                if (result) {
                    const token = jwt.sign(
                        { username: data[0].username, email: data.email },
                        'MyJWTSECRET', { expiresIn: 60 * 60 });

                        res.json({
                            token: token,
                            user: data[0]
                            
                        })
                } else{
                    res.status(401).json({
                        message: "email or password is incorrect"
                    });
                }
            });
        } else {
            res.status(200).json({
                message: "email or password is incorrect"
            })
        }
    })

});


app.post('/transaction', (req, res, next) => {
    const {user, from, to, amount} = req.body;

    new Transaction({
        user: user, 
        // from : from,toto
        to: to,
        amount: amount
    }).save().then(data => {
        data.populate('to');
        res.send(data)
    }).catch(err => {
        res.send(err)
    })
})

app.get('/transaction',  (req, res, next) => {
   
    Transaction.find().then(data => {
        if(data.length > 0){
            res.json({data})
        } else {
            res.send('No transaction made')
        }
    })
})

// by Id
app.get('/transaction/:tId', (req, res, next) => {
    const transId = req.params.tId;
    Transaction.find({id: transId}).then(data => {
        if(data){
            res.json({data})
        }
    })
});


// by userId
app.get('/my_transaction/:uid', (req, res, next) => {
    const uid = req.params.uid;
    Transaction.find({user: uid}).then(data => {
        if(data){
            res.json({data})
        } else {
            res.send('user transactions not found')
        }
    })
});



app.get('/', (req, res, next) => {
    res.sendFile(path.join(__dirname, 'kloe/index.html'))
});

app.get('/publickey' ,async (req, res, next) => {

    const signature = await sign(publicKey, privateKey);
    res.setHeader('signature', signature);
    res.json({
        data: publicKey
    });

});



app.get('/data', async (req, res, next) => {
    const data = 'the data to be signed';

    const signature = await sign(data, privateKey);
    res.setHeader('signature', signature)

    res.json({
        data: data
    })

});


app.listen(PORT, () => {
    console.log(`listening to port ${PORT}`)
})


// const httpsServer = https.createServer({
//     key: readFileSync('./certs/key.pem'),
//     cert: readFileSync('./certs/cert.pem')
// }, app);


// httpsServer.listen(HTTPS_PORT, () => {
//     console.log('listening to port 4444')
// })