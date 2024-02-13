const express = require("express");
const router = new express.Router();
const accountController = require("../controllers/accountController");
const { handleErrors, checkLogin } = require("../utilities");
const regValidate = require("../utilities/account-validation");

router.get("/", checkLogin, handleErrors(accountController.buildAccount));

router.get("/login", handleErrors(accountController.buildLogin));

router.get("/register", handleErrors(accountController.buildRegister));

router.post(
  "/register",
  regValidate.registrationRules(),
  regValidate.checkRegData,
  handleErrors(accountController.registerAccount)
);

router.post(
  "/login",
  regValidate.loginRules(),
  regValidate.checkLoginData,
  handleErrors(accountController.loginAccount)
);

router.get(
  "/edit/:account_id",
  handleErrors(accountController.buildEditAccount)
);

router.post(
  "/accountupdate",
  regValidate.updateAccountRules(),
  regValidate.checkEditAccountData,
  handleErrors(accountController.editAccountInfo)
);

router.post(
  "/changepassword",
  regValidate.changePasswordRules(),
  regValidate.checkEditAccountData,
  handleErrors(accountController.editAccountPassword)
);

router.get("/logout", handleErrors(accountController.logoutAccount));

module.exports = router;
