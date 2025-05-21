import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors({
    origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
}))

app.use(express.json({limit: '50mb'}));

app.use(express.urlencoded({limit: '50mb', extended: true}));
app.use(cookieParser());
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);


});

export default app;