const invModel = require("../models/inventory-model");
const utilities = require("../utilities/");

const invCont = {};

/* ***************************
 *  Build inventory by classification view
 * ************************** */

invCont.buildByClassificationId = async function (req, res, next) {
  const classification_id = req.params.classificationId;
  const data = await invModel.getInventoryByClassificationId(classification_id);
  const grid = await utilities.buildClassificationGrid(data);
  let nav = await utilities.getNav();
  const className = data[0].classification_name;
  res.render("./inventory/classification", {
    title: className + " vehicles",
    nav,
    errors: null,
    grid,
  });
};

/* ***************************
 *  Build inventory by single vehicle view
 * ************************** */
invCont.buildByInvId = async function (req, res, next) {
  const inv_id = req.params.invId;
  const data = await invModel.getInventoryByInvId(inv_id);
  const grid = await utilities.buildVehicleGrid(data);
  let nav = await utilities.getNav();
  const vehicleMake = data[0].inv_make;
  const vehicleModel = data[0].inv_model;
  const vehicleYear = data[0].inv_year;
  // view -- vehicle.ejs
  res.render("./inventory/vehicle", {
    title: vehicleYear + " " + vehicleMake + " " + vehicleModel,
    nav,
    errors: null,
    grid,
  });
};

invCont.BuildBrokenPage = async function (req, res, next) {
  let nav = await utilities.getNav();
  res.render("./inventory/broken", {
    title: "Oops, error",
    errors: null,
    nav,
  });
};

/* ***************************
 *  Build management View
 * ************************** */
invCont.buildManagement = async function (req, res, next) {
  let nav = await utilities.getNav();
  const classSelect = await utilities.classificationSelect();
  res.render("./inventory/management", {
    title: "inventory Management",
    errors: null,
    nav,
    classSelect,
  });
};

/* ***************************
 *  Build View to add classification
 * ************************** */
invCont.buildAddclass = async function (req, res, next) {
  let nav = await utilities.getNav();
  res.render("./inventory/add-classification", {
    title: "Add Classification",
    errors: null,
    nav,
  });
};

/* ****************************************
 *  Process class info
 * *************************************** */
invCont.addClass = async function (req, res, next) {
  const { classification_name } = req.body;

  const regResult = await invModel.addClassification(classification_name);
  let nav = await utilities.getNav();
  let classSelect = await utilities.classificationSelect();

  if (regResult) {
    req.flash("success", "Classification added");
    res.status(200).render("./inventory/management", {
      title: "Inventory Management",
      nav,
      classSelect,
      errors: null,
    });
  } else {
    req.flash("error", "Class addition failed");
    res.status(501).render("./inventory/add-classification", {
      title: "Add Classification",
      nav,
      errors: null,
    });
  }
};

/* ***************************
 *  Deliver addvehicle view
 * ************************** */
invCont.buildAddvehicle = async function (req, res, next) {
  let nav = await utilities.getNav();
  let classSelect = await utilities.classificationSelect();
  res.render("./inventory/add-inventory", {
    title: "Add Vehicle",
    nav,
    errors: null,
    classSelect,
  });
};

/* ****************************************
 *  Process vehicle info
 * *************************************** */
invCont.addVehicle = async function (req, res, next) {
  let nav = await utilities.getNav();
  let classSelect = await utilities.classificationSelect();
  const {
    classification_id,
    inv_make,
    inv_model,
    inv_year,
    inv_description,
    inv_image,
    inv_thumbnail,
    inv_price,
    inv_miles,
    inv_color,
  } = req.body;

  const regResult = await invModel.addVehicle(
    classification_id,
    inv_make,
    inv_model,
    inv_year,
    inv_description,
    inv_image,
    inv_thumbnail,
    inv_price,
    inv_miles,
    inv_color
  );

  if (regResult) {
    req.flash("success", "Vehicle added");
    res.status(201).render("./inventory/management", {
      title: "Vehicle Management",
      nav,
    });
  } else {
    req.flash("error", "Vehicle addition failed");
    res.status(501).render("./inventory/add-inventory", {
      title: "Add Vehicle",
      nav,
      classSelect,
      errors: null,
    });
  }
};

/************************************
 * Return JSON response for Inv. classification
 **********************************/
invCont.getInventoryByJSON = async (req, res, next) => {
  const classification_id = parseInt(req.params.classification_id);
  const data = await invModel.getInventoryByClassificationId(classification_id);
  if (data && data.length > 0 && data[0].inv_id) {
    res.setHeader('Content-Type', 'application/json')
    return res.json(data);
  } else {
    next(new Error("Response data not returned"));
  }
};

