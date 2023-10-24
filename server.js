require('dotenv').config();
const express = require('express');
const app = express();
const cors = require('cors');
const path = require('path');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const errorHandler = require('./middleware/errorHandler');
const { logger, logEvents } = require('./middleware/logger');
const corsOptions = require('./config/corsOptions');
const connectDB = require('./config/dbConn');
const PORT = process.env.PORT || 5500;

console.log(process.env.NODE_ENV);

connectDB();

// app.use(logger);

app.use(cors(corsOptions));

app.use(bodyParser.json({limit: '50mb', extended: true}));
app.use(bodyParser.urlencoded({limit: "50mb", extended: true, parameterLimit:50000}));
app.use(bodyParser.text({ limit: '200mb' }));

app.use(express.static(path.join(__dirname, 'public')));

app.use(express.json());

app.use('/', require('./routes/root'));
app.use('/user', require('./routes/user'));
app.use('/posts', require('./routes/posts'));

app.use('/oauth', require('./routes/oauth'));
app.use('/request', require('./routes/requests'));

app.use('/*', (req, res) => {
    if (req.accepts('html')) {
        res.sendFile(path.join(__dirname, 'views', '404.html'));
    } else if (req.accepts('json')) {
        res.json({ 'message': '404 Page Not Found' });
    } else if (req.accepts('txt')) {
        res.send('404 Page Not Found')
    }
})

app.use(errorHandler);

mongoose.connection.once('open', () => {
    console.log('Connected to MongoDB');
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
});

mongoose.connection.on('error', err => {
    logEvents(`${err.no}: ${err.code}\t${err.syscall}\t${err.hostname}`, 'mongoErrLog.log');
});