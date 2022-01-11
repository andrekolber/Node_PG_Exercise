/** BizTime express application. */

const express = require('express');

const app = express();
const ExpressError = require('./expressError');

app.use(express.json());

const compRoutes = require('./routes/companies');
const invRoutes = require('./routes/invoices');
const induRoutes = require('./routes/industries');
app.use('/companies', compRoutes);
app.use('/invoices', invRoutes);
app.use('/industries', induRoutes);
/** 404 handler */

app.use(function(req, res, next) {
	const err = new ExpressError('Not Found', 404);
	return next(err);
});

/** general error handler */

app.use((err, req, res, next) => {
	res.status(err.status || 500);

	return res.json({
		error   : err,
		message : err.message,
	});
});

module.exports = app;
