import mongoose from 'mongoose';
const Schema =  mongoose.Schema;


const keysSchema = new Schema({
    privatekey: String,
    publickey: String
});


const KeyModel = mongoose.model('Keys', keysSchema);

export default KeyModel;
