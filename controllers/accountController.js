const accModel = require("../models/account-model");
const msgModel = require("../models/message-model");
const utilities = require("../utilities/");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const dotenv = require("dotenv").config();

/* *******************************
 * Registeration View
 * *******************************/

async function buildRegister(req, res, next) {
  let nav = await utilities.getNav();
  let newMsg = await msgModel.getNewMsgCount(res.locals.accountData.account_id);
  res.render("account/register", {
    title: "Register",
    nav,
    newMsg,
    errors: null,
  });
}

async function registerAccount(req, res) {
  let nav = await utilities.getNav();
  const {
    account_firstname,
    account_lastname,
    account_email,
    account_password,
  } = req.body;

  let hashedPassword;

  try {
    hashedPassword = await bcrypt.hashSync(account_password, 10);
  } catch (errors) {
    req.flash("notice", "Sorry, unable to register your account");
    res.status(500).render("account/register", {
      title: "Registration",
      nav,
      errors: null,
    });
  }

  const regResult = await accModel.registerAccount(
    account_firstname,
    account_lastname,
    account_email,
    hashedPassword
  );
  if (regResult) {
    req.flash(
      "success",
      "Your account has been registered successfully. Please login"
    );

    res.status(201).render("account/login", {
      title: "Login",
      nav,
      errors: null,
    });
  } else {
    req.flash("error", "Sorry, an error occured during registration.");
    res.status(501).render("account/register", {
      title: "Registration",
      nav,
      errors: null,
    });
  }
}

/*****************************
 * Login Users
 *****************************/
async function buildLogin(req, res, next) {
  let nav = await utilities.getNav();
  res.render("account/login", {
    title: "Login",
    nav,
    errors: null,
  });
}

async function loginAccount(req, res) {
  let nav = await utilities.getNav();
  const { account_email, account_password } = req.body;

  const data = await accModel.getAccountByEmail(account_email);
  if (!data) {
    req.flash("notice", "Kindly check your credentials and try again");
    res.status(400).render("account/login", {
      title: "Login",
      account_email,
      nav,
      errors: null,
    });

    return;
  }
  try {
    let match = await bcrypt.compare(account_password, data.account_password);
    if (match) {
      delete data.account_password;
      const accessToken = jwt.sign(data, process.env.ACCESS_TOKEN_SECRET, {
        expiresIn: 3600 * 1000,
      });
      res.cookie("jwt", accessToken, { httpOnly: true, maxAge: 3600 * 1000 });
      return res.redirect("/account/");
    } else {
      throw new Error("Access forbidden");
    }
  } catch (error) {
    req.flash("notice", "Kindly check your credentials and try again");
    res.redirect("/account/login");
    return error;
  }
}

async function buildAccount(req, res, next) {
  let nav = await utilities.getNav();
  res.render("account/account", {
    title: "Account",
    nav,
    errors: null,
  });
}

async function buildEditAccount(req, res, next) {
  let nav = await utilities.getNav();
  let account = res.locals.accountData;
  const account_id = parseInt(req.params.account_id);
  res.render("account/editaccount", {
    title: "Edit Account Information",
    nav,
    errors: null,
    account_firstname: account.account_firstname,
    account_lastname: account.account_lastname,
    account_email: account.account_email,
    account_id: account_id,
  });
}

async function editAccountInfo(req, res) {
  let nav = await utilities.getNav();
  const { account_firstname, account_lastname, account_email, account_id } =
    req.body;

  // pass (fname, lname, email) to model UPDATE statement
  const regResult = await accountModel.updateAccountInfo(
    account_firstname,
    account_lastname,
    account_email,
    account_id
  );
  if (regResult) {
    // flash message that the update was successful
    res.clearCookie("jwt");
    const accountData = await accountModel.getAccountById(account_id);
    // use .env secret key to sign, expires in one hour
    const accessToken = jwt.sign(accountData, process.env.ACCESS_TOKEN_SECRET, {
      expiresIn: 3600 * 1000,
    });
    // can only be passed through http requests, maximum age is 1 hour
    res.cookie("jwt", accessToken, { httpOnly: true, maxAge: 3600 * 1000 });

    req.flash("success", "Account information updated succesfully.");
    res.status(201).render("account/account", {
      title: "Edit Account Information",
      nav,
      errors: null,
      account_firstname,
      account_lastname,
      account_email,
    });
  } else {
    req.flash("error", "Sorry, the update failed.");
    // render account edit view again
    res.status(501).render("account/editaccount", {
      title: "Edit Account Information",
      nav,
      errors: null,
      account_firstname: account_firstname,
      account_lastname: account_lastname,
      account_email: account_email,
    });
  }
}

async function editAccountPassword(req, res) {
  let nav = await utilities.getNav();
  const { account_password, account_id } = req.body;

  // Hash the password before storing
  let hashedPassword;
  try {
    // regular password and cost (salt is generated automatically)
    hashedPassword = await bcrypt.hashSync(account_password, 10);
  } catch (error) {
    req.flash("notice", "Sorry, an error occured.");
    res.status(500).render("account/editaccount", {
      title: "Registration",
      nav,
      errors: null,
    });
  }
  // pass (hashpass, account_id) to model UPDATE statement
  const regResult = await accountModel.changeAccountPassword(
    hashedPassword,
    account_id
  );
  // account account = res.locals.accountData
  if (regResult) {
    const account = await accountModel.getAccountById(account_id);
    req.flash("success", "Password was changed succesfully");
    res.status(201).render("account/account", {
      title: "Edit Account Information",
      nav,
      errors: null,
      account_firstname: account.account_firstname,
    });
  } else {
    const account = await accountModel.getAccountById(account_id);
    req.flash("error", "Sorry, the update failed.");
    res.status(501).render("account/editaccount", {
      title: "Edit Account Information",
      nav,
      errors: null,
    });
  }
}

async function logoutAccount(req, res, next) {
  res.clearCookie("jwt");
  res.redirect("/");
  return;
}

module.exports = {
  buildLogin,
  buildRegister,
  registerAccount,
  loginAccount,
  buildAccount,
  buildEditAccount,
  editAccountInfo,
  editAccountPassword,
  logoutAccount,
};
