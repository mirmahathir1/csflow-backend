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
const adminRoutes = require('./routes/admin');
const tagRoutes = require('./routes/tag');
const postRoutes = require('./routes/post');
const answerRoutes = require('./routes/answer');
const commentRoutes = require('./routes/comment');
const searchRoutes = require('./routes/search');
const storageRoutes = require('./routes/storage');

const {handleError} = require("./response/error");

app.use('/user', userRoutes);
app.use('/auth', authRoutes);
app.use('/archive', archiveRoutes);
app.use('/privileged', privilegedRoutes);
app.use('/admin', adminRoutes);
app.use('/tag', tagRoutes);
app.use('/post', postRoutes);
app.use('/answer', answerRoutes);
app.use('/comment', commentRoutes);
app.use('/search', searchRoutes);
app.use('/resources', storageRoutes);

app.get('/', (req, res) => {
    res.send('Hello World!');
})

const routeNotFound = (req, res, next) => {
    return res.status(404).send({
        "status": "ERROR",
        "statusCode": 400,
        "message": "Route not found",
        "payload": null
    });
};

app.get("*", routeNotFound);

app.post("*", routeNotFound);

app.patch("*", routeNotFound);

app.put("*", routeNotFound);

app.delete("*", routeNotFound);

app.use((err, req, res, next) => {
    handleError(err, res);
});

app.listen(port, () => {
    console.log(`App listening at http://localhost:${port}`)
})
