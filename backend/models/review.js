const mongoose = require('mongoose');
const schema = mongoose.Schema;

const reviewSchema = new schema({
    description:{
        type:String,
        required:true
    },
    userid:{
        type:mongoose.Types.ObjectId,
        ref:"User"
    },
      rating: {
        type: Number,
        required: true,
        min: 1,
        max: 5
      },
   adminresponse:{
    type:String,
    default:" "
   }   
});

module.exports = mongoose.model("Reviews",reviewSchema);