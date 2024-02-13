/* ******************************************
 * This server.js file is the primary file of the
 * application. It is used to control the project.
 *******************************************/
/* ***********************
 * Require Statements
 *************************/
const express = require("express");
const expressLayouts = require("express-ejs-layouts");
const dotenv = require("dotenv").config();
const app = express();
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser")
const static = require("./routes/static");
const inventoryRoute = require("./routes/inventoryRoutes");
const accountRoute = require("./routes/accountRoutes");
const baseController = require("./controllers/baseController");
const utilities = require("./utilities");
const session = require("express-session");
const pool = require("./database");

/* ***********************
 * Middlewares (Session, Express Messages)
 *************************/

app
  .use(
    session({
      store: new (require("connect-pg-simple")(session))({
        createTableIfMissing: true,
        pool,
      }),
      secret: process.env.SESSION_SECRET,
      resave: true,
      saveUninitialized: true,
      name: "sessionId",
    })
  )
  .use(require("connect-flash")())
  .use(function (req, res, next) {
    res.locals.messages = require("express-messages")(req, res);
    next();
  });

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use(cookieParser())
app.use(utilities.checkJWTToken)

/* ***********************
 * View Engine and Templates
 *************************/
app.set("view engine", "ejs");
app.use(expressLayouts);
app.set("layout", "./layouts/layout"); // not a views root

/* ***********************
 * Routes
 *************************/
app.use(static);

// Route to deliver index
app.get("/", async (req, res, next) => {
  try {
    await utilities.handleErrors(baseController.buildHome)(req, res, next);
  } catch (error) {
    next(error);
  }
});

app.use("/inv", inventoryRoute);
app.use("/account", accountRoute);

// FIle not found
app.use(async (req, res, next) => {
  next({
    status: 404,
    message: "This is not the page you are looking for.",
  });
});

/* ***********************
 * Express Error Handler
 *************************/
app.use(async (err, req, res, next) => {
  let nav = await utilities.getNav();
  console.error(`Error at: "${req.originalUrl}": ${err.message}`);
  if (err.status == 404) {
    message = err.message;
  } else {
    message =
      "Oops, looks like something went wrong! Maybe try a different route?";
  }
  res.render("errors/error", {
    title: err.status || "500 Server Error",
    message,
    nav,
  });
});

/* ***********************
 * Local Server Information
 * Values from .env (environment) file
 *************************/
const port = process.env.PORT || 5500;

/* ***********************
 * Log statement to confirm server operation
 *************************/
app.listen(port, () => {
  console.log(`app listening on PORT: ${port}`);
});
