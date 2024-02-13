const express = require("express");
const router = new express.Router();
const invController = require("../controllers/invController");
const { handleErrors, isAuthorized } = require("../utilities");
const invValidate = require("../utilities/inventory-validation");

router
  .get(
    "/type/:classificationId",
    handleErrors(invController.buildByClassificationId)
  )
  .get("/detail/:invId", invController.buildByInvId)
  .get("/", isAuthorized, handleErrors(invController.buildManagement))
  .get("/add-classification", isAuthorized, handleErrors(invController.buildAddclass))
  .post(
    "/add-classification",
    isAuthorized,
    invValidate.classRules(),
    invValidate.checkClassData,
    handleErrors(invController.addClass)
  )
  router.get("/add-inventory", isAuthorized, handleErrors(invController.buildAddvehicle))
  .post(
    "/add-inventory",
    isAuthorized,
    invValidate.vehicleRules(),
    invValidate.checkVehicleData,
    handleErrors(invController.addVehicle)
  )
  
  router.get(
    "/getInventory/:classification_id",
    handleErrors(invController.getInventoryByJSON)
  )
  
  router.get("/edit/:inv_id", isAuthorized, handleErrors(invController.buildVehicleEdit))
  .post(
    "/update",
    isAuthorized,
    invValidate.vehicleRules(),
    invValidate.checkVehicleUpdateData,
    handleErrors(invController.updateVehicle)
  )
  
  router.get("/delete/:inv_id", isAuthorized, handleErrors(invController.buildVehicleDeleteConfirm))
  .post("/delete", isAuthorized, handleErrors(invController.deleteVehicle))
  .get("/broken", handleErrors(invController.BuildBrokenPage));

module.exports = router;
