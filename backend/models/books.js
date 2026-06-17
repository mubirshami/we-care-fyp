const mongoose = require('mongoose');
const schema = mongoose.Schema;

const bookSchema = new schema({
    name:{
        type:String,
        required:true
    },
    url:{
        type:String,
        required:true
    }
});

module.exports = mongoose.model("Book",bookSchema);