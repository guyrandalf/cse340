const express = require("express");
const router = new express.Router();
const invController = require("../controllers/invController");
const { handleErrors } = require("../utilities");

router.get("/type/:classificationId", invController.buildByClassificationId);
router.get(
  "/type/:classificationId",
  handleErrors(invController.buildByClassificationId)
);

router.get("/detail/:invId", invController.buildByInvId);

router.get("/broken", handleErrors(invController.BuildBrokenPage));

module.exports = router;
