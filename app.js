const express = require('express')
var cors = require('cors')
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
const {handleError} = require("./response/error");
app.use('/user', userRoutes);
app.use('/auth',authRoutes);
app.use('/archive',archiveRoutes);

app.get('/', (req, res) => {
    res.send('Hello World!')
})

app.get("*", (req, res) => {
    res.status(404).send("Route not found");
});

app.post("*", (req, res) => {
    res.status(404).send("Route not found");
});

app.patch("*", (req, res) => {
    res.status(404).send("Route not found");
});

app.put("*", (req, res) => {
    res.status(404).send("Route not found");
});

app.delete("*", (req, res) => {
    res.status(404).send("Route not found");
});

app.use((err, req, res, next) => {
    handleError(err, res);
});

app.listen(port, () => {
    console.log(`App listening at http://localhost:${port}`)
})
