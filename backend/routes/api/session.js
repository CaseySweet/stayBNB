const express = require('express');
const { Op } = require('sequelize');
const bcrypt = require('bcryptjs');
const { setTokenCookie, requireAuth } = require('../../utils/auth');
const { User } = require('../../db/models');

const router = express.Router();

//Login
router.post(
  '/session',
  // validateLogin,
  async (req, res, next) => {
    try {
      const { credential, password } = req.body;

      let errors = Error()
      errors = {}
      if (!credential) {
        errors.credential = 'Email or username is required'
      }
      if (!password) {
        errors.password = 'Password is required'
      }
      if (Object.keys(errors).length > 0) {
        return res.status(400).json({
          message: 'Bad Request',
          errors: errors
        })
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
        User: safeUser
      });
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  }
);

//Get current user
router.get(
  '/session',
  (req, res) => {
    try {
      const { user } = req;
      if (!user) {
        const err = new Error()
        err.user = null
        return res.status(200).json(err);
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
      } else return res.json({ User: null });
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  }
);

router.delete(
  '/session',
  (_req, res) => {
    res.clearCookie('token');
    return res.json({ message: 'success' });
  }
);

module.exports = router;
