import mongoose from 'mongoose';
const Schema =  mongoose.Schema;


const transSchema = new Schema({
    user: {type: mongoose.Schema.Types.ObjectId, ref: 'User'},
    from: {type: mongoose.Schema.Types.ObjectId, ref: 'User'},
    to: {type: mongoose.Schema.Types.ObjectId, ref: 'User'},
    amount: Number
});

const Transaction = mongoose.model('Transaction', transSchema);


export default Transaction;