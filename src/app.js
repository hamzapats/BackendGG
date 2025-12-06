import express from "express"
import cors from "cors"
import cookieParser from "cookie-parser"

const app = express()

app.use(cors({
  origin: process.env.CORS_ORIGIN,
  credentials: true
}))

app.use(express.json({limit:'10kb'}))
app.use(express.urlencoded({extended:true, limit:'10kb'}))
app.use(express.static('public'))
app.use(cookieParser())


// routes imported here:
import userRouter from './routes/user.routes.js'; 



// ROUTES DECLARATION:
// all of this is like prefix to the url..followed by the suffix in individual route files
// eg: http://localhost:8000/api/v1/users/register,login
app.use('/api/v1/users', userRouter);


export { app }