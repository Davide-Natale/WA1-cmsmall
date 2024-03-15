'use strict';

const express = require('express');
const morgan = require('morgan');
const cors = require('cors');
const {check, validationResult, oneOf} = require('express-validator');
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const session = require('express-session');
const dayjs = require('dayjs');
const dao = require('./dao.js');
const userDao = require('./user-dao.js')

/*** Set up Passport ***/
// set up the "username and password" login strategy
// by setting a function to verify username and password
passport.use(new LocalStrategy(
  function(username, password, done) {
    userDao.getUser(username, password).then((user) => {
      if (!user)
        return done(null, false, { message: 'Wrong username and/or password.' });
        
      return done(null, user);
    })
  }
));

// serialize and de-serialize the user (user object <-> session)
// we serialize the user id and we store it in the session: the session is very small in this way
passport.serializeUser((user, done) => {
  done(null, user.id);
});

// starting from the data in the session, we extract the current (logged-in) user
passport.deserializeUser((id, done) => {
  userDao.getUserById(id)
    .then(user => {
      done(null, user); // this will be available in req.user
    }).catch(err => {
      done(err, null);
    });
});

// init express
const app = new express();
const port = 3001;

//set-up middlewares
app.use(morgan('dev'));
app.use(express.json());
app.use(express.static('public'));

const corsOptions = {
    origin: 'http://localhost:5173',
    credentials: true
};
app.use(cors(corsOptions));

// custom middleware: check if a given request is coming from an authenticated user
const isLoggedIn = (req, res, next) => {
    if(req.isAuthenticated())
      return next();
    
    return res.status(401).json({ error: 'Not authenticated'});
}

// set up the session
app.use(session({
  secret: 'wge8d239bwd93rkskb',
  resave: false,
  saveUninitialized: false 
}));

// then, init passport
app.use(passport.initialize());
app.use(passport.session());


/*** APIs ***/

// GET /api/pages/published
app.get('/api/pages/published', async (req, res) => {
  try {
    const result = await dao.getPublishedPages();
    
    res.json(result);
  } catch (err) {
      res.status(500).end();
  }
});

//GET /api/pages
app.get('/api/pages', isLoggedIn, async (req, res) => {
  try {
    const result = await dao.getAllPages();

    res.json(result);
  } catch (err) {
      res.status(500).end();
  }
});

// GET /api/pages/<id>
app.get('/api/pages/:id', async (req, res) => {
  try {
      const result = await dao.getPage(req.params.id);

      if(result.error)
        res.status(404).json(result);
      else if ((!result.publication_date || dayjs().diff(result.publication_date) < 0 ) && !req.isAuthenticated())
        // if the page is not published the request must come from an authenticated user
        res.status(401).json({error: 'Not authenticated'});
      else {
        const blocks = await dao.getBlocks(result.id);
        result.blocks = blocks;

        res.json(result);
      }     
  } catch(err) {
      res.status(500).end();
  }
});

//POST /api/pages
app.post('/api/pages', isLoggedIn, [
  check('title').isString().withMessage('Title must be a string').notEmpty().withMessage('Title is required'),
  check('authorId').isInt().withMessage("AuthorId must be an integer"),
  oneOf([check('publication_date').isDate().withMessage('Publication Date not valid'), 
      check('publication_date').equals('').withMessage('Publication Date not valid')]),
  check('creation_date').isDate().withMessage('Creation Date not valid'),
  check('blocks').isArray().withMessage('Blocks must be an array of blocks')
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
      return res.status(422).json({errors: errors.array()});
  }

  const page = { title: req.body.title, publication_date: req.body.publication_date? req.body.publication_date : null,
    creation_date: req.body.creation_date };

  if(page.publication_date && dayjs(page.publication_date).diff(page.creation_date) < 0)
    return res.status(422).json({error: "Publication date cannot be earlier than Creation date"});

  let blocks = req.body.blocks;
  const headers = blocks.filter(e => e.type === 'h');
  const images = blocks.filter(e => e.type === 'img');
  const wrongBlocks = blocks.filter(e => (e.type !== 'h' && e.type !== 'p' && e.type !== 'img') || e.content == '');

  if(wrongBlocks.length > 0)
    return res.status(422).json({error: 'Invalid blocks.'});

  if(headers.length === 0 || blocks.length - headers.length === 0)
    return res.status(422).json({error: 'Page must contain at least an header and another type of block.'});

  for(const i of images) {
    const result = await dao.getImage(i.content);

    if(result.error)
      return res.status(404).json(result);
  }
  
  if(req.user.admin && req.body.authorId !== req.user.id) {
    const result = await userDao.getUserById(req.body.authorId);

    if(result.error) 
      return res.status(404).json(result);
    else
      page.authorId = req.body.authorId;

  } else
      page.authorId = req.user.id;

  try{
    const pageId = await dao.addPage(page);

    const blocksId = await Promise.all(blocks.map(async (e) => {
      const result = await dao.addBlock({...e, pageId: pageId});
      return result;
    }));

    blocks = blocks.map((e, i) => Object.assign({id: blocksId[i]}, e, {pageId: pageId}));
    res.status(201).json(Object.assign({id: pageId}, page, {blocks: [...blocks]}));
  } catch(err) {
      res.status(500).json({ error: `Database error during the creation of the page ${page.title}.`});
  } 
});

