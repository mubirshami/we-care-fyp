const mongoose = require('mongoose');
const schema = mongoose.Schema;

const videoSchema = new schema({
    url:{
        type:String,
        required:true
    },
    categoryid:{
        type:mongoose.Types.ObjectId,
        ref:"Category"
    }
});

module.exports = mongoose.model("Video",videoSchema);