require("dotenv").config()
const express = require('express')
const cors = require("cors")
const swaggerJSDoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');
const { router: usersRouter } = require("./router/users.js")
const { router: salesRouter } = require("./router/sales.js")
const { router: procurementsRouter } = require("./router/procurements.js")
const { router: loginRouter } = require("./router/auth.js")
const connectDB = require("./config/db.js")




const app = express()

//middleware for using json methods
app.use(cors())
app.use(express.json())

//authentication route
app.use(loginRouter)

//authorization middleware

app.use( usersRouter)
app.use( salesRouter)
app.use( procurementsRouter)



// Swagger definition options

const swaggerOptions = {
  definition: {
    openapi: '3.0.0', // Specify the OpenAPI version
    info: {
      title: 'KGL REST API Documentation',
      version: '1.0.0',
      description: 'API documentation for your KGL project to be used in the frontend',
    },
    servers: [
      {
        url: `http://localhost:${process.env.PORT}`,
      },
    ],
  },
  apis: ['./router/*.js'], // Path to the API route files
};

const swaggerSpec = swaggerJSDoc(swaggerOptions);

// Serve the Swagger UI documentation
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));


const port = process.env.PORT || 5000;
const startServer = async () => {
    try {

        //connect to database
        await connectDB();

        // await userModel.create({
        //     username: "admin1",
        //     email: "admin1@test.com",
        //     password: "password123",
        //     role: "admin",
        // })
        console.log("ENV MONGO_URI:", process.env.MONGO_URI)

        //listen to server port
        app.listen(port, (err) => {
            if (err) {
                console.error(err)
            }
            console.log(`Server runing successfully on port ${port}`)
        })
    } catch (error) {
        console.error("Failed to start server:", error)
    }
}

startServer()

