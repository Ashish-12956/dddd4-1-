const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');

// Get Neo4j driver from app
const getDriver = (req) => req.app.get('neo4jDriver');

// Create a purchase
router.post('/', auth, async (req, res) => {
    try {
        const { productId, quantity } = req.body;
        const driver = getDriver(req);
        if (!driver) throw new Error('Neo4j driver not initialized');
        const session = driver.session();

        // Get product details
        const productResult = await session.run(
            'MATCH (p:Product {id: $productId}) RETURN p',
            { productId: String(productId) }
        );

        if (productResult.records.length === 0) {
            return res.status(404).json({ message: 'Product not found' });
        }

        const product = productResult.records[0].get('p').properties;
        const totalAmount = product.price * quantity;

        // Create purchase relationship
        await session.run(
            `MATCH (u:User {id: $userId})
             MATCH (p:Product {id: $productId})
             CREATE (u)-[r:PURCHASED {
                quantity: $quantity,
                totalAmount: $totalAmount,
                purchaseDate: datetime()
             }]->(p)`,
            {
                userId: req.user.userId,
                productId: String(productId),
                quantity: quantity,
                totalAmount: totalAmount
            }
        );

        res.status(201).json({
            message: 'Purchase successful',
            totalAmount: totalAmount,
            product: product
        });

        await session.close();
    } catch (error) {
        console.error('Error creating purchase:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Get user's purchase history
router.get('/history', auth, async (req, res) => {
    try {
        const driver = getDriver(req);
        if (!driver) throw new Error('Neo4j driver not initialized');
        const session = driver.session();

        const result = await session.run(
            `MATCH (u:User {id: $userId})-[r:PURCHASED]->(p:Product)
             RETURN p, r
             ORDER BY r.purchaseDate DESC`,
            { userId: req.user.userId }
        );

        const purchases = result.records.map(record => ({
            product: record.get('p').properties,
            purchaseDetails: record.get('r').properties
        }));

        res.json(purchases);
        await session.close();
    } catch (error) {
        console.error('Error fetching purchase history:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router; 