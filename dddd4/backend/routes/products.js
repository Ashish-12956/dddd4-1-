const express = require('express');
const router = express.Router();
const neo4j = require('neo4j-driver');
const auth = require('../middleware/auth');

// Get Neo4j driver from app
const getDriver = (req) => {
    return req.app.get('neo4jDriver');
};

// Sample products data (50+ realistic products)
const products = [
    { id: "1", name: "Van Heusen Men's Solid Regular Fit T-Shirt", price: 499, category: "Men", image: "https://images.unsplash.com/photo-1512436991641-6745cdb1723f?auto=format&fit=crop&w=400&q=80", description: "Solid regular fit polo t-shirt." },
    { id: "2", name: "Allen Solly Men's Cotton Regular Fit Polo T-Shirt", price: 549, category: "Men", image: "https://images.unsplash.com/photo-1524253482453-3fed8d2fe12b?auto=format&fit=crop&w=400&q=80", description: "Cotton regular fit polo t-shirt." },
    { id: "3", name: "XENOVAURBAN Unisex Regular Cotton Combo of 2 T-Shirts", price: 699, category: "Men", image: "https://images.unsplash.com/photo-1515378791036-0648a3ef77b2?auto=format&fit=crop&w=400&q=80", description: "Combo pack of 2 regular cotton t-shirts." },
    { id: "4", name: "Levi's Men's Graphic Print T-Shirt", price: 599, category: "Men", image: "https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?auto=format&fit=crop&w=400&q=80", description: "Trendy graphic print t-shirt for men." },
    { id: "5", name: "H&M Women's Basic Cotton T-Shirt", price: 399, category: "Women", image: "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=400&q=80", description: "Soft cotton t-shirt for women." },
    { id: "6", name: "CREEK Retro Oval Sunglasses for Women & Men", price: 299, category: "Men", image: "https://images.unsplash.com/photo-1519125323398-675f0ddb6308?auto=format&fit=crop&w=400&q=80", description: "Trendy retro oval sunglasses." },
    { id: "7", name: "Puma Unisex's Cap", price: 349, category: "Men", image: "https://images.unsplash.com/photo-1519681393784-d120267933ba?auto=format&fit=crop&w=400&q=80", description: "Unisex cap for all seasons." },
    { id: "8", name: "Fossil Women's Leather Wallet", price: 1299, category: "Women", image: "https://images.unsplash.com/photo-1465101178521-c1a9136a3fd8?auto=format&fit=crop&w=400&q=80", description: "Premium leather wallet for women." },
    { id: "9", name: "Ray-Ban Aviator Sunglasses", price: 2999, category: "Men", image: "https://images.unsplash.com/photo-1465101046530-73398c7f28ca?auto=format&fit=crop&w=400&q=80", description: "Classic aviator sunglasses." },
    { id: "10", name: "Titan Men's Analog Watch", price: 1999, category: "Men", image: "https://images.unsplash.com/photo-1516574187841-cb9cc2ca948b?auto=format&fit=crop&w=400&q=80", description: "Elegant analog watch for men." },
    { id: "11", name: "Boldfit for Men Slim Fit Joggers", price: 799, category: "Men", image: "https://images.unsplash.com/photo-1512436991641-6745cdb1723f?auto=format&fit=crop&w=400&q=80", description: "Slim fit joggers for running and gym." },
    { id: "12", name: "HRX Women's Track Pants", price: 699, category: "Women", image: "https://images.unsplash.com/photo-1516763296045-6b2c1f4176c4?auto=format&fit=crop&w=400&q=80", description: "Comfortable track pants for women." },
    { id: "13", name: "Nike Kids' Joggers", price: 899, category: "Kids", image: "https://images.unsplash.com/photo-1519415943484-cfb9e1b2b1c2?auto=format&fit=crop&w=400&q=80", description: "Stylish joggers for kids." },
    { id: "14", name: "CHKOKKO Men Cotton Gym Tank Tops Sleeveless", price: 299, category: "Men", image: "https://images.unsplash.com/photo-1519864600265-abb23847ef2c?auto=format&fit=crop&w=400&q=80", description: "Cotton gym tank top sleeveless." },
    { id: "15", name: "Adidas Women's Sports Tank Top", price: 499, category: "Women", image: "https://images.unsplash.com/photo-1519125323398-675f0ddb6308?auto=format&fit=crop&w=400&q=80", description: "Breathable sports tank top for women." },
    { id: "16", name: "The Pant Project Luxury PV Lycra Stretchable Formal Pant", price: 1199, category: "Men", image: "https://images.unsplash.com/photo-1516763296045-6b2c1f4176c4?auto=format&fit=crop&w=400&q=80", description: "Luxury stretchable formal pants." },
    { id: "17", name: "Levi's Women's Skinny Jeans", price: 1499, category: "Women", image: "https://images.unsplash.com/photo-1519415943484-cfb9e1b2b1c2?auto=format&fit=crop&w=400&q=80", description: "Classic skinny jeans for women." },
    { id: "18", name: "Pepe Jeans Boys' Slim Fit Jeans", price: 999, category: "Kids", image: "https://images.unsplash.com/photo-1519864600265-abb23847ef2c?auto=format&fit=crop&w=400&q=80", description: "Trendy slim fit jeans for boys." },
    { id: "19", name: "Majestic Man Men's Cotton Regular Fit Casual Kurta", price: 699, category: "Men", image: "https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?auto=format&fit=crop&w=400&q=80", description: "Cotton regular fit casual kurta." },
    { id: "20", name: "Biba Women's Printed Kurta", price: 899, category: "Women", image: "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=400&q=80", description: "Beautiful printed kurta for women." },
    { id: "21", name: "Nike Men's Running Shoes", price: 2499, category: "Men", image: "https://images.unsplash.com/photo-1517260911205-8c6b8b6b7d5a?auto=format&fit=crop&w=400&q=80", description: "Comfortable running shoes for men." },
    { id: "22", name: "Adidas Women's Sneakers", price: 2299, category: "Women", image: "https://images.unsplash.com/photo-1519864600265-abb23847ef2c?auto=format&fit=crop&w=400&q=80", description: "Trendy sneakers for women." },
    { id: "23", name: "Puma Kids' Sports Shoes", price: 1599, category: "Kids", image: "https://images.unsplash.com/photo-1519125323398-675f0ddb6308?auto=format&fit=crop&w=400&q=80", description: "Durable sports shoes for kids." },
    { id: "24", name: "AND Women's Floral Dress", price: 1299, category: "Women", image: "https://images.unsplash.com/photo-1512436991641-6745cdb1723f?auto=format&fit=crop&w=400&q=80", description: "Floral print dress for women." },
    { id: "25", name: "Biba Girls' Party Dress", price: 1099, category: "Kids", image: "https://images.unsplash.com/photo-1519125323398-675f0ddb6308?auto=format&fit=crop&w=400&q=80", description: "Cute party dress for girls." },
    { id: "26", name: "Levi's Men's Denim Jacket", price: 1999, category: "Men", image: "https://images.unsplash.com/photo-1465101046530-73398c7f28ca?auto=format&fit=crop&w=400&q=80", description: "Classic denim jacket for men." },
    { id: "27", name: "ONLY Women's Bomber Jacket", price: 1799, category: "Women", image: "https://images.unsplash.com/photo-1519681393784-d120267933ba?auto=format&fit=crop&w=400&q=80", description: "Trendy bomber jacket for women." },
    { id: "28", name: "Roadster Men's Solid Hoodie", price: 899, category: "Men", image: "https://images.unsplash.com/photo-1515378791036-0648a3ef77b2?auto=format&fit=crop&w=400&q=80", description: "Solid color hoodie for men." },
    { id: "29", name: "H&M Women's Zip-Up Hoodie", price: 999, category: "Women", image: "https://images.unsplash.com/photo-1512436991641-6745cdb1723f?auto=format&fit=crop&w=400&q=80", description: "Comfortable zip-up hoodie for women." },
    { id: "30", name: "U.S. Polo Assn. Men's Pullover Sweater", price: 1199, category: "Men", image: "https://images.unsplash.com/photo-1519125323398-675f0ddb6308?auto=format&fit=crop&w=400&q=80", description: "Warm pullover sweater for men." },
    { id: "31", name: "MANGO Women's Knit Sweater", price: 1399, category: "Women", image: "https://images.unsplash.com/photo-1516763296045-6b2c1f4176c4?auto=format&fit=crop&w=400&q=80", description: "Soft knit sweater for women." },
    { id: "32", name: "Puma Men's Sports Shorts", price: 499, category: "Men", image: "https://images.unsplash.com/photo-1519415943484-cfb9e1b2b1c2?auto=format&fit=crop&w=400&q=80", description: "Lightweight sports shorts for men." },
    { id: "33", name: "H&M Women's Denim Shorts", price: 599, category: "Women", image: "https://images.unsplash.com/photo-1519864600265-abb23847ef2c?auto=format&fit=crop&w=400&q=80", description: "Trendy denim shorts for women." },
    { id: "34", name: "ONLY Women's A-Line Skirt", price: 799, category: "Women", image: "https://images.unsplash.com/photo-1465101178521-c1a9136a3fd8?auto=format&fit=crop&w=400&q=80", description: "A-line skirt for women." },
    { id: "35", name: "Biba Girls' Printed Skirt", price: 499, category: "Kids", image: "https://images.unsplash.com/photo-1519681393784-d120267933ba?auto=format&fit=crop&w=400&q=80", description: "Printed skirt for girls." },
    { id: "36", name: "Wildcraft Unisex Backpack", price: 999, category: "Men", image: "https://images.unsplash.com/photo-1519125323398-675f0ddb6308?auto=format&fit=crop&w=400&q=80", description: "Durable backpack for all purposes." },
    { id: "37", name: "Caprese Women's Tote Bag", price: 1499, category: "Women", image: "https://images.unsplash.com/photo-1465101046530-73398c7f28ca?auto=format&fit=crop&w=400&q=80", description: "Stylish tote bag for women." },
    { id: "38", name: "Fastrack Men's Digital Watch", price: 1299, category: "Men", image: "https://images.unsplash.com/photo-1516574187841-cb9cc2ca948b?auto=format&fit=crop&w=400&q=80", description: "Trendy digital watch for men." },
    { id: "39", name: "Timex Women's Analog Watch", price: 1599, category: "Women", image: "https://images.unsplash.com/photo-1465101178521-c1a9136a3fd8?auto=format&fit=crop&w=400&q=80", description: "Elegant analog watch for women." },
    { id: "40", name: "Vincent Chase Unisex Sunglasses", price: 799, category: "Men", image: "https://images.unsplash.com/photo-1519125323398-675f0ddb6308?auto=format&fit=crop&w=400&q=80", description: "UV-protected sunglasses for all." },
    { id: "41", name: "Ray-Ban Kids' Sunglasses", price: 999, category: "Kids", image: "https://images.unsplash.com/photo-1519681393784-d120267933ba?auto=format&fit=crop&w=400&q=80", description: "Trendy sunglasses for kids." },
    { id: "42", name: "U.S. Polo Assn. Men's Striped T-Shirt", price: 599, category: "Men", image: "https://images.unsplash.com/photo-1524253482453-3fed8d2fe12b?auto=format&fit=crop&w=400&q=80", description: "Striped t-shirt for men." },
    { id: "43", name: "H&M Women's V-Neck T-Shirt", price: 449, category: "Women", image: "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=400&q=80", description: "V-neck t-shirt for women." },
    { id: "44", name: "Global Desi Women's Maxi Dress", price: 1599, category: "Women", image: "https://images.unsplash.com/photo-1512436991641-6745cdb1723f?auto=format&fit=crop&w=400&q=80", description: "Maxi dress for women." },
    { id: "45", name: "Biba Girls' Ethnic Dress", price: 1199, category: "Kids", image: "https://images.unsplash.com/photo-1519125323398-675f0ddb6308?auto=format&fit=crop&w=400&q=80", description: "Ethnic dress for girls." },
    { id: "46", name: "Puma Men's Printed Hoodie", price: 1099, category: "Men", image: "https://images.unsplash.com/photo-1519864600265-abb23847ef2c?auto=format&fit=crop&w=400&q=80", description: "Printed hoodie for men." },
    { id: "47", name: "ONLY Women's Cropped Hoodie", price: 899, category: "Women", image: "https://images.unsplash.com/photo-1516763296045-6b2c1f4176c4?auto=format&fit=crop&w=400&q=80", description: "Cropped hoodie for women." },
    { id: "48", name: "Pepe Jeans Men's Chinos", price: 1299, category: "Men", image: "https://images.unsplash.com/photo-1519415943484-cfb9e1b2b1c2?auto=format&fit=crop&w=400&q=80", description: "Comfortable chinos for men." },
    { id: "49", name: "ONLY Women's Palazzo Pants", price: 999, category: "Women", image: "https://images.unsplash.com/photo-1519125323398-675f0ddb6308?auto=format&fit=crop&w=400&q=80", description: "Palazzo pants for women." },
    { id: "50", name: "Wildcraft Unisex Duffel Bag", price: 1199, category: "Men", image: "https://images.unsplash.com/photo-1465101178521-c1a9136a3fd8?auto=format&fit=crop&w=400&q=80", description: "Spacious duffel bag for travel." }
];

