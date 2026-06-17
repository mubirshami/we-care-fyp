var express = require('express');
var router = express.Router();
var JournalTime = require('../models/journaltime');
const { verifyToken } = require('../auth/jwt');

router.post('/post',verifyToken,async function(req,res,next){
  try {
    console.log(req.user);
    const JournalTimeModal = new JournalTime({userid:req.user.id,journalTime:req.body.journalTime});
    const JournalTimeSave =  await JournalTimeModal.save()
    res.status(200).json(JournalTimeSave);
  } catch (error) {
      console.log(error);
      next(error);
  }
});

router.get('/get',verifyToken,async(req,res,next)=>{
  try {
    console.log("abbuyuv");
    console.log(req.user);
    const journaltimes = await JournalTime.find({userid:req.user.id});
    return res.status(200).json(journaltimes);
  } catch (error) {
      console.log(error);
      next(error);
  }
});

router.delete('/delete/:id', async (req, res, next) => {
  try {
    const journal = await Journal.findOneAndDelete({ _id: req.params.id });
    if (!journal) {
      return res.status(404).send({ message: `Journal not found with ID ${req.params.id}` });
    }
    return res.status(200).send({ message: `Journal with ID ${req.params.id} deleted successfully` });
  } catch (error) {
    console.log(error);
    next(error);
  }
});


module.exports = router;