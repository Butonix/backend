const express = require('express');
const { validationResult } = require('express-validator');

const auth = require('../middlewares/auth');
const { validateInputData } = require('../middlewares/validator');
const errorHandler = require('../middlewares/error-handler');
const models = require('../models');

const router = express.Router();

/*
 * Add trip
 */
router.post(
  '/',
  auth,
  validateInputData('add/trip'),
  async (req, res, next) => {
    try {
      const validationErrors = validationResult(req);

      if (!validationErrors.isEmpty()) {
        throw validationErrors.errors;
      }

      const { countryCode, city, startDate, endDate } = req.body;

      const userId = req.session.user.id;

      await models.trip.create({
        userId,
        countryCode,
        city,
        startDate,
        endDate,
      });

      res.sendStatus(201);
    } catch (error) {
      errorHandler(error, 400, res, next);
    }
  }
);

/*
 * Delete trip
 */
router.delete(
  '/:tripId',
  auth,
  validateInputData('delete/trip'),
  async (req, res, next) => {
    try {
      let validationErrors = validationResult(req);

      if (!validationErrors.isEmpty()) {
        throw validationErrors.errors;
      }

      let { tripId } = req.params;
      let user = req.session.user;

      let deleteTrip = await models.sequelize.query(
        `
          DELETE 
          FROM   "trips" 
          WHERE  "id" = ${tripId}
          AND    "userId" = ${user.id}
        `,
        { type: models.sequelize.QueryTypes.DESTROY }
      );

      if (!deleteTrip[1].rowCount) throw 'not-found';

      res.sendStatus(200);
    } catch (error) {
      errorHandler(error, 404, res, next);
    }
  }
);

module.exports = router;
