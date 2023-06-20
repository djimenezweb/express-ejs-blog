const express = require('express');
const router = express.Router();
const Post = require('../models/Post');

// Routes

// GET / HOME
router.get('', async (req, res) => {
  try {
    const locals = {
      title: 'Node.js Blog',
      description: 'Blog created with Node, Express & MongoB'
    };

    let perPage = 6;
    let page = req.query.page || 1;

    const data = await Post.aggregate([{ $sort: { createdAt: -1 } }])
      .skip(perPage * page - perPage)
      .limit(perPage)
      .exec();

    const count = await Post.count();
    const nextPage = parseInt(page) + 1;
    const hasNextPage = nextPage <= Math.ceil(count / perPage);

    res.render('index', { locals, data, current: page, nextPage: hasNextPage ? nextPage : null, currentRoute: '/' });
  } catch (error) {
    console.error(error);
  }
});

// GET / POST

router.get('/post/:id', async (req, res) => {
  try {
    let slug = req.params.id;
    const data = await Post.findById({ _id: slug });
    const locals = {
      title: data.title,
      description: 'Blog created with Node, Express & MongoB',
      currentRoute: `/post/${slug}`
    };
    res.render('post', { locals, data, currentRoute });
  } catch (error) {
    console.error(error);
  }
});

// POST / SEARCH

router.post('/search', async (req, res) => {
  try {
    const locals = {
      title: 'Search',
      description: 'Blog created with Node, Express & MongoB'
    };
    let searchTerm = req.body.searchTerm;
    const searchTermNoSpecialChar = searchTerm.replace(/[^a-zA-Z0-9 ]/g, '');

    const data = await Post.find({
      $or: [{ title: { $regex: new RegExp(searchTermNoSpecialChar, 'i') } }, { body: { $regex: new RegExp(searchTermNoSpecialChar, 'i') } }]
    });

    res.render('search', { locals, data });
  } catch (error) {
    console.error(error);
  }
});

router.get('/about', (req, res) => {
  res.render('about', { currentRoute: '/about' });
});

module.exports = router;
