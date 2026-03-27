import express from 'express'
import cors from 'cors'
import authRouter from '../src/routes/authRouter.js';
import incomeRouter from './routes/incomeRoute.js';

const app = express();

// Middleware
app.use(cors())
app.use(express.json())
app.use(express.urlencoded({extended: true}))

// Helth check route
app.get("/", (req, res) => {
    res.send("Server is running")
})

app.use("/api/auth", authRouter)
app.use("/api/income", incomeRouter);



export default app;