//PUT /api/pages/<id>
app.put('/api/pages/:id', isLoggedIn, [
  check('id').isInt().withMessage('Id must be an integer'),
  check('title').isString().withMessage('Title must be a string').notEmpty().withMessage('Title is required'),
  check('authorId').isInt().withMessage("AuthorId must be an integer"),
  oneOf([check('publication_date').isDate().withMessage('Publication Date not valid'), 
      check('publication_date').equals('').withMessage('Publication Date not valid')]),
  check('creation_date').isDate().withMessage('Creation Date not valid'),
  check('blocks').isArray().withMessage('Blocks must be an array of blocks')
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
      return res.status(422).json({errors: errors.array()});
  }

  const page = await dao.getPage(req.params.id);
  if(page.error)
      return res.status(404).json(page);

  const newPage = { id: req.params.id, title: req.body.title, publication_date: req.body.publication_date? req.body.publication_date : null, 
    creation_date: req.body.creation_date };

  if(newPage.creation_date !== page.creation_date)
    return res.status(422).json({error: "Creation date cannot be changed."});

  if(newPage.publication_date && dayjs(newPage.publication_date).diff(newPage.creation_date) < 0)
    return res.status(422).json({error: "Publication date cannot be earlier than Creation date"});
  
  if(page.authorId !== req.user.id && !req.user.admin)
    return res.status(401).json({error: 'Not Authorized.'});

  let blocks = req.body.blocks;
  const headers = blocks.filter(e => e.type === 'h');
  const images = blocks.filter(e => e.type === 'img');
  const wrongBlocks = blocks.filter(e => (e.type !== 'h' && e.type !== 'p' && e.type !== 'img') || e.content == '');

  if(wrongBlocks.length > 0)
    return res.status(422).json({error: 'Invalid blocks.'});

  if(headers.length === 0 || blocks.length - headers.length === 0)
    return res.status(422).json({error: 'Page must contain at least an header and another type of block.'});

  for(const i of images) {
    const result = await dao.getImage(i.content);
  
    if(result.error)
      return res.status(404).json(result);
  }

  if(req.user.admin && req.body.authorId !== req.user.id) {
    const result = await userDao.getUserById(req.body.authorId);

    if(result.error) 
      return res.status(404).json(result);
    else
      newPage.authorId = req.body.authorId;

  } else
      newPage.authorId = req.user.id;

  try{
    const numRowChanges = await dao.updatePage(newPage);

    await dao.deleteBlocks(newPage.id);

    const blocksId = await Promise.all(blocks.map(async (e) => {
      const result = await dao.addBlock({...e, pageId: newPage.id});
      return result;
    }));

    res.json({changes: numRowChanges});
  } catch(err) {
    res.status(500).json({ error: `Database error during the update of the page ${newPage.id}.`});
  }  
});

// DELETE /api/pages/<id>
app.delete('/api/pages/:id', isLoggedIn, [
    check('id').isInt().withMessage('Id must be an integer')
  ], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) 
      return res.status(422).json({errors: errors.array()});
      
    try {
      const result = await dao.getPage(req.params.id);

      if (result.error)
        res.status(404).json(result);
      else if (result.authorId !== req.user.id && !req.user.admin)
        res.status(401).json({ error: 'Not Authorized' });
      else {
        await dao.deleteBlocks(req.params.id);
        const numRowChanges = await dao.deletePage(req.params.id);
        
        res.json({changes: numRowChanges});
      }
    } catch (err) {
      res.status(500).json({ error: `Database error during the deletion of the page ${req.params.id}.`});
    }
})

// GET /api/site-name
app.get('/api/site-name', (req, res) => {
  dao.getSiteName()
  .then(site => res.json(site))
  .catch(() => res.status(500).end());
});

// PUT /api/site-name
app.put('/api/site-name', isLoggedIn, [
    check('name').notEmpty().withMessage("Name must be a string. It's required field.")
  ] , async (req, res) => {
    const errors = validationResult(req);
      if (!errors.isEmpty()) 
        return res.status(422).json({errors: errors.array()});
      else if(!req.user.admin) 
        return res.status(401).json({error: 'Not Authorized'});
      
      try{
        const numRowChanges = await dao.updateSiteName(req.body.name);
        
        res.json({changes: numRowChanges});
      } catch(err) {
          res.status(500).json({error: 'Database error during the update of the site name'});
      }
});

// GET /api/images
app.get('/api/images', isLoggedIn, async (req, res) => {
  dao.getImages()
  .then(images => res.json(images))
  .catch(() => res.status(500).end());
});

// GET /api/users
app.get('/api/users', isLoggedIn, async (req, res) => {
  if(!req.user.admin) 
    return res.status(401).json({error: 'Not Authorized'});
  
  try {
    const result = await dao.getUsers();

    res.json(result);
  } catch (err) {
      res.status(500).end();
  }
});

/*** Users APIs ***/

// POST /api/sessions 
// login
app.post('/api/sessions', function(req, res, next) {
  passport.authenticate('local', (err, user, info) => {
    if (err)
      return next(err);
      if (!user) {
        // display wrong login messages
        return res.status(401).json(info);
      }
      // success, perform the login
      req.login(user, (err) => {
        if (err)
          return next(err);
        
        // req.user contains the authenticated user, we send all the user info back
        // this is coming from userDao.getUser()
        return res.json(req.user);
      });
  })(req, res, next);
});

// DELETE /api/sessions/current 
// logout
app.delete('/api/sessions/current', (req, res) => {
  req.logout( ()=> { res.end(); } );
});

// GET /api/sessions/current
// check whether the user is logged in or not
app.get('/api/sessions/current', (req, res) => {  if(req.isAuthenticated()) {
    res.status(200).json(req.user);
  }
  else
    res.status(401).json({error: 'Unauthenticated user!'});
});

// activate the server
app.listen(port, () => {
  console.log(`Server listening at http://localhost:${port}`);
});
