var express = require('express');
var router = express.Router();
var Book = require('../models/books');

router.post('/bookdata',async function(req,res,next){
  try {
    const bookModal = new Book(req.body)
    const bookSave =  await bookModal.save()
    res.status(200).json(bookSave);
  } catch (error) {
      console.log(error);
      next(error);
  }
});

router.get('/getbooks',async(req,res)=>{
  try {
    const books=await Book.find();
    return res.status(200).json(books);
  } catch (error) {
      console.log(error);
      next(error);
  }
});

router.delete('/delete/:id', async (req, res) => {
  try {
    const book = await Book.findByIdAndRemove(req.params.id);

    if (!book) {
      return res.status(404).json({ error: 'Book not found' });
    }

    res.json({ message: 'Book deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});

router.put('/update/:id', async (req, res) => {
  try {
    const { name, url } = req.body;
    const book = await Book.findByIdAndUpdate(
      req.params.id,
      { name, url },
      { new: true }
    );
    if (!book) {
      return res.status(404).json({ error: 'Book not found' });
    }
    res.json({ message: 'Book updated successfully', book });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});


module.exports = router;