process.env.NODE_ENV = 'test';

const request = require('supertest');
const app = require('../app');
const db = require('../db');

let testCompany;

beforeEach(async () => {
	const result = await db.query(`INSERT INTO companies (code, name, description)
    VALUES ('disney', 'The Walt Disney Company', 'American multinational entertainment and media conglomerate') 
    RETURNING code, name, description`);
	testCompany = result.rows[0];
});

afterEach(async () => {
	await db.query('DELETE FROM companies');
});

afterAll(async () => {
	await db.end();
});

describe('GET /companies', () => {
	test('Get a list of companies', async () => {
		const res = await request(app).get('/companies');
		expect(res.statusCode).toBe(200);
		expect(res.body).toEqual({ companies: [ testCompany ] });
	});
});

describe('GET companies/:code', () => {
	test('Get a single company', async () => {
		const res = await request(app).get(`/companies/${testCompany.code}`);
		expect(res.statusCode).toBe(200);
		expect(res.body).toEqual({ company: testCompany, invoices: [] });
	});

	test('Responds with 404 for invalid code', async () => {
		const res = await request(app).get(`/companies/samsung`);
		expect(res.statusCode).toBe(404);
	});
});

describe('POST /companies', () => {
	test('Create a company', async () => {
		const res = await request(app).post('/companies').send({
			code        : 'boosted',
			name        : 'Boosted Boards',
			description : 'American manufacturer of electric skateboards and electric scooters',
		});
		expect(res.statusCode).toBe(201);
		expect(res.body).toEqual({
			company : {
				code        : 'boosted',
				name        : 'Boosted Boards',
				description : 'American manufacturer of electric skateboards and electric scooters',
			},
		});
	});
});

describe('PUT /companies/:code', () => {
	test('Update a single company', async () => {
		const res = await request(app).put(`/companies/${testCompany.code}`).send({
			name        : 'The Walt Disney Company',
			description :
				'American multinational entertainment and media conglomerate headquartered at the Walt Disney Studios complex in Burbank, California.',
		});
		expect(res.statusCode).toBe(200);
		expect(res.body).toEqual({
			company : {
				code        : testCompany.code,
				name        : 'The Walt Disney Company',
				description :
					'American multinational entertainment and media conglomerate headquartered at the Walt Disney Studios complex in Burbank, California.',
			},
		});
	});

	test('Responds with 404 for invalid code', async () => {
		const res = await request(app).put(`/companies/samsung`).send({
			name        : 'The Walt Disney Company',
			description :
				'American multinational entertainment and media conglomerate headquartered at the Walt Disney Studios complex in Burbank, California.',
		});
		expect(res.statusCode).toBe(404);
	});
});

describe('DELETE /companies/:code', () => {
	test('Delete a company', async () => {
		const res = await request(app).delete(`/companies/${testCompany.code}`);
		expect(res.statusCode).toBe(200);
		expect(res.body).toEqual({ status: 'deleted' });
	});

	test('Responds with 404 for invalid code', async () => {
		const res = await request(app).delete(`/companies/samsung`);
		expect(res.statusCode).toBe(404);
	});
});
