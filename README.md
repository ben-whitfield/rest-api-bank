# Eagle Bank API

A secure, modular RESTful API for banking operations, written in **Node.js** with **TypeScript**.

## Key Technologies

- **Node.js** & **Express.js** – Fast, minimalist web framework for building REST APIs.
- **TypeScript** – Strongly-typed JavaScript for safer, more maintainable code.
- **MongoDB** & **Mongoose** – NoSQL database with elegant object modeling.
- **Jest** – Comprehensive unit testing framework.

## Project Structure & Patterns

- **Layered Architecture**:  
  - **Routes** (`src/routes/`) – Define endpoints and apply middleware.
  - **Controllers** (`src/controllers/`) – Handle business logic and request validation.
  - **Data Access Layer** (`src/db/`) – Encapsulate all database operations using Mongoose models.
  - **Middleware** (`src/middleware/`) – Authentication, authorization, and other cross-cutting concerns.

- **Design Patterns Used**:
  - **Model-View-Controller (MVC)** (without View): Clear separation between data models, controllers, and routing.
  - **Data Access Object (DAO)**: Abstracts database logic for each resource.
  - **Middleware (Chain of Responsibility)**: Composable request processing for authentication and authorization.
  - **Single Responsibility Principle**: Each module has a focused purpose.

## Features

- **User Management**: Register, authenticate, and manage users securely.
- **Account Management**: Create, fetch, update, and delete bank accounts.
- **Transaction Management**: Record and list transactions per account.
- **Authentication**: JWT-based, with session token validation.
- **Authorization**: Ensures users can only access their own accounts and transactions.
- **Unit Testing**: Jest-based tests for controllers, routes, and middleware.

## Data Storage

- **MongoDB** for persistent storage.
- **Mongoose** for schema definition and data validation.

## Getting Started

1. **Install dependencies**  
   ```bash
   npm install
   ```

2. **Configure environment**  
   - Set `SECRET` and MongoDB connection string in your environment variables.

3. **Run the API**  
   ```bash
   npm start
   ```

4. **Run tests**  
   ```bash
   npm test
   ```

## API Documentation

- See [`src/documentation/openapi.yaml`](src/documentation/openapi.yaml) for the full OpenAPI specification.

---

**Eagle Bank API** is designed for extensibility, security, and clarity, following industry best practices and patterns for modern backend development.