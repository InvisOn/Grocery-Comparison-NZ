import dotenv from "dotenv"
import express from "express"
import request from "supertest"
import routes from '../src/routes/initialsetup'
import storesRouter from "../src/routes/storesRouter"
import { Pool } from "pg"
import { SortBy } from "../src/types/routes"
import { SortDirection } from "../src/types/routes"
import { category } from "../src/db/schema/category"
import { chains } from "../src/db/schema/chains"
import { drizzle } from "drizzle-orm/node-postgres"
import { price_history } from "../src/db/schema/price_history"
import { products } from "../src/db/schema/products"
import { reset, seed } from "drizzle-seed"
import { search_product } from "../src/search/search"
import { shopping_list } from "../src/db/schema/shopping_list"
import { store_products } from "../src/db/schema/store_products"
import { stores } from "../src/db/schema/stores"
import { units } from "../src/db/schema/units"
import { Server } from "http"



describe('Function tests', () => {
    dotenv.config()

    const dbUrl = process.env['TEST_DATABASE_URL']

    const pool = new Pool({
        connectionString: dbUrl
    })

    const db = drizzle(pool)
    const schema = { products, stores, store_products, chains, units, shopping_list, category, price_history }

    beforeAll(async () => {
        await reset(db, schema)
        await seed(db, schema, { seed: 42 }).refine(f => ({
            products: {
                count: 3,
                columns: {
                    brand: f.valuesFromArray({
                        values: [
                            "value"
                        ],
                    }),
                    details: f.valuesFromArray({
                        values: [
                            "description",
                        ],
                    }),
                    amount: f.valuesFromArray({
                        values: [
                            1.1,
                            2.1,
                            3.1,
                        ],
                        isUnique: true
                    }),
                    name: f.valuesFromArray({
                        values: [
                            "AMilk",
                            "BMilk",
                            "CMilk",
                        ],
                        isUnique: true
                    }),
                },
            },
            stores: {
                count: 1,
                columns: {
                    name: f.valuesFromArray({
                        values: [
                            "store"
                        ],
                    }),
                },
            },
            chains: {
                count: 1,
                columns: {
                    name: f.valuesFromArray({
                        values: [
                            "chain",
                        ],
                    }),
                },
            },
            store_products: {
                count: 3,
                columns: {
                    price: f.number({
                        minValue: 1,
                        precision: 100,
                        maxValue: 20,
                    }),
                    productID: f.valuesFromArray({
                        values: [
                            1,
                            2,
                            3,
                        ],
                        isUnique: true
                    }),
                },
            },
            category: {
                count: 1,
                columns: {
                    name: f.valuesFromArray({
                        values: [
                            "category",
                        ],
                    }),
                },
            },
            units: {
                count: 1,
                columns: {
                    name: f.valuesFromArray({
                        values: [
                            "l",
                        ],
                    }),
                },
            },
        }))
    })

    afterAll(async () => {
        await reset(db, schema)
        await pool.end()
    })

    const results = [
        {
            products: {
                id: 1,
                name: 'CMilk',
                brand: 'value',
                details: 'description',
                amount: 1.1,
                image: 'fTSUZJ7m8v',
                unitID: 1,
                categoryID: 1
            },
            store_products: { id: 2, storeID: 1, productID: 1, price: 2.47 },
            units: { id: 1, name: 'l' },
            category: { id: 1, name: 'category' },
            stores: { id: 1, name: 'store', chainID: 1 },
            chains: { id: 1, name: 'chain', image_logo: 'TWE6QX3hhNxoyXL' }
        },
        {
            products: {
                id: 2,
                name: 'AMilk',
                brand: 'value',
                details: 'description',
                amount: 2.1,
                image: 'ATO5ylEVYH7',
                unitID: 1,
                categoryID: 1
            },
            store_products: { id: 1, storeID: 1, productID: 2, price: 12.24 },
            units: { id: 1, name: 'l' },
            category: { id: 1, name: 'category' },
            stores: { id: 1, name: 'store', chainID: 1 },
            chains: { id: 1, name: 'chain', image_logo: 'TWE6QX3hhNxoyXL' }
        },
        {
            products: {
                id: 3,
                name: 'BMilk',
                brand: 'value',
                details: 'description',
                amount: 3.1,
                image: 'O8H0p74ucWkxTCCd4T',
                unitID: 1,
                categoryID: 1
            },
            store_products: { id: 3, storeID: 1, productID: 3, price: 18.38 },
            units: { id: 1, name: 'l' },
            category: { id: 1, name: 'category' },
            stores: { id: 1, name: 'store', chainID: 1 },
            chains: { id: 1, name: 'chain', image_logo: 'TWE6QX3hhNxoyXL' }
        }
    ]

    test('all results', async () => {
        return await search_product(db, '', 'price' as SortBy, 'ASC' as SortDirection).then(data => {
            expect(data).toStrictEqual(results)
        })
    })

    test('no results', async () => {
        return await search_product(db, 'SHOE', 'price' as SortBy, 'ASC' as SortDirection).then(data => {
            expect(data).toStrictEqual([])
        })
    })

    test('sorting by name DESC', async () => {
        return await search_product(db, 'MILK', 'name' as SortBy, 'DESC' as SortDirection).then(data => {
            expect(data).toStrictEqual(results.slice().sort((a, b) => a.products.name.localeCompare(b.products.name)).reverse())
        })
    })

    test('sorting by amount DESC', async () => {
        return await search_product(db, 'MILK', 'amount' as SortBy, 'DESC' as SortDirection).then(data => {
            expect(data).toStrictEqual(results.slice().reverse())
        })
    })

    test('sort by price DESC', async () => {
        return await search_product(db, 'MILK', 'price' as SortBy, 'DESC' as SortDirection).then(data => {
            expect(data).toStrictEqual(results.slice().reverse())
        })
    })

    test('sorting by name ASC', async () => {
        return await search_product(db, 'MILK', 'name' as SortBy, 'ASC' as SortDirection).then(data => {
            expect(data).toStrictEqual(results.slice().sort((a, b) => a.products.name.localeCompare(b.products.name)))
        })
    })

    test('sorting by amount ASC', async () => {
        return await search_product(db, 'MILK', 'amount' as SortBy, 'ASC' as SortDirection).then(data => {
            expect(data).toStrictEqual(results)
        })
    })

    test('sort by price ASC', async () => {
        return await search_product(db, 'MILK', 'price' as SortBy, 'ASC' as SortDirection).then(data => {
            expect(data).toStrictEqual(results)
        })
    })
})