/* ***************************
 *  Edit Vehicle view having current vehicle data
 * ************************** */
invCont.buildVehicleEdit = async function (req, res, next) {
  console.log("Inside buildVehicleEd");
  let nav = await utilities.getNav();
  const inv_id = parseInt(req.params.inv_id);
  let invData = (await invModel.getInventoryByInvId(inv_id))[0];
  let classSelect = await utilities.classificationSelect(
    invData.classification_id
  );
  let name = `${invData.inv_make} ${invData.inv_model}`;
  // view -- editvehicle.ejs
  res.render("./inventory/editvehicle", {
    title: "Edit " + name,
    nav,
    errors: null,
    classSelect: classSelect,
    inv_make: invData.inv_make,
    inv_model: invData.inv_model,
    inv_year: invData.inv_year,
    inv_description: invData.inv_description,
    inv_image: invData.inv_image,
    inv_thumbnail: invData.inv_thumbnail,
    inv_price: invData.inv_price,
    inv_miles: invData.inv_miles,
    inv_color: invData.inv_color,
    inv_id: invData.inv_id,
  });
};

/* ****************************************
 *  Process updated vehicle info
 * *************************************** */
invCont.updateVehicle = async function (req, res, next) {
  let nav = await utilities.getNav();
  const {
    classification_id,
    inv_make,
    inv_model,
    inv_year,
    inv_description,
    inv_image,
    inv_thumbnail,
    inv_price,
    inv_miles,
    inv_color,
    inv_id,
  } = req.body;

  const updateResult = await invModel.updateVehicle(
    inv_make,
    inv_model,
    inv_year,
    inv_description,
    inv_image,
    inv_thumbnail,
    inv_price,
    inv_miles,
    inv_color,
    classification_id,
    inv_id
  );

  if (updateResult) {
    const itemName = `${updateResult.inv_make} ${updateResult.inv_model}`;
    const classSelect = await utilities.classificationSelect(classification_id);

    req.flash("success", `${itemName} was successfully updated`);
    res.status(201).render("./inventory/management", {
      title: "Inventory Management",
      nav,
      errors: null,
      classSelect,
    });
  } else {
    const classSelect = await utilities.classificationSelect(classification_id);
    const itemName = `${inv_make} ${inv_model}`;
    req.flash("error", "Sorry, failed to insert data.");
    res.status(501).render("./inventory/editvehicle", {
      title: "Edit " + itemName,
      nav,
      errors: null,
      classSelect: classSelect,
      inv_make,
      inv_model,
      inv_year,
      inv_description,
      inv_image,
      inv_thumbnail,
      inv_price,
      inv_miles,
      inv_color,
      inv_id,
    });
  }
};

/* ***************************
 *  Deliver deleteconfirm view with vehicle data
 * ************************** */
invCont.buildVehicleDeleteConfirm = async function (req, res, next) {
  let nav = await utilities.getNav();
  const inv_id = parseInt(req.params.inv_id);
  let invData = (await invModel.getInventoryByInvId(inv_id))[0];
  let name = `${invData.inv_make} ${invData.inv_model}`;
  res.render("./inventory/deleteconfirm", {
    title: `Delete ${name}`,
    inv_make: invData.inv_make,
    inv_model: invData.inv_model,
    inv_year: invData.inv_year,
    inv_price: invData.inv_price,
    inv_id: invData.inv_id,
    nav,
    errors: null,
  });
};

/* ****************************************
 *  Confirm and process vehicle deletion
 * *************************************** */
invCont.deleteVehicle = async function (req, res, next) {
  let nav = await utilities.getNav();
  let classSelect = await utilities.classificationSelect();
  const { inv_make, inv_model, inv_year, inv_id } = req.body;
  const name = `${inv_make} ${inv_model}`;
  const deleteResult = await invModel.deleteVehicle(inv_id);

  if (deleteResult) {
    // const name = `${inv_make} ${inv_model}`
    req.flash("success", `${name} was successfully deleted`);
    res.status(201).render("./inventory/management", {
      title: "Inventory Management",
      nav,
      errors: null,
      classSelect,
    });
  } else {
    // const name = `${inv_make} ${inv_model}`
    req.flash("error", "Sorry, the deletion failed.");
    res.status(501).render("./inventory/deleteconfirm", {
      title: `Delete ${name}`,
      nav,
      errors: null,
      inv_make,
      inv_model,
      inv_year,
      inv_id,
    });
  }
};

module.exports = invCont;
