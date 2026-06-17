const mongoose = require('mongoose');
const schema = mongoose.Schema;

const EmotionTimeSchema = new schema({
    emotionTime:{
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

module.exports = mongoose.model("EmotionTime",EmotionTimeSchema);