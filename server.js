require("dotenv").config()
const express = require('express')
const cors = require("cors")
const swaggerJSDoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');
const bcrypt = require("bcrypt");
const { userModel } = require("./models/users.model");
const { branchModel } = require("./models/branch.model");
const { router: usersRouter } = require("./router/users.js")
const { router: salesRouter } = require("./router/sales.js")
const { router: procurementsRouter } = require("./router/procurements.js")
const { router: loginRouter } = require("./router/auth.js")
const { router: accountRouter } = require("./router/account.js")
const { router: creditSalesRouter } = require("./router/creditSales.js")
const { router: stockRouter } = require("./router/stock.js")
const { router: reportsRouter } = require("./router/reports.js")
const { router: adminRouter } = require("./router/admin.js")
const connectDB = require("./config/db.js")




const app = express()

//middleware for using json methods
app.use(cors())
app.use(express.json())



//authorization middleware

app.use( usersRouter)
app.use( salesRouter)
app.use( procurementsRouter)
app.use( creditSalesRouter)
app.use( stockRouter)
app.use( reportsRouter)

app.use( loginRouter)
app.use( accountRouter)
app.use('/admin', adminRouter)



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

        const adminEmail = "admin@gmail.com";
        const existingAdmin = await userModel.findOne({ email: adminEmail });
        if (!existingAdmin) {
            const hashed = await bcrypt.hash("admin", 10);
            await userModel.create({
                username: "superadmin",
                email: adminEmail,
                password: hashed,
                role: "admin"
            });
            console.log("Default super admin created:", adminEmail);
        }

        // Create default branches
        const defaultBranches = [
            { name: "Maganjo", location: "Maganjo Town Center" },
            { name: "Matugga", location: "Matugga Market Area" }
        ];

        for (const branchData of defaultBranches) {
            const existingBranch = await branchModel.findOne({ name: branchData.name });
            if (!existingBranch) {
                await branchModel.create(branchData);
                console.log(`Default branch created: ${branchData.name}`);
            }
        }

        // Create sample users
        const sampleUsers = [
            {
                username: "director1",
                email: "director@kgl.com",
                password: await bcrypt.hash("director123", 10),
                role: "director"
            },
            {
                username: "manager_maganjo",
                email: "manager.maganjo@kgl.com",
                password: await bcrypt.hash("manager123", 10),
                role: "manager",
                branch: "Maganjo"
            },
            {
                username: "manager_matugga",
                email: "manager.matugga@kgl.com",
                password: await bcrypt.hash("manager123", 10),
                role: "manager",
                branch: "Matugga"
            },
            {
                username: "agent_maganjo1",
                email: "agent1.maganjo@kgl.com",
                password: await bcrypt.hash("agent123", 10),
                role: "sale-agent",
                branch: "Maganjo"
            },
            {
                username: "agent_matugga1",
                email: "agent1.matugga@kgl.com",
                password: await bcrypt.hash("agent123", 10),
                role: "sale-agent",
                branch: "Matugga"
            }
        ];

        for (const userData of sampleUsers) {
            const existingUser = await userModel.findOne({ email: userData.email });
            if (!existingUser) {
                await userModel.create(userData);
                console.log(`Sample user created: ${userData.username}`);
            }
        }

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

