Mini E-Commerce - Minimal Runnable ZIP

This is a small demo e-commerce app that runs locally without an external DB.
It includes:
- Product browsing
- Cart stored in localStorage
- User register/login (JWT stored in localStorage)
- Simulated checkout (orders saved to server JSON)

How to run:
1. Extract zip
2. Install Node.js
3. cd ecommerce/server
4. npm install
5. npm start
6. Open http://localhost:5000

Notes:
- In production, use a real database (MongoDB), secure JWT secret, HTTPS, and a payment gateway (Stripe/PayPal).
