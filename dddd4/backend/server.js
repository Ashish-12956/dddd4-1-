require('dotenv').config();
const express = require('express');
const cors = require('cors');
const neo4j = require('neo4j-driver');
const path = require('path');

// Import routes
const authRoutes = require('./routes/auth');
const productRoutes = require('./routes/products');
const cartRoutes = require('./routes/cart');
const wishlistRoutes = require('./routes/wishlist');
const purchaseRoutes = require('./routes/purchases');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '../frontend/public')));

// Neo4j connection
let driver;

try {
    driver = neo4j.driver(
        process.env.NEO4J_URI || 'bolt://localhost:7687',
        neo4j.auth.basic(
            process.env.NEO4J_USER || 'neo4j',
            process.env.NEO4J_PASSWORD || '12345678'  // Update this to your actual Neo4j password
        ),
        {
            maxConnectionLifetime: 3 * 60 * 60 * 1000,
            maxConnectionPoolSize: 50,
            connectionAcquisitionTimeout: 2 * 60 * 1000,
            disableLosslessIntegers: true
        }
    );

    // Verify connection
    driver.verifyConnectivity()
        .then(() => {
            console.log('Neo4j connection successful');
            // Make driver available globally
            app.set('neo4jDriver', driver);
        })
        .catch(error => {
            console.error('Neo4j connection error:', error);
            process.exit(1);
        });
} catch (error) {
    console.error('Failed to create Neo4j driver:', error);
    process.exit(1);
}

// Routes
app.use('/api/products', productRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/wishlist', wishlistRoutes);
app.use('/api/purchases', purchaseRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
    console.error('Error:', err);
    res.status(500).json({
        message: 'Server error',
        error: err.message,
        stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
    });
});

// Start server
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
}); 