describe('search_product get endpoint', () => {
    let server: Server

    beforeAll((done) => {
        const app = express()

        app.use('/', routes, storesRouter)
        app.use('/search_product', routes)

        server = app.listen(3000, () => {
            done();
        });
    });

    afterAll((done) => {
        server.close(() => {
            done();
        });
    });

    // TODO: close the connection to the database after the tests end to fix "Jest did not exit one second after the test run has completed." `app` uses a database connection.

    const correct_result = [{ "category": { "id": 11, "name": "Pantry" }, "chains": { "id": 2, "image_logo": "Fn5UddmJn1BlPWRArbh", "name": "New World" }, "products": { "amount": 8.23, "brand": "Value", "categoryID": 11, "details": "description 1", "id": 322, "image": "cxU9kT7bNp9fyR", "name": "Chicken Stock", "unitID": 3 }, "store_products": { "id": 342, "price": 3.29, "productID": 322, "storeID": 46 }, "stores": { "chainID": 2, "id": 46, "name": "PAK'nSAVE Hawera" }, "units": { "id": 3, "name": "l" } }, { "category": { "id": 11, "name": "Pantry" }, "chains": { "id": 2, "image_logo": "Fn5UddmJn1BlPWRArbh", "name": "New World" }, "products": { "amount": 8.23, "brand": "Value", "categoryID": 11, "details": "description 1", "id": 322, "image": "cxU9kT7bNp9fyR", "name": "Chicken Stock", "unitID": 3 }, "store_products": { "id": 718, "price": 7.36, "productID": 322, "storeID": 3 }, "stores": { "chainID": 2, "id": 3, "name": "New World Birkenhead" }, "units": { "id": 3, "name": "l" } }]

    test('should create a new post', async () => {
        const res = await request(server)
            .get('/search_product?name=chicken&sort_by=price&sort_direction=ASC')
        expect(res.body).toStrictEqual(correct_result)
    })
})
