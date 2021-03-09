const express = require('express')
var cors = require('cors')
const dotenv = require('dotenv')
const bodyParser = require('body-parser');
const { handleError } = require('./error');

const app = express();

dotenv.config({path: './config/config.env'})

const port = process.env.PORT;

app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());
app.use(cors())

const userRoutes = require('./routes/user');
app.use('/user', userRoutes);

app.use((err, req, res, next) => {
    handleError(err, res);
});

app.get('/', (req, res) => {
    res.send('Hello World!')
})

app.listen(port, () => {
    console.log(`App listening at http://localhost:${port}`)
})
