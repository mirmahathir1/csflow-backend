const express = require('express')
const cors = require('cors')
const dotenv = require('dotenv')
const bodyParser = require('body-parser');

const app = express();

dotenv.config({path: './config/config.env'})

const port = process.env.PORT;

app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());
app.use(cors())

const userRoutes = require('./routes/user');
const authRoutes = require('./routes/auth');
const archiveRoutes = require('./routes/archive');
const privilegedRoutes = require('./routes/privileged');
const tagRoutes = require('./routes/tag');
const postRoutes = require('./routes/post');
const answerRoutes = require('./routes/answer');
const commentRoutes = require('./routes/comment');
const storageRoutes = require('./routes/storage');

const {handleError} = require("./response/error");

app.use('/user', userRoutes);
app.use('/auth', authRoutes);
app.use('/archive', archiveRoutes);
app.use('/privileged', privilegedRoutes);
app.use('/tag', tagRoutes);
app.use('/post', postRoutes);
app.use('/answer', answerRoutes);
app.use('/comment', commentRoutes);
app.use('/resources', storageRoutes);

app.get('/', (req, res) => {
    res.send('Hello World!')
})

const routeNotFoundMessage = {
    "status": "ERROR",
    "statusCode": 400,
    "message": "Route not found",
    "payload": null
};

app.get("*", (req, res) => {
    res.status(404).send(routeNotFoundMessage);
});

app.post("*", (req, res) => {
    res.status(404).send(routeNotFoundMessage);
});

app.patch("*", (req, res) => {
    res.status(404).send(routeNotFoundMessage);
});

app.put("*", (req, res) => {
    res.status(404).send(routeNotFoundMessage);
});

app.delete("*", (req, res) => {
    res.status(404).send(routeNotFoundMessage);
});

app.use((err, req, res, next) => {
    handleError(err, res);
});

app.listen(port, () => {
    console.log(`App listening at http://localhost:${port}`)
})
