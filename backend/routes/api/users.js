const express = require('express');
const bcrypt = require('bcryptjs');
const { setTokenCookie, requireAuth } = require('../../utils/auth');
const { User } = require('../../db/models');
const { check } = require('express-validator');
const { handleValidationErrors } = require('../../utils/validation');
const router = express.Router();

router.post(
  '/signup',
  // validateSignup,
  async (req, res) => {
    try {
      const { firstName, lastName, email, password, username } = req.body;
      if (!password || password.length < 6) {
        let err = Error('')
        err = {
          errors: 'Password must be 6 characters or more.'
        }
        return res.status(400).json(err)

      }

      if (!firstName || !lastName || !email || !username || check('email').isEmail()) {
        let err = Error('')
        err = {
          message: 'Bad Request',
          errors: {
            email: "Invalid email",
            username: "Username is required",
            firstName: "First Name is required",
            lastName: "Last Name is required"
          }
        }
        return res.status(400).json(err)
      }

      const existingEmail = await User.findOne({
        where: {
          email: email
        }
      })
      if (existingEmail) {
        return res.status(500).json({
          message: 'User already exists',
          errors: {
            email: "User with that email already exists"
          }
        })
      }

      const existingUsername = await User.findOne({
        where: {
          username: username
        }
      })
      if (existingUsername) {
        return res.status(500).json({
          message: 'User already exists',
          errors: {
            email: "User with that username already exists"
          }
        })
      }

      const hashedPassword = bcrypt.hashSync(password);
      const user = await User.create({ firstName, lastName, email, username, hashedPassword });

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

module.exports = router;
