const mongoose = require('mongoose');
const schema = mongoose.Schema;



const journalSchema = new schema({
    content:{
        type: String,
        required: true
    },
    userid:{
        type:mongoose.Types.ObjectId,
        ref:"User"
    },
    sentiment:{
        type:String
    },
    date: {
        type: Date,
        required: true,
        default: Date.now
    }
});

module.exports = mongoose.model("Journal",journalSchema);