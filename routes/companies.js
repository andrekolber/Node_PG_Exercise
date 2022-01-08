const express = require('express');
const router = express.Router();
const db = require('../db');
const ExpressError = require('../expressError');

router.get('/', async (req, res, next) => {
	try {
		const results = await db.query(`SELECT * FROM companies`);
		return res.json({ companies: results.rows });
	} catch (err) {
		return next(err);
	}
});

router.get('/:code', async (req, res, next) => {
	try {
		const { code } = req.params;
		const results = await db.query(`SELECT * FROM companies WHERE code = $1`, [ code ]);
		const invoices = await db.query(`SELECT * FROM invoices WHERE comp_code = $1`, [ code ]);
		if (results.rows.length === 0) {
			throw new ExpressError(`Can not find company with code of ${code}`, 404);
		}
		return res.send({ company: results.rows[0], invoices: invoices.rows });
	} catch (err) {
		return next(err);
	}
});

router.post('/', async (req, res, next) => {
	try {
		const { code, name, description } = req.body;
		const results = await db.query(
			`INSERT INTO companies (code, name, description) 
        VALUES ($1, $2, $3) RETURNING code, name, description`,
			[ code, name, description ]
		);
		return res.status(201).json({ company: results.rows[0] });
	} catch (err) {
		return next(err);
	}
});

router.put('/:code', async (req, res, next) => {
	try {
		const { code } = req.params;
		const { name, description } = req.body;
		const results = await db.query(
			`UPDATE companies SET name = $1, description = $2 
        WHERE code = $3 RETURNING code, name, description`,
			[ name, description, code ]
		);
		if (results.rows.length === 0) {
			throw new ExpressError(`Can not find company with code of ${code}`, 404);
		}
		return res.status(200).json({ company: results.rows[0] });
	} catch (err) {
		return next(err);
	}
});

router.delete('/:code', async (req, res, next) => {
	try {
		const { code } = req.params;
		const results = await db.query(`DELETE FROM companies WHERE code = $1 RETURNING code`, [ code ]);
		if (results.rows.length === 0) {
			throw new ExpressError(`Can not find company with code of ${code}`, 404);
		}
		return res.send({ status: 'deleted' });
	} catch (err) {
		return next(err);
	}
});

module.exports = router;