// Initialize products (for development)
router.post('/init', async (req, res) => {
    let session;
    try {
        const driver = getDriver(req);
        if (!driver) {
            throw new Error('Neo4j driver not initialized');
        }

        session = driver.session();

        // Clear existing data
        console.log('Clearing existing data...');
        await session.run('MATCH (n) DETACH DELETE n');

        // Create products in Neo4j
        console.log('Creating products...');
        for (const product of products) {
            console.log(`Creating product: ${product.name}`);

            // Create product node with all properties
            await session.run(
                `CREATE (p:Product {
                    id: $id,
                    name: $name,
                    price: $price,
                    description: $description,
                    category: $category,
                    imageUrl: $image,
                    tags: [$category]
                })`,
                {
                    id: product.id,
                    name: product.name,
                    price: product.price,
                    description: product.description,
                    category: product.category,
                    image: product.image
                }
            );

            // Create category node and relationship
            await session.run(
                `MATCH (p:Product {id: $id})
                 MERGE (c:Category {name: $category})
                 CREATE (p)-[:BELONGS_TO]->(c)`,
                { id: product.id, category: product.category }
            );

            // Create price relationship
            await session.run(
                `MATCH (p:Product {id: $id})
                 MERGE (pr:Price {value: $price})
                 CREATE (p)-[:HAS_PRICE]->(pr)`,
                { id: product.id, price: product.price }
            );
        }

        // Create relationships between similar products
        console.log('Creating product relationships...');
        await session.run(
            `MATCH (p1:Product), (p2:Product)
             WHERE p1.id < p2.id AND p1.category = p2.category
             CREATE (p1)-[:SIMILAR_TO]->(p2)`
        );

        // Verify the creation
        const result = await session.run('MATCH (p:Product) RETURN count(p) as count');
        const countValue = result.records[0].get('count');
        const count = typeof countValue === 'object' && typeof countValue.toNumber === 'function'
            ? countValue.toNumber()
            : countValue;

        console.log(`Successfully created ${count} products`);

        res.json({
            message: 'Products initialized successfully',
            count: count
        });
    } catch (error) {
        console.error('Error initializing products:', error);
        res.status(500).json({
            message: 'Server error',
            error: error.message,
            stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
        });
    } finally {
        if (session) {
            await session.close();
        }
    }
});

