const mongoose = require('mongoose');
const schema = mongoose.Schema;

const MeditationTimeSchema = new schema({
    meditationTime:{
        type: Number,
        required: true
    },
    userid:{
        type:mongoose.Types.ObjectId,
        ref:"User"
    },
    date: {
        type: Date,
        required: true,
        default: Date.now
    }
});

module.exports = mongoose.model("MeditationTime",MeditationTimeSchema);