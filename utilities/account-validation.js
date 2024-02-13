const accModel = require("../models/account-model");
const utilities = require("../utilities")
const { body, validationResult } = require("express-validator")
const validate = {}

/*  **********************************
 *  Add Class Validation Rules
 * ********************************* */
validate.registrationRules = () => {
  return [
    body("account_email")
    .trim()
    .isEmail()
    .normalizeEmail()    
    .withMessage("Kindly provide a valid email address")
    .custom(async (account_email) => {
      const emailExists = await accModel.checkEmailExist(account_email)
      if (emailExists) {
        throw new Error("Email already taken. Kindly login or use a different email address")
      }
    }),
    body("account_password")
    .trim()
    .matches(/^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[?!.*@])[A-Za-z\d?!.*@]{12,}$/)
    .withMessage("Password does not meet requirements."),
  ]
}

validate.checkRegData = async (req, res, next) => {
  const { account_firstname, account_lastname, account_email } = req.body
  let errors = []
  errors = validationResult(req)
  if (!errors.isEmpty()) {
    let nav = await utilities.getNav()
    res.render("account/register", {
      errors,
      title: "Registration",
      nav,
      account_firstname,
      account_lastname,
      account_email,
    })
    return
  }
  next()
}

/***********************
 * Login Validation Rules
 */
validate.loginRules = () => {
  return [
    body("account_email")
    .trim()
    .isEmail()
    .normalizeEmail()    
    .withMessage("Kindly provide a valid email address"),
    body("account_password")
    .trim()
    .matches(/^[0-9a-zA-Z?!.*@]*$/)
    .withMessage("Incorrect Login Credentials"),
  ]
}

validate.checkLoginData = async (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    const nav = await utilities.getNav();
    const { account_email } = req.body;

    return res.render("account/login", {
      title: "Login",
      nav,
      account_email,
      errors: errors.array(),
    });
  }

  next();
};

validate.updateAccountRules = () => {
  return [
    body("account_firstname")
    .trim()
    .isLength({ min: 1 })
    .withMessage("Please provide a first name."),
    
    body("account_lastname")
      .trim()
      .isLength({ min: 2 })
      .withMessage("Please provide a last name."),

    body("account_email")
      .trim()
      .isEmail()
      .normalizeEmail()
      .withMessage("A valid email is required."),
  ]
}

validate.changePasswordRules = () => {
  return [
    body("account_password")
    .trim()
    .matches(/^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[?!.*@])[A-Za-z\d?!.*@]{12,}$/)
    .withMessage("Password does not meet requirements."),
  ]
}

validate.checkEditAccountData = async (req, res, next) => {
  let nav = await utilities.getNav()
  const { account_firstname, account_lastname, account_email, account_id } = req.body
  const account = await accountModel.getAccountById(account_id)
  if (account_email != account.account_email) {
    const emailExists = await accountModel.checkExistingEmail(account_email)
    if (emailExists){
      errors.push("Email exists. Please log in or use different email")
    }
  }
  let errors = []
  errors = validationResult(req)
  if (!errors.isEmpty()) {
    res.render("./account/editaccount", {
      errors,
      title: "Edit Account Information",
      nav,
      account_firstname,
      account_lastname,
      account_email,
    })
    return
  }
  next()
}

module.exports = validate;