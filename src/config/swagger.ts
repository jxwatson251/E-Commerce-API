import swaggerJSDoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';
import { Express } from 'express';

const options: swaggerJSDoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'E-commerce API',
      version: '1.0.0',
      description: 'A comprehensive e-commerce backend API with authentication, product management, and currency conversion features.',
      contact: {
        name: 'API Support',
        email: 'support@ecommerce-api.com'
      }
    },
    servers: [
      { 
        url: 'http://localhost:5000',
        description: 'Development server'
      }
    ],
    tags: [
      {
        name: 'Authentication',
        description: 'User registration, login, and profile management'
      },
      {
        name: 'Products',
        description: 'Product CRUD operations'
      },
      {
        name: 'Currency',
        description: 'Currency conversion for products'
      }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'Enter JWT token in the format: Bearer <token>'
        }
      }
    }
  },
  apis: ['./src/routes/*.ts']
};

const swaggerSpec = swaggerJSDoc(options);

export function setupSwagger(app: Express): void {
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
    explorer: true,
    customCss: '.swagger-ui .topbar { display: none }',
    customSiteTitle: 'E-commerce API Documentation'
  }));
  
  app.get('/api-docs.json', (req, res) => {
    res.setHeader('Content-Type', 'application/json');
    res.send(swaggerSpec);
  });
  
  console.log('📚 Swagger documentation available at http://localhost:5000/api-docs');
}