// Get product by ID
router.get('/:id', (req, res) => {
    const product = products.find(p => p.id === req.params.id);
    if (!product) return res.status(404).json({ message: 'Product not found' });
    res.json(product);
});

// Get all products
router.get('/', async (req, res) => {
    let session;
    try {
        const driver = getDriver(req);
        if (!driver) {
            throw new Error('Neo4j driver not initialized');
        }

        session = driver.session();
        const result = await session.run('MATCH (p:Product) RETURN p');
        const products = result.records.map(record => record.get('p').properties);
        res.json(products);
    } catch (error) {
        console.error('Error fetching products:', error);
        res.status(500).json({ message: 'Server error' });
    } finally {
        if (session) {
            await session.close();
        }
    }
});

// Get products by category
router.get('/category/:category', async (req, res) => {
    let session;
    try {
        const driver = getDriver(req);
        if (!driver) {
            throw new Error('Neo4j driver not initialized');
        }

        session = driver.session();
        const result = await session.run(
            `MATCH (p:Product)-[:BELONGS_TO]->(c:Category {name: $category})
             RETURN p`,
            { category: req.params.category }
        );

        const products = result.records.map(record => record.get('p').properties);
        res.json(products);
    } catch (error) {
        console.error('Error fetching products by category:', error);
        res.status(500).json({ message: 'Server error' });
    } finally {
        if (session) {
            await session.close();
        }
    }
});

