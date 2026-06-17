var express = require('express');
var router = express.Router();
var Category=require('../models/category');
var Video=require('../models/videos');

router.post('/categoryname',async function(req,res,next){
  try {
    const CategoryModal = new Category(req.body)
    const CategorySave =  await CategoryModal.save()
    res.status(200).json(CategorySave);
  } catch (error) {
      console.log(error);
      next(error);
  }
});

router.post('/videourl',async function(req,res,next){
  try {
    const urls=req.body.url.replace('watch?v=','embed/');
    console.log(req.body);
    const videoModal = new Video({url:urls,categoryid:req.body.categoryid});
    const videoSave =  await videoModal.save()
    res.status(200).json(videoSave);
  } catch (error) {
      console.log(error);
      next(error);
  }
});


// router.get('/videos/:categoryid',async(req,res)=>{
  
//   try {
//     const cid=req.params.categoryid;
//     const videos=await Video.find({categoryid:cid});
//     return res.status(200).json(videos);
//   } catch (error) {
//       console.log(error);
//       next(error);
//   }
// });

router.get('/getall',async(req,res)=>{
  
  try {
    const videos=await Video.find().populate('categoryid');
    return res.status(200).json(videos);
  } catch (error) {
      console.log(error);
      next(error);
  }
});

router.get('/getcategory',async(req,res)=>{
  
  try {
    const categories=await Category.find();
    return res.status(200).json(categories);
  } catch (error) {
      console.log(error);
      next(error);
  }
});

router.delete('/delete/:id', async (req, res, next) => {
  try {
    const video = await Video.findOneAndDelete({ _id: req.params.id });
    if (!video) {
      return res.status(404).send({ message: `Video not found` });
    }
    return res.status(200).send({ message: `Video deleted successfully` });
  } catch (error) {
    console.log(error);
    next(error);
  }
});


module.exports = router;