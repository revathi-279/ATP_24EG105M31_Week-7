import exp from 'express'
import { config } from 'dotenv'
import { connect } from 'mongoose'
import { userApp } from "./APIs/UserAPI.js"
import { authorApp } from "./APIs/AuthorAPI.js"
import { adminApp } from "./APIs/AdminAPI.js"
import { commonApp } from "./APIs/CommonAPI.js"
import cookieParser from 'cookie-parser'
import cors from 'cors'
config()

//Create express app
const app = exp()

//Enable CORS
app.use(cors({
    origin:["https://blogapp-blog-app2.vercel.app/"], // Accepts reqs from this origin
    credentials:true                 // Enables to send the tokens back to the client
}))

// Cookie parser middleware
app.use(cookieParser())

//Body parser middleware
app.use(exp.json())


// Path level middlewares
app.use("/user-api", userApp)
app.use("/author-api", authorApp)
app.use("/admin-api", adminApp)
app.use("/auth", commonApp)

// Connect to DataBase
const connectDB = async () => {
    try 
    {
        await connect(process.env.DB_URL)
        console.log("Server is connected to DB")
        // Assign port
        const port = process.env.PORT || 5000
        app.listen(port, () => console.log(`Server listening on ${port}..`))
    } 
    catch (err) 
    {
        console.log("Error occured during DB connection", err)
    }
}

connectDB()

// To handle invalid path
app.use((req, res, next) => {
    console.log(req.url)
    res.status(404).json({ message: `Path ${req.url} is invalid` })
})

//Error handling middlewares

app.use((err, req, res, next) => {
  console.log("Error is :",err)
  console.log("Full error:", JSON.stringify(err, null, 2));

  // ValidationError
  if (err.name === "ValidationError") 
  {
    return res.status(400).json({ message: "Error occurred", error: err.message });
  }

  // CastError
  if (err.name === "CastError") 
  {
    return res.status(400).json({ message: "Error occurred", error: err.message });
  }

  const errCode = err.code ?? err.cause?.code ?? err.errorResponse?.code;
  const keyValue = err.keyValue ?? err.cause?.keyValue ?? err.errorResponse?.keyValue;

  if (errCode === 11000) 
  {
    const field = Object.keys(keyValue)[0];
    const value = keyValue[field];
    return res.status(409).json({
      message: "Error occurred",
      error: `${field} "${value}" already exists`,
    });
  }

  // Send server side error
  res.status(500).json({ message: "Error occurred", error: "Server side error" });
});