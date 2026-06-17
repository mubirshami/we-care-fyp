const router = require("express").Router();
const {User} = require("../models/user");
const Token = require("../models/token");
const crypto = require("crypto");
const sendEmail = require("../utils/mail");
const bcrypt = require("bcrypt");




//  set new password
router.get("/:verifycode", async (req, res) => {
	try {
		const user = await User.findOne({ isverified:false, verifycode: req.params.verifycode });
		if (!user) return res.status(400).send("Invalid Code");

		user.isverified = true;
        user.verifycode = "";
		await user.save();

		res.status(200).send("User Verified");
	} catch (error) {
		res.status(500).send({ message: "Internal Server Error" });
	}
});



module.exports = router;