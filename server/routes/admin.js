const express = require('express');
const router = express.Router();
const Post = require('../models/Post');
const User = require('../models/User');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const adminLayout = '../views/layouts/admin';
const jwtSecret = process.env.JWT_SECRET;

// Check login
const authMiddleware = (req, res, next) => {
  const token = req.cookies.token;
  if (!token) {
    return res.status(401).jspn({ message: 'Unauthorized' });
  }

  try {
    const decoded = jwt.verify(token, jwtSecret);
    req.userId = decoded.userId;
    next();
  } catch (error) {
    res.status(401).json({ message: 'Unauthorized' });
  }
};

router.get('/admin', async (req, res) => {
  try {
    const locals = {
      title: 'Admin',
      description: 'Admin page'
    };

    res.render('admin/index', { locals, layout: adminLayout });
  } catch (error) {
    console.error(error);
  }
});

// GET / Admin login page

router.get('/admin', async (req, res) => {
  try {
    const locals = {
      title: 'Admin',
      description: 'Admin page'
    };

    res.render('admin/index', { locals, layout: adminLayout });
  } catch (error) {
    console.error(error);
  }
});

// POST / Admin login page

router.post('/admin', async (req, res) => {
  try {
    const { username, password } = req.body;
    const user = await User.findOne({ username });
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign({ userId: user._id }, jwtSecret);
    res.cookie('token', token, { httpOnly: true });
    res.redirect('/dashboard');
  } catch (error) {
    console.error(error);
  }
});

// GET / Admin dashboard

router.get('/dashboard', authMiddleware, async (req, res) => {
  try {
    const data = await Post.find();
    res.render('admin/dashboard', { data, layout: adminLayout });
  } catch (error) {
    console.error(error);
  }
});

// POST / Admin Register page

router.post('/register', async (req, res) => {
  try {
    const { username, password } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);

    try {
      const user = await User.create({
        username,
        password: hashedPassword
      });
      res.status(201).json({ messgae: 'User created', user });
    } catch (error) {
      if (error.code === 11000) {
        res.status(409).json({ message: 'User already in use' });
      }
      res.status(500).json({ message: 'Internal server error' });
    }
  } catch (error) {
    console.error(error);
  }
});

// GET / New Post

router.get('/add-post', authMiddleware, async (req, res) => {
  try {
    res.render('admin/add-post', { layout: adminLayout });
  } catch (error) {
    console.error(error);
  }
});

// POST / New Post

router.post('/add-post', authMiddleware, async (req, res) => {
  try {
    const { title, body } = req.body;
    const newPost = new Post({ title, body });
    await Post.create(newPost);
    res.redirect('/dashboard');
  } catch (error) {
    console.error(error);
  }
});

// GET / Update Post

router.get('/edit-post/:id', authMiddleware, async (req, res) => {
  try {
    const data = await Post.findOne({ _id: req.params.id });
    res.render('admin/edit-post', { data, layout: adminLayout });
  } catch (error) {
    console.error(error);
  }
});

// PUT / Update Post

router.put('/edit-post/:id', authMiddleware, async (req, res) => {
  try {
    await Post.findByIdAndUpdate(req.params.id, { title: req.body.title, body: req.body.body, updatedAt: Date.now() });
    res.redirect(`/edit-post/${req.params.id}`);
  } catch (error) {
    console.error(error);
  }
});

// DELETE / Admin Delete Post

router.delete('/delete-post/:id', authMiddleware, async (req, res) => {
  try {
    await Post.deleteOne({ _id: req.params.id });
    res.redirect('/dashboard');
  } catch (error) {
    console.error(error);
  }
});

// GET Admin Logout

router.get('/logout', (req, res) => {
  res.clearCookie('token');
  res.redirect('/');
});

module.exports = router;
