var express = require('express');
var router = express.Router();
var Review = require('../models/review');
const { verifyToken } = require('../auth/jwt');

router.post('/add',verifyToken,async function(req,res,next){
  try {
    const reviewModal = new Review({description:req.body.description,userid:req.user.id,rating:req.body.rating});
    const reviewSave =  await reviewModal.save()
    res.status(200).json(reviewSave);
  } catch (error) {
      console.log(error);
      next(error);
  }
});

router.get('/get',verifyToken,async(req,res,next)=>{
  try {
    const reviews=await Review.find({userid:req.user.id});
    return res.status(200).json(reviews);
  } catch (error) {
      console.log(error);
      next(error);
  }
});

router.delete('/delete/:id', async (req, res, next) => {
  try {
    const review = await Review.findOneAndDelete({ _id: req.params.id });
    if (!review) {
      return res.status(404).send({ message: `Review not found with ID ${req.params.id}` });
    }
    return res.status(200).send({ message: `Review with ID ${req.params.id} deleted successfully` });
  } catch (error) {
    console.log(error);
    next(error);
  }
});

router.get('/get', async (req, res) => {
    try {
      const reviews = await Review.find({ userid: req.user.id });
      res.send(reviews);
    } catch (error) {
      res.status(400).send({ error: error.message });
    }
  });

  router.get('/getall', async (req, res) => {
    try {
      const reviews = await Review.find().populate('userid', 'name');
      res.send(reviews);
    } catch (error) {
      res.status(400).send({ error: error.message });
    }
  });


  router.get('/check', verifyToken, async (req, res) => {
    try {
      const review = await Review.findOne({ userid: req.user.id });
  
      if (review) {
        return res.json({ hasReviewed: true });
      } else {
        return res.json({ hasReviewed: false });
      }
    } catch (error) {
      console.error('Error checking review status:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  });
  
  // Update a review by ID
  router.put('/update/:id', async (req, res) => {
    const id = req.params.id;
  
    try {
      const review = await Review.findByIdAndUpdate(id, req.body, { new: true });
  
      if (!review) {
        return res.status(404).send({ error: 'Review not found' });
      }
      res.send(review);
    } catch (error) {
      res.status(400).send({ error: error.message });
    }
  });


  router.put('/respond/:reviewId', async (req, res) => {
    const { reviewId } = req.params;
    const { adminresponse } = req.body;
  
    try {
      const review = await Review.findByIdAndUpdate(reviewId, { adminresponse }, { new: true });
      res.json(review);
    } catch (error) {
      console.error('Error responding to review:', error);
      res.status(500).json({ error: 'Failed to respond to review' });
    }
  });
  
  // Update response for a review
  router.put('/update-response/:reviewId', async (req, res) => {
    const { reviewId } = req.params;
    const { adminresponse } = req.body;
  
    try {
      const review = await Review.findByIdAndUpdate(reviewId, { adminresponse }, { new: true });
      res.json(review);
    } catch (error) {
      console.error('Error updating response:', error);
      res.status(500).json({ error: 'Failed to update response' });
    }
  });
  
  


module.exports = router;