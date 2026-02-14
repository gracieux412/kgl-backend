const swaggerJsdoc = require("swagger-jsdoc");

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "KGL API",
      version: "1.0.0",
      description: "Karibu Groceries Limited API documentation"
    },
    servers: [
      {
        url: "http://localhost:5000/api-docs"
      }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT"
        }
      },
      schemas: {
        Procurement: {
          type: "object",
          properties: {
            _id: {
              type: "string",
              example: "65cbd123abc4567890"
            },
            supplierName: {
              type: "string",
              example: "Kampala Fresh Supplies"
            },
            itemName: {
              type: "string",
              example: "Sugar 50kg"
            },
            quantity: {
              type: "number",
              example: 20
            },
            unitPrice: {
              type: "number",
              example: 120000
            },
            totalAmount: {
              type: "number",
              example: 2400000
            },
            procurementDate: {
              type: "string",
              format: "date",
              example: "2026-02-14"
            },
            status: {
              type: "string",
              enum: ["pending", "approved", "delivered"],
              example: "pending"
            }
          }
        },
        Sale: {
          type: "object",
          properties: {
            _id: {
              type: "string",
              example: "65cc00123abc4567890"
            },
            productName: {
              type: "string",
              example: "Sugar 1kg"
            },
            quantity: {
              type: "number",
              example: 5
            },
            unitPrice: {
              type: "number",
              example: 3000
            },
            totalAmount: {
              type: "number",
              example: 15000
            },
            saleDate: {
              type: "string",
              format: "date",
              example: "2026-02-14"
            }
          }
        }
      }
    }
  },
  apis: ["./routes/*.js"]
};

const swaggerSpec = swaggerJsdoc(options);

module.exports = swaggerSpec;
