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

      let errors = Error()
      errors = {}
      if(!firstName){
        errors.firstName = 'First Name is required.'
      }
      if(!lastName){
        errors.lastName = 'Last Name is required.'
      }
      if(!email || !check('email').isEmail()){
        errors.email = 'Invalid email.'
      }
      if(!username){
        errors.username = 'Username is required.'
      }
      if(!password || password.length < 6){
        errors.password = 'Password must be 6 characters or more'
      }
      // console.log(Object.keys(errors).length)
      if(Object.keys(errors).length > 0){
        return res.status(400).json({
          message: 'Bad Request',
          errors: errors
        })
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
      return res.status(500).json({ message: error.message });
    }
  }
);

module.exports = router;
