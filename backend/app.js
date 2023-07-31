// --- EXTERNAL IMPORTS ---
const express = require('express');
const morgan = require('morgan');
const cors = require('cors');
const csurf = require('csurf');
const helmet = require('helmet');
const cookieParser = require('cookie-parser');
const { ValidationError } = require('sequelize');
require('express-async-errors');

// --- INTERNAL IMPORTS ---
const { environment } = require('./config');
const routes = require('./routes');

const isProduction = environment === 'production';

// --- INITIALIZE THE APP ---
const app = express();

// --- USE ALL GLOBAL MIDDLEWARE ---
app.use(morgan('dev')); // Logging

app.use(cookieParser());
app.use(express.json());

if (!isProduction) {
    app.use(cors());
};

app.use(helmet.crossOriginResourcePolicy({
    policy: 'cross-origin'
}));
app.use(
    csurf({
        cookie: {
            secure: isProduction,
            sameSite: isProduction && "Lax",
            httpOnly: true
        }
    })
);
// --- ROUTES ---
app.use(routes);

// --- ERROR HANDLING MIDDLEWARE ---
app.use((_req, _res, next) => {
    const err = new Error("The requested resource couldn't be found.");
    err.title = "Resource Not Found";
    err.errors = { message: "The requested resource couldn't be found." };
    err.status = 404;
    next(err);
});

app.use((err, _req, _res, next) => {
    // check if error is a Sequelize error:
    if (err instanceof ValidationError) {
        let errors = {};
        for (let error of err.errors) {
            errors[error.path] = error.message;
        }
        err.title = 'Validation error';
        err.errors = errors;
    }
    next(err);
});

app.use((err, _req, res, _next) => {
    res.status(err.status || 500);
    console.error(err);

    res.json({
        title: err.title || 'Server Error',
        message: err.message,
        errors: err.errors,
        stack: isProduction ? null : err.stack
    });
});
// --- EXPORTS ---
module.exports = app;
