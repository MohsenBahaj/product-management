const config = require('../config');

const spec = {
  openapi: '3.0.3',
  info: {
    title: 'Product Management API',
    description:
      'REST API for the Product Management Assessment.\n\n' +
      '**Auth:** All protected endpoints require `Authorization: Bearer <token>`.\n\n' +
      '**Soft deletion:** Products and Categories are deactivated via `is_active = false`, not physically deleted.',
    version: '1.0.0',
  },
  servers: [
    {
      url: `http://localhost:${config.port}/api`,
      description: 'Local development',
    },
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        description: 'JWT token obtained from /auth/login or /auth/register',
      },
    },
    schemas: {
      User: {
        type: 'object',
        properties: {
          id: { type: 'string', format: 'uuid' },
          name: { type: 'string', example: 'Alice Johnson' },
          email: { type: 'string', format: 'email', example: 'alice@example.com' },
          profile_image_url: { type: 'string', nullable: true, example: 'https://storage.googleapis.com/my-bucket/profiles/uuid.jpg' },
          is_active: { type: 'boolean', example: true },
          created_at: { type: 'string', format: 'date-time' },
          updated_at: { type: 'string', format: 'date-time' },
        },
      },
      Category: {
        type: 'object',
        properties: {
          id: { type: 'string', format: 'uuid' },
          user_id: { type: 'string', format: 'uuid' },
          name: { type: 'string', example: 'Electronics' },
          description: { type: 'string', nullable: true },
          image_url: { type: 'string', nullable: true },
          is_active: { type: 'boolean', example: true },
          created_at: { type: 'string', format: 'date-time' },
          updated_at: { type: 'string', format: 'date-time' },
        },
      },
      ProductImage: {
        type: 'object',
        properties: {
          id: { type: 'string', format: 'uuid' },
          product_id: { type: 'string', format: 'uuid' },
          image_url: { type: 'string', example: 'https://storage.googleapis.com/my-bucket/products/gallery/uuid.jpg' },
          display_order: { type: 'integer', example: 0 },
          created_at: { type: 'string', format: 'date-time' },
        },
      },
      Product: {
        type: 'object',
        properties: {
          id: { type: 'string', format: 'uuid' },
          user_id: { type: 'string', format: 'uuid' },
          category_id: { type: 'string', format: 'uuid', nullable: true },
          category_name: { type: 'string', nullable: true },
          name: { type: 'string', example: 'Wireless Headphones' },
          description: { type: 'string', nullable: true },
          image_url: { type: 'string', nullable: true, description: 'Legacy field — use thumbnail_image_url for new integrations' },
          thumbnail_image_url: { type: 'string', nullable: true, example: 'https://storage.googleapis.com/my-bucket/products/thumbnails/uuid.jpg', description: 'Card/list view thumbnail' },
          price: { type: 'number', format: 'float', example: 79.99 },
          quantity: { type: 'integer', example: 25 },
          is_active: { type: 'boolean', example: true },
          is_featured: { type: 'boolean', example: false },
          created_at: { type: 'string', format: 'date-time' },
          updated_at: { type: 'string', format: 'date-time' },
          images: {
            type: 'array',
            description: 'Gallery images (only present on GET /products/:id)',
            items: { $ref: '#/components/schemas/ProductImage' },
          },
        },
      },
      SearchHistory: {
        type: 'object',
        properties: {
          id: { type: 'string', format: 'uuid' },
          user_id: { type: 'string', format: 'uuid' },
          search_term: { type: 'string', example: 'headphones' },
          searched_at: { type: 'string', format: 'date-time' },
        },
      },
      Pagination: {
        type: 'object',
        properties: {
          page: { type: 'integer', example: 1 },
          limit: { type: 'integer', example: 20 },
          total: { type: 'integer', example: 42 },
          pages: { type: 'integer', example: 3 },
        },
      },
      AuthResponse: {
        type: 'object',
        properties: {
          user: { $ref: '#/components/schemas/User' },
          token: { type: 'string', description: 'JWT access token' },
        },
      },
      Error: {
        type: 'object',
        properties: {
          success: { type: 'boolean', example: false },
          message: { type: 'string', example: 'Error description' },
        },
      },
      ValidationError: {
        type: 'object',
        properties: {
          success: { type: 'boolean', example: false },
          message: { type: 'string', example: 'Validation failed' },
          errors: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                field: { type: 'string' },
                message: { type: 'string' },
              },
            },
          },
        },
      },
    },
    responses: {
      Unauthorized: {
        description: 'Authentication required or token invalid',
        content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } },
      },
      NotFound: {
        description: 'Resource not found',
        content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } },
      },
      ValidationError: {
        description: 'Request validation failed',
        content: { 'application/json': { schema: { $ref: '#/components/schemas/ValidationError' } } },
      },
      RateLimited: {
        description: 'Too many requests',
        content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } },
      },
    },
  },

  paths: {
    // ── Health ──────────────────────────────────────────────────────────────
    '/health': {
      get: {
        tags: ['System'],
        summary: 'Health check',
        responses: {
          200: {
            description: 'API is healthy',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    data: {
                      type: 'object',
                      properties: {
                        status: { type: 'string', example: 'ok' },
                        timestamp: { type: 'string', format: 'date-time' },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
    },

    // ── Auth ─────────────────────────────────────────────────────────────────
    '/auth/register': {
      post: {
        tags: ['Auth'],
        summary: 'Register a new user',
        description: 'Rate limited: 5 requests per 15 minutes per IP.',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['name', 'email', 'password'],
                properties: {
                  name: { type: 'string', example: 'Alice Johnson' },
                  email: { type: 'string', format: 'email', example: 'alice@example.com' },
                  password: { type: 'string', minLength: 8, example: 'password123' },
                },
              },
            },
          },
        },
        responses: {
          201: {
            description: 'User registered successfully',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    data: { $ref: '#/components/schemas/AuthResponse' },
                  },
                },
              },
            },
          },
          400: { $ref: '#/components/responses/ValidationError' },
          409: { description: 'Email already registered', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
          429: { $ref: '#/components/responses/RateLimited' },
        },
      },
    },

    '/auth/login': {
      post: {
        tags: ['Auth'],
        summary: 'Login',
        description: 'Rate limited: 5 requests per 15 minutes per IP.',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['email', 'password'],
                properties: {
                  email: { type: 'string', format: 'email', example: 'alice@example.com' },
                  password: { type: 'string', example: 'password123' },
                },
              },
            },
          },
        },
        responses: {
          200: {
            description: 'Login successful',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    data: { $ref: '#/components/schemas/AuthResponse' },
                  },
                },
              },
            },
          },
          400: { $ref: '#/components/responses/ValidationError' },
          401: { description: 'Invalid credentials', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
          429: { $ref: '#/components/responses/RateLimited' },
        },
      },
    },

    '/auth/logout': {
      post: {
        tags: ['Auth'],
        summary: 'Logout (JWT is stateless — client discards token)',
        security: [{ bearerAuth: [] }],
        responses: {
          200: { description: 'Logout acknowledged' },
          401: { $ref: '#/components/responses/Unauthorized' },
        },
      },
    },

    '/auth/me': {
      get: {
        tags: ['Auth'],
        summary: 'Get current authenticated user',
        security: [{ bearerAuth: [] }],
        responses: {
          200: {
            description: 'Current user',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    data: {
                      type: 'object',
                      properties: { user: { $ref: '#/components/schemas/User' } },
                    },
                  },
                },
              },
            },
          },
          401: { $ref: '#/components/responses/Unauthorized' },
        },
      },
    },

    // ── Users ────────────────────────────────────────────────────────────────
    '/users/profile': {
      get: {
        tags: ['Users'],
        summary: 'Get my profile',
        security: [{ bearerAuth: [] }],
        responses: {
          200: {
            description: 'User profile',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    data: { type: 'object', properties: { user: { $ref: '#/components/schemas/User' } } },
                  },
                },
              },
            },
          },
          401: { $ref: '#/components/responses/Unauthorized' },
        },
      },
      patch: {
        tags: ['Users'],
        summary: 'Update my profile name',
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['name'],
                properties: { name: { type: 'string', example: 'Alice J.' } },
              },
            },
          },
        },
        responses: {
          200: { description: 'Updated profile' },
          400: { $ref: '#/components/responses/ValidationError' },
          401: { $ref: '#/components/responses/Unauthorized' },
        },
      },
    },

    '/users/profile-image': {
      post: {
        tags: ['Users'],
        summary: 'Upload profile avatar',
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'multipart/form-data': {
              schema: {
                type: 'object',
                required: ['image'],
                properties: {
                  image: { type: 'string', format: 'binary', description: 'JPEG / PNG / WebP, max 5 MB — uploaded to Firebase Storage' },
                },
              },
            },
          },
        },
        responses: {
          200: { description: 'Avatar updated' },
          400: { description: 'No file or invalid type / size', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
          401: { $ref: '#/components/responses/Unauthorized' },
        },
      },
    },

    // ── Categories ───────────────────────────────────────────────────────────
    '/categories': {
      get: {
        tags: ['Categories'],
        summary: 'List my active categories',
        security: [{ bearerAuth: [] }],
        responses: {
          200: {
            description: 'Categories array',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    data: {
                      type: 'object',
                      properties: {
                        categories: { type: 'array', items: { $ref: '#/components/schemas/Category' } },
                      },
                    },
                  },
                },
              },
            },
          },
          401: { $ref: '#/components/responses/Unauthorized' },
        },
      },
      post: {
        tags: ['Categories'],
        summary: 'Create a category',
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'multipart/form-data': {
              schema: {
                type: 'object',
                required: ['name'],
                properties: {
                  name: { type: 'string', example: 'Electronics' },
                  description: { type: 'string' },
                  image: { type: 'string', format: 'binary' },
                },
              },
            },
          },
        },
        responses: {
          201: { description: 'Category created' },
          400: { $ref: '#/components/responses/ValidationError' },
          401: { $ref: '#/components/responses/Unauthorized' },
        },
      },
    },

    '/categories/{id}': {
      parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } }],
      get: {
        tags: ['Categories'],
        summary: 'Get a category by ID',
        security: [{ bearerAuth: [] }],
        responses: {
          200: { description: 'Category object' },
          401: { $ref: '#/components/responses/Unauthorized' },
          404: { $ref: '#/components/responses/NotFound' },
        },
      },
      patch: {
        tags: ['Categories'],
        summary: 'Update a category',
        security: [{ bearerAuth: [] }],
        requestBody: {
          content: {
            'multipart/form-data': {
              schema: {
                type: 'object',
                properties: {
                  name: { type: 'string' },
                  description: { type: 'string' },
                  image: { type: 'string', format: 'binary' },
                },
              },
            },
          },
        },
        responses: {
          200: { description: 'Updated category' },
          400: { $ref: '#/components/responses/ValidationError' },
          401: { $ref: '#/components/responses/Unauthorized' },
          404: { $ref: '#/components/responses/NotFound' },
        },
      },
      delete: {
        tags: ['Categories'],
        summary: 'Soft-delete a category (sets is_active = false)',
        security: [{ bearerAuth: [] }],
        responses: {
          204: { description: 'Deleted (no content)' },
          401: { $ref: '#/components/responses/Unauthorized' },
          404: { $ref: '#/components/responses/NotFound' },
        },
      },
    },

    // ── Products ─────────────────────────────────────────────────────────────
    '/products': {
      get: {
        tags: ['Products'],
        summary: 'List my active products (with search, filter, pagination)',
        description:
          'Passing `search` automatically saves the term to search history (deduplicated within 1 hour).',
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: 'page', in: 'query', schema: { type: 'integer', default: 1 } },
          { name: 'limit', in: 'query', schema: { type: 'integer', default: 20, maximum: 100 } },
          { name: 'search', in: 'query', schema: { type: 'string' }, description: 'Full-text search on name + description' },
          { name: 'categoryId', in: 'query', schema: { type: 'string', format: 'uuid' } },
          { name: 'minPrice', in: 'query', schema: { type: 'number' } },
          { name: 'maxPrice', in: 'query', schema: { type: 'number' } },
          { name: 'featured', in: 'query', schema: { type: 'string', enum: ['true'] }, description: 'When `true`, return only featured products. Omit to return all active products.' },
          { name: 'sortBy', in: 'query', schema: { type: 'string', enum: ['created_at', 'price', 'name', 'quantity'], default: 'created_at' } },
          { name: 'order', in: 'query', schema: { type: 'string', enum: ['asc', 'desc'], default: 'desc' } },
        ],
        responses: {
          200: {
            description: 'Paginated product list',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    data: {
                      type: 'object',
                      properties: {
                        data: { type: 'array', items: { $ref: '#/components/schemas/Product' } },
                        pagination: { $ref: '#/components/schemas/Pagination' },
                      },
                    },
                  },
                },
              },
            },
          },
          401: { $ref: '#/components/responses/Unauthorized' },
        },
      },
      post: {
        tags: ['Products'],
        summary: 'Create a product',
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'multipart/form-data': {
              schema: {
                type: 'object',
                required: ['name', 'price', 'thumbnail_image'],
                properties: {
                  name: { type: 'string', example: 'Wireless Headphones' },
                  description: { type: 'string' },
                  price: { type: 'number', minimum: 0, example: 79.99 },
                  quantity: { type: 'integer', minimum: 0, default: 0 },
                  categoryId: { type: 'string', format: 'uuid' },
                  is_featured: { type: 'boolean', default: false },
                  thumbnail_image: { type: 'string', format: 'binary', description: 'Required. Card/list view thumbnail (JPEG/PNG/WebP, max 5 MB)' },
                  images: { type: 'array', items: { type: 'string', format: 'binary' }, description: 'Optional gallery images — up to 10 files' },
                },
              },
            },
          },
        },
        responses: {
          201: {
            description: 'Product created',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    data: { type: 'object', properties: { product: { $ref: '#/components/schemas/Product' } } },
                  },
                },
              },
            },
          },
          400: { $ref: '#/components/responses/ValidationError' },
          401: { $ref: '#/components/responses/Unauthorized' },
        },
      },
    },

    '/products/{id}': {
      parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } }],
      get: {
        tags: ['Products'],
        summary: 'Get a product by ID (includes gallery images array)',
        security: [{ bearerAuth: [] }],
        responses: {
          200: {
            description: 'Product with gallery',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    data: { type: 'object', properties: { product: { $ref: '#/components/schemas/Product' } } },
                  },
                },
              },
            },
          },
          401: { $ref: '#/components/responses/Unauthorized' },
          404: { $ref: '#/components/responses/NotFound' },
        },
      },
      patch: {
        tags: ['Products'],
        summary: 'Update a product',
        security: [{ bearerAuth: [] }],
        requestBody: {
          content: {
            'multipart/form-data': {
              schema: {
                type: 'object',
                properties: {
                  name: { type: 'string' },
                  description: { type: 'string' },
                  price: { type: 'number', minimum: 0 },
                  quantity: { type: 'integer', minimum: 0 },
                  categoryId: { type: 'string', format: 'uuid', nullable: true },
                  is_featured: { type: 'boolean' },
                  thumbnail_image: { type: 'string', format: 'binary', description: 'Replace the card/list thumbnail' },
                },
              },
            },
          },
        },
        responses: {
          200: { description: 'Updated product' },
          400: { $ref: '#/components/responses/ValidationError' },
          401: { $ref: '#/components/responses/Unauthorized' },
          404: { $ref: '#/components/responses/NotFound' },
        },
      },
      delete: {
        tags: ['Products'],
        summary: 'Soft-delete a product (sets is_active = false)',
        security: [{ bearerAuth: [] }],
        responses: {
          204: { description: 'Deleted (no content)' },
          401: { $ref: '#/components/responses/Unauthorized' },
          404: { $ref: '#/components/responses/NotFound' },
        },
      },
    },

    // ── Product Gallery ──────────────────────────────────────────────────────
    '/products/{id}/images': {
      parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' }, description: 'Product ID' }],
      get: {
        tags: ['Products'],
        summary: 'List all gallery images for a product',
        security: [{ bearerAuth: [] }],
        responses: {
          200: {
            description: 'Gallery images ordered by display_order',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    data: { type: 'array', items: { $ref: '#/components/schemas/ProductImage' } },
                  },
                },
              },
            },
          },
          401: { $ref: '#/components/responses/Unauthorized' },
          404: { $ref: '#/components/responses/NotFound' },
        },
      },
      post: {
        tags: ['Products'],
        summary: 'Add gallery images to a product (up to 10 total)',
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'multipart/form-data': {
              schema: {
                type: 'object',
                required: ['images'],
                properties: {
                  images: { type: 'array', items: { type: 'string', format: 'binary' }, description: 'One or more images. Product total must not exceed 10.' },
                },
              },
            },
          },
        },
        responses: {
          201: {
            description: 'Newly added images',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    data: { type: 'array', items: { $ref: '#/components/schemas/ProductImage' } },
                  },
                },
              },
            },
          },
          400: { description: 'No files, wrong type/size, or gallery would exceed 10 images', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
          401: { $ref: '#/components/responses/Unauthorized' },
          404: { $ref: '#/components/responses/NotFound' },
        },
      },
    },

    '/products/{id}/images/{imageId}': {
      parameters: [
        { name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' }, description: 'Product ID' },
        { name: 'imageId', in: 'path', required: true, schema: { type: 'string', format: 'uuid' }, description: 'Image ID' },
      ],
      delete: {
        tags: ['Products'],
        summary: 'Delete a single gallery image',
        security: [{ bearerAuth: [] }],
        responses: {
          204: { description: 'Deleted (no content)' },
          401: { $ref: '#/components/responses/Unauthorized' },
          404: { $ref: '#/components/responses/NotFound' },
        },
      },
    },

    '/products/{id}/images/reorder': {
      parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' }, description: 'Product ID' }],
      patch: {
        tags: ['Products'],
        summary: 'Reorder gallery images',
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['orders'],
                properties: {
                  orders: {
                    type: 'array',
                    minItems: 1,
                    items: {
                      type: 'object',
                      required: ['id', 'display_order'],
                      properties: {
                        id: { type: 'string', format: 'uuid', description: 'Image ID' },
                        display_order: { type: 'integer', minimum: 0 },
                      },
                    },
                  },
                },
              },
            },
          },
        },
        responses: {
          200: {
            description: 'Updated gallery in new order',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    data: { type: 'array', items: { $ref: '#/components/schemas/ProductImage' } },
                  },
                },
              },
            },
          },
          400: { $ref: '#/components/responses/ValidationError' },
          401: { $ref: '#/components/responses/Unauthorized' },
          404: { $ref: '#/components/responses/NotFound' },
        },
      },
    },

    // ── Search History ───────────────────────────────────────────────────────
    '/search-history': {
      get: {
        tags: ['Search History'],
        summary: 'Get my recent search terms',
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: 'limit', in: 'query', schema: { type: 'integer', default: 20, maximum: 50 }, description: 'Max results to return' },
        ],
        responses: {
          200: {
            description: 'Search history',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    data: {
                      type: 'object',
                      properties: {
                        history: { type: 'array', items: { $ref: '#/components/schemas/SearchHistory' } },
                      },
                    },
                  },
                },
              },
            },
          },
          401: { $ref: '#/components/responses/Unauthorized' },
        },
      },
      delete: {
        tags: ['Search History'],
        summary: 'Clear all search history',
        security: [{ bearerAuth: [] }],
        responses: {
          204: { description: 'Cleared (no content)' },
          401: { $ref: '#/components/responses/Unauthorized' },
        },
      },
    },
  },

  tags: [
    { name: 'System', description: 'Health and system endpoints' },
    { name: 'Auth', description: 'Registration, login, and current user' },
    { name: 'Users', description: 'User profile management' },
    { name: 'Categories', description: 'Product category CRUD' },
    { name: 'Products', description: 'Product CRUD with search, filtering, and gallery management' },
    { name: 'Search History', description: 'Automatic search term history' },
  ],
};

module.exports = spec;
