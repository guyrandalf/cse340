const express = require("express");
const router = new express.Router();
const invController = require("../controllers/invController");
const { handleErrors } = require("../utilities");
const invValidate = require("../utilities/inventory-validation");

router
  .get(
    "/type/:classificationId",
    handleErrors(invController.buildByClassificationId)
  )
  .get("/detail/:invId", invController.buildByInvId)
  .get("/", handleErrors(invController.buildManagement))
  .get("/add-classification", handleErrors(invController.buildAddclass))
  .post(
    "/add-classification",
    invValidate.classRules(),
    invValidate.checkClassData,
    handleErrors(invController.addClass)
  )
  .get("/add-inventory", handleErrors(invController.buildAddvehicle))
  .post(
    "/add-inventory",
    invValidate.vehicleRules(),
    invValidate.checkVehicleData,
    handleErrors(invController.addVehicle)
  )
  .get("/broken", handleErrors(invController.BuildBrokenPage));

module.exports = router;
