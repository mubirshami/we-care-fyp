var express = require("express");
var router = express.Router();
var Journal = require("../models/journal");
const { verifyToken } = require("../auth/jwt");

router.post("/post", verifyToken, async function (req, res, next) {
  try {
    const journalModal = new Journal({
      content: req.body.content,
      userid: req.user.id,
      sentiment: req.body.sentiment,
    });
    const journalSave = await journalModal.save();
    res.status(200).json(journalSave);
  } catch (error) {
    console.log(error);
    next(error);
  }
});

router.get("/get", verifyToken, async (req, res, next) => {
  try {
    const journals = await Journal.find({ userid: req.user.id });
    return res.status(200).json(journals);
  } catch (error) {
    console.log(error);
    next(error);
  }
});

router.delete("/delete/:id", async (req, res, next) => {
  try {
    const journal = await Journal.findOneAndDelete({ _id: req.params.id });
    if (!journal) {
      return res
        .status(404)
        .send({ message: `Journal not found with ID ${req.params.id}` });
    }
    return res
      .status(200)
      .send({
        message: `Journal with ID ${req.params.id} deleted successfully`,
      });
  } catch (error) {
    console.log(error);
    next(error);
  }
});

module.exports = router;
