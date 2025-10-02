# Fashion Clothing E-commerce Website

A modern, responsive e-commerce website for fashion clothing built with Node.js, Express, Neo4j, and vanilla JavaScript.

## Features

- **User Authentication**
  - Login/Signup functionality
  - JWT-based authentication
  - User profile management

- **Product Management**
  - Product listing with categories
  - Product search functionality
  - Product filtering and sorting
  - Product recommendations

- **Shopping Experience**
  - Shopping cart functionality
  - Wishlist management
  - Responsive product grid
  - Product details view

- **UI/UX Features**
  - Dark/Light mode toggle
  - Toast notifications
  - Loading states
  - Responsive design
  - Modern and clean interface

## Tech Stack

- **Frontend**
  - HTML5
  - CSS3 (with Bootstrap 5)
  - Vanilla JavaScript
  - Local Storage for state management

- **Backend**
  - Node.js
  - Express.js
  - Neo4j Database
  - JWT Authentication

## Project Structure

```
fashion-clothing/
├── backend/
│   ├── routes/
│   │   ├── auth.js
│   │   ├── products.js
│   │   ├── cart.js
│   │   └── wishlist.js
│   └── server.js
├── frontend/
│   ├── public/
│   │   ├── css/
│   │   │   └── style.css
│   │   ├── js/
│   │   │   ├── app.js
│   │   │   ├── auth.js
│   │   │   ├── cart.js
│   │   │   ├── products.js
│   │   │   ├── wishlist.js
│   │   │   └── utils.js
│   │   └── index.html
│   └── assets/
│       └── images/
└── README.md
```

## Setup Instructions

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd fashion-clothing
   ```

2. **Install dependencies**
   ```bash
   # Install backend dependencies
   cd backend
   npm install

   # Install frontend dependencies (if any)
   cd ../frontend
   npm install
   ```

3. **Configure Neo4j**
   - Install Neo4j Desktop or use Neo4j Aura
   - Create a new database
   - Update the connection details in `backend/server.js`

4. **Set up environment variables**
   Create a `.env` file in the backend directory:
   ```
   PORT=3000
   NEO4J_URI=bolt://localhost:7687
   NEO4J_USER=neo4j
   NEO4J_PASSWORD=your-password
   JWT_SECRET=your-secret-key
   ```

5. **Start the application**
   ```bash
   # Start backend server
   cd backend
   npm start

   # Start frontend server (if using a development server)
   cd ../frontend
   npm start
   ```

6. **Access the application**
   Open your browser and navigate to `http://localhost:3000`

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/verify` - Verify JWT token

### Products
- `GET /api/products` - Get all products
- `GET /api/products/:id` - Get product by ID
- `GET /api/products/search/:query` - Search products
- `GET /api/products/:id/recommendations` - Get product recommendations

### Cart
- `GET /api/cart` - Get user's cart
- `POST /api/cart` - Add item to cart
- `DELETE /api/cart/:productId` - Remove item from cart
- `DELETE /api/cart` - Clear cart

### Wishlist
- `GET /api/wishlist` - Get user's wishlist
- `POST /api/wishlist` - Add item to wishlist
- `DELETE /api/wishlist/:productId` - Remove item from wishlist
- `DELETE /api/wishlist` - Clear wishlist

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- Bootstrap 5 for the UI components
- Neo4j for the graph database
- Express.js for the backend framework 