const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');

// Middleware to verify JWT token
const auth = async (req, res, next) => {
    try {
        const token = req.header('Authorization').replace('Bearer ', '');
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
        req.userId = decoded.userId;
        next();
    } catch (error) {
        res.status(401).json({ message: 'Please authenticate' });
    }
};

const getDriver = (req) => req.app.get('neo4jDriver');

// Get user's wishlist
router.get('/', auth, async (req, res) => {
    try {
        const driver = getDriver(req);
        if (!driver) throw new Error('Neo4j driver not initialized');
        const session = driver.session();

        const result = await session.run(
            `MATCH (u:User {id: $userId})-[:LIKES]->(p:Product)
             RETURN p`,
            { userId: req.userId }
        );

        const wishlistItems = result.records.map(record => record.get('p').properties);
        res.json(wishlistItems);
        await session.close();
    } catch (error) {
        console.error('Error fetching wishlist:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Add product to wishlist
router.post('/:productId', auth, async (req, res) => {
    try {
        const { productId } = req.params;
        const driver = getDriver(req);
        if (!driver) throw new Error('Neo4j driver not initialized');
        const session = driver.session();

        // Check if product exists
        const productCheck = await session.run(
            'MATCH (p:Product {id: $productId}) RETURN p',
            { productId: String(productId) }
        );

        if (productCheck.records.length === 0) {
            return res.status(404).json({ message: 'Product not found' });
        }

        // Add to wishlist
        await session.run(
            `MERGE (u:User {id: $userId})
             WITH u
             MATCH (p:Product {id: $productId})
             MERGE (u)-[:LIKES]->(p)`,
            { userId: req.userId, productId: String(productId) }
        );

        res.json({ message: 'Product added to wishlist' });
        await session.close();
    } catch (error) {
        console.error('Error adding to wishlist:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Remove product from wishlist
router.delete('/:productId', auth, async (req, res) => {
    try {
        const { productId } = req.params;
        const driver = getDriver(req);
        if (!driver) throw new Error('Neo4j driver not initialized');
        const session = driver.session();

        await session.run(
            `MATCH (u:User {id: $userId})-[r:LIKES]->(p:Product {id: $productId})
             DELETE r`,
            { userId: req.userId, productId: String(productId) }
        );

        res.json({ message: 'Product removed from wishlist' });
        await session.close();
    } catch (error) {
        console.error('Error removing from wishlist:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Clear wishlist
router.delete('/', auth, async (req, res) => {
    try {
        const driver = getDriver(req);
        if (!driver) throw new Error('Neo4j driver not initialized');
        const session = driver.session();

        await session.run(
            `MATCH (u:User {id: $userId})-[r:LIKES]->(p:Product)
             DELETE r`,
            { userId: req.userId }
        );

        res.json({ message: 'Wishlist cleared' });
        await session.close();
    } catch (error) {
        console.error('Error clearing wishlist:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router; 