process.env.NODE_ENV = 'test';

const request = require('supertest');
const app = require('../app');
const db = require('../db');

let testCompany;
let testInvoice;
beforeEach(async () => {
	const company = await db.query(`INSERT INTO companies (code, name, description)
    VALUES ('apple', 'Apple Corporation', 'American Technology Company') RETURNING code, name, description`);
	const invoice = await db.query(`INSERT INTO invoices (comp_code, amt) VALUES ('apple', '200') 
    RETURNING *`);
	testCompany = company.rows[0];
	testInvoice = invoice.rows[0];
});

afterEach(async () => {
	await db.query(`DELETE FROM companies`);
	await db.query(`DELETE FROM invoices`);
});

afterAll(async () => {
	await db.end();
});

describe('GET /invoices', () => {
	test('GET a list of invoices', async () => {
		const res = await request(app).get('/invoices');
		expect(res.statusCode).toBe(200);
		expect(res.body).toEqual({
			invoices : [
				{
					add_date  : expect.anything(),
					amt       : 200,
					comp_code : 'apple',
					id        : expect.any(Number),
					paid      : false,
					paid_date : null,
				},
			],
		});
	});
});

describe('GET /invoices/:id', () => {
	test('GET a single invoice', async () => {
		const res = await request(app).get(`/invoices/${testInvoice.id}`);
		expect(res.statusCode).toBe(200);
		expect(res.body).toEqual({
			invoice : {
				add_date  : expect.anything(),
				amt       : 200,
				comp_code : 'apple',
				id        : expect.any(Number),
				paid      : false,
				paid_date : null,
			},
		});
	});

	test('Responds with 404 for invalid id', async () => {
		const res = await request(app).get(`/invoices/444`);
		expect(res.statusCode).toBe(404);
	});
});

describe('POST /invoices/', () => {
	test('Create an invoice', async () => {
		const res = await request(app).post('/invoices').send({
			comp_code : 'apple',
			amt       : 300,
		});
		expect(res.statusCode).toBe(201);
		expect(res.body).toEqual({
			invoice : {
				add_date  : expect.anything(),
				amt       : 300,
				comp_code : 'apple',
				id        : expect.any(Number),
				paid      : false,
				paid_date : null,
			},
		});
	});
});

describe('PUT /invoices/:id', () => {
	test('Update an invoice', async () => {
		const res = await request(app).put(`/invoices/${testInvoice.id}`).send({
			comp_code : 'apple',
			amt       : 300,
		});
		expect(res.statusCode).toBe(200);
		expect(res.body).toEqual({
			invoice : {
				add_date  : expect.anything(),
				amt       : 300,
				comp_code : 'apple',
				id        : expect.any(Number),
				paid      : false,
				paid_date : null,
			},
		});
	});

	test('Responds with 404 for invalid id', async () => {
		const res = await request(app).put(`/invoices/2342`).send({
			comp_code : 'apple',
			amt       : 300,
		});
		expect(res.statusCode).toBe(404);
	});
});

describe('DELETE /invoices/:id', () => {
	test('Delete and invoice', async () => {
		const res = await request(app).delete(`/invoices/${testInvoice.id}`);
		expect(res.statusCode).toBe(200);
		expect(res.body).toEqual({ status: 'deleted' });
	});

	test('Responds with a 404 for invalid id', async () => {
		const res = await request(app).delete(`/invoices/12312`);
		expect(res.statusCode).toBe(404);
	});
});
