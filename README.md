# 🏷️ **DON KAMPO API**

Application developed by **Andres Betancourt**

## 🛠️ Recommended IDE

For a better development experience, we recommend the following tools:

- [**Visual Studio Code (VSCode)**](https://code.visualstudio.com/) 🖥️
- [**ESLint**](https://marketplace.visualstudio.com/items?itemName=dbaeumer.vscode-eslint) 📜
- [**Prettier**](https://marketplace.visualstudio.com/items?itemName=esbenp.prettier-vscode) 🎨

## 🚀 Project Setup

### Prerequisites

Before starting the project, make sure you have the following installed:

- [**Node.js**](https://nodejs.org/) (v14.x or later)
- [**PostgreSQL**](https://www.postgresql.org/) (for the database)
- [**AWS S3 account**](https://aws.amazon.com/s3/) (for file storage)

### Installation

To install the required project dependencies, run the following command:

```bash
npm install
```

This will install all necessary dependencies, including the backend and any other required libraries.

### Environment Variables

Make sure to create a `.env` file in the root of your project and add the following environment variables:

```plaintext
# Database Configuration
DB_HOST=your-database-host
DB_PORT=your-database-port
DB_USER=your-database-username
DB_PASSWORD=your-database-password
DB_NAME=your-database-name

# AWS Configuration
AWS_ACCESS_KEY_ID=your-aws-access-key
AWS_SECRET_ACCESS_KEY=your-aws-secret-key
AWS_REGION=your-aws-region
AWS_BUCKET_NAME=your-s3-bucket-name

# JWT Secret
JWT_SECRET=your-secret-key

# Other optional configuration (adjust as needed)
PORT=5000
```

### Run the Application in Development Mode

To start the application in development mode, use the following command:

```bash
npm run dev
```

This will start the Express server and make the API accessible locally (usually at `http://localhost:5000`).

### Run the Application in Production Mode

To build and deploy the project for production, use the following commands based on your operating system:

```bash
# Windows
npm run build:win

# macOS
npm run build:mac

# Linux
npm run build:linux
```

This will bundle your application for the specific operating system, optimizing it for production.

## Web Development Mode

If you're working on the front-end (web) part of the project, follow these steps:

### Navigate to the Web Directory

```bash
# For Windows
cd web
```

### Start the Web Development Server

To run the development server for the front-end (if you have a separate web directory):

```bash
# For Windows
npm run dev
```

This will start the front-end application in development mode and make it accessible in your browser.

## API Endpoints

The backend provides a REST API with the following main routes:

### **User Management**

- `GET /api/users`: Get all users
- `GET /api/users/:id`: Get a user by ID
- `POST /api/users`: Create a new user
- `PUT /api/users/:id`: Update user information
- `DELETE /api/users/:id`: Delete a user

### **Product Management**

- `GET /api/products`: Get all products
- `GET /api/products/:id`: Get a product by ID
- `POST /api/products`: Create a new product
- `PUT /api/products/:id`: Update a product
- `DELETE /api/products/:id`: Delete a product

### **Order Management**

- `GET /api/orders`: Get all orders
- `GET /api/orders/:id`: Get an order by ID
- `POST /api/orders`: Create a new order
- `PUT /api/orders/:id`: Update order details
- `DELETE /api/orders/:id`: Delete an order

### **Shipping Management**

- `GET /api/shipping`: Get all shipping details
- `GET /api/shipping/:id`: Get shipping details by ID
- `POST /api/shipping`: Create a new shipping entry
- `PUT /api/shipping/:id`: Update shipping details
- `DELETE /api/shipping/:id`: Delete shipping details

### **Authentication**

- `POST /api/login`: Login endpoint to authenticate users
- `POST /api/register`: Register a new user

## Technologies Used

- **Backend**: Node.js, Express.js
- **Database**: PostgreSQL
- **Cloud Storage**: AWS S3 for storing product images
- **Authentication**: JWT (JSON Web Tokens) for securing API endpoints
- **File Upload**: Multer for handling file uploads (e.g., product images)
- **CORS**: To allow cross-origin requests
- **Logging**: Morgan for logging HTTP requests

## Development Tools

- **ESLint**: Linter to ensure consistent coding style
- **Prettier**: Code formatter for consistent formatting
- **Jest**: Testing framework for writing and running tests (optional, but recommended)

## Test the Application

You can test the application by using tools like **Postman** or **Insomnia** to send HTTP requests to the API endpoints. You can also write unit and integration tests using Jest or Mocha if desired.

## Contributing

If you'd like to contribute to this project, follow these steps:

1. Fork the repository
2. Create a new branch (`git checkout -b feature-name`)
3. Commit your changes (`git commit -m 'Add new feature'`)
4. Push to your forked repository (`git push origin feature-name`)
5. Open a Pull Request with a description of your changes

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Contact

For any questions or feedback, please contact **Andres Betancourt** at [info@cre8tive.pro].

