if(process.env.NODE_ENV != "production"){
    require('dotenv').config();
}
const express = require('express');
const mongoose = require('mongoose');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const flash = require('connect-flash');
const methodOverride = require('method-override');
const path = require('path');
const ExpressError = require("./utils/ExpressError.js");
const ejs = require('ejs');
const ejsMate = require("ejs-mate");

const app = express();

const DB_URL = process.env.MONGODB_URL;

//DB Connection
async function main() {
    await mongoose.connect(DB_URL);
};

main().then(() => {
    console.log("connected to DB")
}).catch((err) => {
    console.error('❌ MongoDB error:' , err);
});


//View Engine
app.set('view engine', 'ejs');
app.engine('ejs', ejsMate);
app.set('views', path.join(__dirname, 'views'));

//Middlewares
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(methodOverride('_method'));
app.use(express.static(path.join(__dirname, 'public')));


//Session
app.use(session({
  secret: "mysupersecret",
  resave: false,
  saveUninitialized: false,
  store: MongoStore.create({
    mongoUrl: DB_URL   
  }),

  cookie: { maxAge: 1000 * 60 * 60 * 24 * 7 }
}));


//Flash Messages
app.use(flash());

//Global Template Locals
app.use((req, res, next) => {
  res.locals.currentUser = req.session.user || null;
  res.locals.success = req.flash('success');
  res.locals.error = req.flash('error');
  next();
});


//Routes
app.use('/', require('./routes/index'));
app.use('/auth', require('./routes/auth'));
app.use('/pgs', require('./routes/pgs'));
app.use('/bookings', require('./routes/bookings'));
app.use('/admin', require('./routes/admin'));
app.use('/owner', require('./routes/owner'));
app.use('/reviews', require('./routes/reviews'));

//404 Handler
app.use((req, res) => {
  res.status(404).render('404', { title: '404 - Page Not Found' });
});


//Error Handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).render('error', { title: 'Server Error', error: err.message });
});

//Start Server
const PORT =  process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(` running at http://localhost:${PORT}`);
});
