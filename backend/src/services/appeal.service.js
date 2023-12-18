// src/services/appeal.service.js
const Appeal = require('../models/appeal.model');
const User = require('../models/user.model');
const Debt = require("../models/deuda.model.js");
const { handleError } = require('../utils/errorHandler');
const { eliminarInteres } = require("../services/interes.service.js");

/**
 *  
 * @param {Object} appeal Objeto de apelación
 *  
 * @returns {Promise} Promesa con el objeto de apelación creado
 */ 

async function createAppeal(appeal) {
    try {
        const { userId, text, files } = appeal;

        const userFound = await User.findById(userId);
        if (!userFound) return [null, 'El usuario no existe'];

        // Verifica si el usuario tiene una deuda con interés aplicado
        const userDebt = await Debt.findOne({ user: userId, interestApplied: true });
        if (!userDebt) return [null, 'El usuario no tiene una deuda con interés aplicado'];

        const appealCreated = await Appeal.create({ userId, text, files }); // Guarda los archivos en la base de datos
        return [appealCreated, null];
    } catch (error) {
        handleError(error, 'appeal.service -> createAppeal');
        return [null, 'No se creo la apelación'];
    }
}
/**
 *  
 *  
 * @returns {Promise} Promesa con el objeto de apelación
 */

async function getAllAppeals() {
    try {
        const appeals = await Appeal.find().populate('userId', 'username email').exec();

        if (!appeals) return [null, 'No hay apelaciones'];

        return [appeals, null];
    } catch (error) {
        handleError(error, 'appeal.service -> getAllAppeals');
    }
}

/**
 *  
 * @param {String} id Id de la apelación
 *  
 * @returns {Promise} Promesa con el objeto de apelación
 */

async function getAppeal(id) {
    try {
        const appeal = await Appeal.findById(id)
            .populate('userId')
            .exec();

        if (!appeal) return [null, 'La apelación no existe'];

        return [appeal, null];
    } catch (error) {
        handleError(error, 'appeal.service -> getAppeal');
    }
}

/**
 *  
 * @param {String} id Id de la apelación
 *  
 *  @returns {Promise} Promesa con el objeto de apelación actualizado
 * 
 */

async function updateAppeal(id, status) {
    try {
        const appealFound = await Appeal.findById(id);
        if (!appealFound) return [null, 'La apelación no existe'];

        const newAppeal = new Appeal({
            id,
            userId: appealFound.userId,
            text: appealFound.text,
            status
        });

        await newAppeal.save();

        return [newAppeal, null];
    } catch (error) {
        handleError(error, 'appeal.service -> updateAppeal');
    }
}

/**
 *  
 *  @param {String} id Id de la apelación
 *  
 *  @returns {Promise} Promesa con el objeto de apelación eliminado
 */

async function deleteAppeal(id) {
    try {
        const appealFound = await Appeal.findById(id);
        if (!appealFound) return [null, 'La apelación no existe'];

        await Appeal.findByIdAndDelete(id);

        return [appealFound, null];
    } catch (error) {
        handleError(error, 'appeal.service -> deleteAppeal');
    }
}

/**
 *  
 * @param {String} userId Id del usuario
 *  
 * @returns {Promise} Promesa con el objeto de apelaciones del usuario
 */

async function getAppealsByUser(userId) {
    try {
        const appeals = await Appeal.find({ userId })
            .populate('userId')
            .exec();

        if (!appeals) return [null, 'El usuario no tiene apelaciones'];

        return [appeals, null];
    } catch (error) {
        handleError(error, 'appeal.service -> getAppealsByUser');
    }
}

async function updateAppealStatus(id, status) {
    try {
        const appeal = await Appeal.findByIdAndUpdate(id, { status }, { new: true });
        if (!appeal) return [null, 'Appeal not found'];

        // Si el estado es 'approved', eliminar el interés
        if (status === 'approved') {
            const userDebt = await Debt.findOne({ user: appeal.userId, interestApplied: true });
            if (userDebt) {
                // Restar el monto del interés de la deuda
                userDebt.amount -= userDebt.amount * 0.15; // Asume que el interés es del 15%
                // Establecer interestApplied en false
                userDebt.interestApplied = false;
                // Guardar la deuda actualizada
                await userDebt.save();

                console.log(`Se eliminó el interés para el usuario con id ${appeal.userId}`);
            } else {
                console.log(`No se eliminó ningún interés para el usuario con id ${appeal.userId}`);
            }
        }

        return [appeal, null];
    } catch (error) {
        handleError(error, 'appeal.service -> updateAppealStatus');
    }
}

module.exports = {
    createAppeal,
    getAllAppeals,
    getAppeal,
    updateAppeal,
    deleteAppeal,
    getAppealsByUser,
    updateAppealStatus
};