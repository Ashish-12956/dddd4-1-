const neo4j = require('neo4j-driver');

// Neo4j connection configuration
const config = {
    uri: process.env.NEO4J_URI || 'bolt://localhost:7687',
    user: process.env.NEO4J_USER || 'neo4j',
    password: process.env.NEO4J_PASSWORD || 'password'
};

// Create a driver instance
const driver = neo4j.driver(
    config.uri,
    neo4j.auth.basic(config.user, config.password),
    {
        maxConnectionLifetime: 3 * 60 * 60 * 1000, // 3 hours
        maxConnectionPoolSize: 50,
        connectionAcquisitionTimeout: 2 * 60 * 1000, // 2 minutes
        disableLosslessIntegers: true
    }
);

// Verify the connection
async function verifyConnection() {
    try {
        const session = driver.session();
        await session.run('RETURN 1');
        await session.close();
        console.log('Successfully connected to Neo4j database');
        return true;
    } catch (error) {
        console.error('Failed to connect to Neo4j database:', error);
        return false;
    }
}

// Initialize database with required constraints and indexes
async function initializeDatabase() {
    const session = driver.session();
    try {
        // Create constraints
        await session.run('CREATE CONSTRAINT user_email IF NOT EXISTS FOR (u:User) REQUIRE u.email IS UNIQUE');
        await session.run('CREATE CONSTRAINT product_id IF NOT EXISTS FOR (p:Product) REQUIRE p.id IS UNIQUE');
        await session.run('CREATE CONSTRAINT category_name IF NOT EXISTS FOR (c:Category) REQUIRE c.name IS UNIQUE');

        // Create indexes
        await session.run('CREATE INDEX product_name IF NOT EXISTS FOR (p:Product) ON (p.name)');
        await session.run('CREATE INDEX product_category IF NOT EXISTS FOR (p:Product) ON (p.category)');
        await session.run('CREATE INDEX product_price IF NOT EXISTS FOR (p:Product) ON (p.price)');

        console.log('Database initialized successfully');
    } catch (error) {
        console.error('Failed to initialize database:', error);
        throw error;
    } finally {
        await session.close();
    }
}

// Create sample data
async function createSampleData() {
    const session = driver.session();
    try {
        // Create categories
        await session.run(`
            MERGE (c1:Category {name: "Men", description: "Men's fashion collection"})
            MERGE (c2:Category {name: "Women", description: "Women's fashion collection"})
            MERGE (c3:Category {name: "Kids", description: "Kids' fashion collection"})
        `);

        // Create sample products
        await session.run(`
            MERGE (p1:Product {
                id: "1",
                name: "Classic White T-Shirt",
                description: "Premium cotton t-shirt for men",
                price: 29.99,
                category: "Men",
                image: "men-tshirt.jpg",
                stock: 100
            })
            WITH p1
            MERGE (p2:Product {
                id: "2",
                name: "Summer Dress",
                description: "Floral summer dress for women",
                price: 49.99,
                category: "Women",
                image: "women-dress.jpg",
                stock: 50
            })
            WITH p1, p2
            MERGE (p3:Product {
                id: "3",
                name: "Kids Denim Jacket",
                description: "Stylish denim jacket for kids",
                price: 39.99,
                category: "Kids",
                image: "kids-jacket.jpg",
                stock: 75
            })
        `);

        // Create relationships between products and categories
        await session.run(`
            MATCH (p:Product {category: "Men"}), (c:Category {name: "Men"})
            MERGE (p)-[:BELONGS_TO]->(c)
            WITH p, c
            MATCH (p2:Product {category: "Women"}), (c2:Category {name: "Women"})
            MERGE (p2)-[:BELONGS_TO]->(c2)
            WITH p2, c2
            MATCH (p3:Product {category: "Kids"}), (c3:Category {name: "Kids"})
            MERGE (p3)-[:BELONGS_TO]->(c3)
        `);

        console.log('Sample data created successfully');
    } catch (error) {
        console.error('Failed to create sample data:', error);
        throw error;
    } finally {
        await session.close();
    }
}

module.exports = {
    driver,
    verifyConnection,
    initializeDatabase,
    createSampleData
}; 