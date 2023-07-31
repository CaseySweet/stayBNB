// --- EXTERNAL IMPORTS ---
const express = require('express');
const morgan = require('morgan');
const cors = require('cors');
const csurf = require('csurf');
const helmet = require('helmet');
const cookieParser = require('cookie-parser');
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

// --- EXPORTS ---
module.exports = app;
