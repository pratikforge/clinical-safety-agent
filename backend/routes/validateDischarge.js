const express = require("express");
const { createValidationController } = require("../controllers/validationController");

function createValidateDischargeRouter(env, dependencies) {
  const router = express.Router();
  router.post("/", createValidationController(env, dependencies));
  return router;
}

module.exports = { createValidateDischargeRouter };
