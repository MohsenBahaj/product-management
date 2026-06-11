const swaggerUi = require('swagger-ui-express');
const openApiSpec = require('../docs/openapi');

const swaggerServe = swaggerUi.serve;
const swaggerSetup = swaggerUi.setup(openApiSpec, {
  customSiteTitle: 'Product Management API',
  swaggerOptions: {
    persistAuthorization: true,
    displayRequestDuration: true,
    docExpansion: 'list',
  },
});

module.exports = { swaggerServe, swaggerSetup };
