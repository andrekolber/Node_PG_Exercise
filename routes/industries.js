const express = require('express');
const router = express.Router();
const db = require('../db');
const ExpressError = require('../expressError');

router.get('/', async (req, res, next) => {
	try {
		const results = await db.query(`
        SELECT * FROM industries 
        `);

		const companies = await db.query(`
		SELECT * FROM companies_industries AS ci
		LEFT JOIN industries AS i
        ON ci.indu_code = i.code `);

		return res.send({ industries: results.rows });
	} catch (err) {
		return next(err);
	}

	// const industries = results.rows
	// industries
});

router.post('/', async (req, res, next) => {
	try {
		const { code, industry } = req.body;
		const result = await db.query(
			`
        INSERT INTO industries (code, industry)
        VALUES ($1, $2) RETURNING code, industry
        `,
			[ code, industry ]
		);

		return res.status(201).json({ industry: result.rows[0] });
	} catch (err) {
		return next(err);
	}
});

router.post('/comp_indus', async (req, res, next) => {
	try {
		const { comp_code, indu_code } = req.body;

		const results = db.query(
			`INSERT INTO companies_industries (comp_code, indu_code)
                                    VALUES ($1, $2) RETURNING *`,
			[ comp_code, indu_code ]
		);

		return res.status(201).send({ status: `${comp_code} added to ${indu_code}` });
	} catch (err) {
		return next(err);
	}
});

module.exports = router;
