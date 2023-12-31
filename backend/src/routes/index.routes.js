"use strict";
// Importa el modulo 'express' para crear las rutas
const express = require("express");

/** Enrutador de usuarios  */
const userRoutes = require("./user.routes.js");

/** Enrutador de autenticación */
const authRoutes = require("./auth.routes.js");

const pagoRoutes = require("./pagos.routes.js");
const debstatesRoutes = require("./debstates.routes.js");
const statesRoutes = require("./states.routes.js");
const deudaRoutes = require("./deudas.routes.js");
const roleRoutes = require("./roles.routes.js");
const interesRoutes = require("./interes.routes.js");

const mailerRoutes = require("./mailer.routes.js");
const manualEmailRoutes = require("./manualEmail.routes.js");

const fileRoutes = require("./file.routes.js");

const categoriaRoutes = require("./categorias.routes.js");

const appealRoutes = require("./appeal.routes.js");

const reportRoutes = require("./report.routes.js");
/** Middleware de autenticación */
const authenticationMiddleware = require("../middlewares/authentication.middleware.js");

/** Instancia del enrutador */
const router = express.Router();

// Define las rutas para los usuarios /api/usuarios
router.use("/users", authenticationMiddleware, userRoutes);
// Define las rutas para la autenticación /api/auth
router.use("/auth", authRoutes);

router.use("/pagos", pagoRoutes);

router.use("/categorias", categoriaRoutes);
router.use("/deudas", deudaRoutes);
router.use("/debstates", debstatesRoutes);
router.use("/interes", interesRoutes);

router.use("/sendMail", mailerRoutes);

router.use("/manualEmail", manualEmailRoutes);
router.use("/roles", roleRoutes);
router.use("/file", fileRoutes);

router.use("/appeals", appealRoutes);

router.use("/report", reportRoutes);

router.use("/states", statesRoutes);

router.use("/states", statesRoutes);
// Exporta el enrutador
module.exports = router;