// Get all products with optional category filter
router.get('/all', async (req, res) => {
    try {
        const { category } = req.query;
        const driver = getDriver(req);
        if (!driver) {
            throw new Error('Neo4j driver not initialized');
        }

        let session;
        let query = 'MATCH (p:Product)';
        const params = {};

        if (category) {
            query += ' WHERE p.category = $category';
            params.category = category;
        }

        query += ' RETURN p ORDER BY p.name';

        session = driver.session();
        const result = await session.run(query, params);
        const products = result.records.map(record => record.get('p').properties);

        res.json(products);
    } catch (error) {
        console.error('Error fetching products:', error);
        res.status(500).json({ message: 'Server error' });
    } finally {
        if (session) {
            await session.close();
        }
    }
});

// Get product recommendations
router.get('/:id/recommendations', async (req, res) => {
    try {
        const { id } = req.params;
        const driver = getDriver(req);
        if (!driver) {
            throw new Error('Neo4j driver not initialized');
        }

        const session = driver.session();

        // Get recommendations based on similar categories and user behavior
        const result = await session.run(
            `MATCH (p:Product {id: $id})
             MATCH (p)-[:BELONGS_TO]->(c:Category)
             MATCH (other:Product)-[:BELONGS_TO]->(c)
             WHERE other.id <> $id
             WITH other, count(*) as commonCategories
             MATCH (u:User)-[:PURCHASED|:LIKES]->(other)
             WITH other, commonCategories, count(u) as userCount
             RETURN other
             ORDER BY commonCategories DESC, userCount DESC
             LIMIT 5`,
            { id }
        );

        const recommendations = result.records.map(record => record.get('other').properties);
        res.json(recommendations);
    } catch (error) {
        console.error('Error fetching recommendations:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Search products
router.get('/search/:query', async (req, res) => {
    try {
        const { query } = req.params;
        const driver = getDriver(req);
        if (!driver) {
            throw new Error('Neo4j driver not initialized');
        }

        const session = driver.session();

        const result = await session.run(
            `MATCH (p:Product)
             WHERE p.name CONTAINS $query 
             OR p.description CONTAINS $query
             OR p.category CONTAINS $query
             RETURN p
             ORDER BY p.name`,
            { query: query.toLowerCase() }
        );

        const products = result.records.map(record => record.get('p').properties);
        res.json(products);
    } catch (error) {
        console.error('Error searching products:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router; 