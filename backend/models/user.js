const mongoose = require('mongoose');
const bcrypt=require('bcrypt');
const Joi=require('joi');
const passwordComplexity=require('joi-password-complexity');

const schema = mongoose.Schema;

const userSchema = new schema({
    name:{
        type: String,
        required: true
    },
    email:{
        type: String,
        required: true
    },
    password:{
        type: String,
        required: true
    },
    isverified:{
        type: Boolean,
        default: false 
    },
    verifycode:{
        type: String,
    }
});


userSchema.pre('save',async function(next){
    try
    {
    if(!this.isModified('password')){
        return next();
    }
    const hash= await bcrypt.hash(this['password'],10);
    this['password']=hash;
    return next();
}
catch(error){
    return next(error);
}
});

const validate = (data) => {
	const schema = Joi.object({
		name: Joi.string().required().label("Name"),
		email: Joi.string().email().required().label("Email"),
		password: passwordComplexity().required().label("Password"),
	});
	return schema.validate(data);
};
const  User =mongoose.model("User",userSchema);

module.exports = {User,validate};