const express = require('express');
const router = express.Router();
const db = require('../db');
const ExpressError = require('../expressError');

router.get('/', async (req, res, next) => {
	try {
		const results = await db.query(`SELECT * FROM invoices`);
		return res.send({ invoices: results.rows });
	} catch (err) {
		return next(err);
	}
});

router.get('/:id', async (req, res, next) => {
	try {
		const { id } = req.params;
		const results = await db.query(`SELECT * FROM invoices WHERE id = $1`, [ id ]);
		if (results.rows.length === 0) {
			throw new ExpressError(`Can not find invoice with id of ${id}`, 404);
		}
		return res.send({ invoice: results.rows[0] });
	} catch (err) {
		return next(err);
	}
});

router.post('/', async (req, res, next) => {
	try {
		const { comp_code, amt } = req.body;
		const results = await db.query(
			`INSERT INTO invoices (comp_code, amt) 
        VALUES ($1, $2) RETURNING *`,
			[ comp_code, amt ]
		);
		return res.status(201).send({ invoice: results.rows[0] });
	} catch (err) {
		return next(err);
	}
});

router.put('/:id', async (req, res, next) => {
	try {
		const { id } = req.params;
		const { amt } = req.body;
		const results = await db.query(`UPDATE invoices SET amt = $1 WHERE id = $2 RETURNING *`, [ amt, id ]);
		if (results.rows.length === 0) {
			throw new ExpressError(`Can not find invoice with id of ${id}`, 404);
		}
		return res.status(200).send({ invoice: results.rows[0] });
	} catch (err) {
		return next(err);
	}
});

router.delete('/:id', async (req, res, next) => {
	try {
		const { id } = req.params;
		const results = await db.query(`DELETE FROM invoices WHERE id = $1 RETURNING *`, [ id ]);
		if (results.rows.length === 0) {
			throw new ExpressError(`Can not find invoice with id of ${id}`, 404);
		}
		return res.send({ status: 'deleted' });
	} catch (err) {
		return next(err);
	}
});

module.exports = router;
