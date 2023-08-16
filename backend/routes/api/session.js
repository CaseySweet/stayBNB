const express = require('express');
const { Op } = require('sequelize');
const bcrypt = require('bcryptjs');
const { check } = require('express-validator');
const { handleValidationErrors } = require('../../utils/validation');
const { setTokenCookie, restoreUser, requireAuth } = require('../../utils/auth');
const { User } = require('../../db/models');

const router = express.Router();

// const validateLogin = [
//   check('credential')
//     .exists({ checkFalsy: true })
//     .notEmpty()
//     .withMessage('Please provide a valid email or username.'),
//   check('password')
//     .exists({ checkFalsy: true })
//     .withMessage('Please provide a password.'),
//   handleValidationErrors
// ];
//Login
router.post(
  '/',
  // validateLogin,
  async (req, res, next) => {
    try {
      const { credential, password } = req.body;

      if (!credential || !password) {
        let err = Error('')
        err = {
          message: 'Bad Request',
          errors: {
            credential: "Email or username is required",
            password: "Password is required"
          }
        }
        return res.status(400).json(err)
      }

      const user = await User.unscoped().findOne({
        where: {
          [Op.or]: {
            username: credential,
            email: credential
          }
        }
      });

      if (!user || !bcrypt.compareSync(password, user.hashedPassword.toString())) {
        const err = new Error()
        err.message = 'Invalid credentials'
        return res.status(401).json(err);
      }

      const safeUser = {
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        username: user.username,
      };

      await setTokenCookie(res, safeUser);

      return res.json({
        user: safeUser
      });
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  }
);

router.get(
  '/',
  requireAuth,
  (req, res) => {
    try {
      const { user } = req;
      if(!user){
        const err = new Error()
        err.user = null
        return res.status(200).json(err);
        // throw new Error(res.status(200).json({
        //   user:  null
        // }))
      }
      if (user) {
        const safeUser = {
          id: user.id,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          username: user.username,
        };
        return res.json({
          user: safeUser
        });
      } else return res.json({ user: null });
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  }
);

router.delete(
  '/',
  (_req, res) => {
    res.clearCookie('token');
    return res.json({ message: 'success' });
  }
);

module.exports = router;
