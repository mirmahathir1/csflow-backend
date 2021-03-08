const express = require('express')
const bodyParser = require('body-parser');
const app = express();
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

const dotenv = require('dotenv')
dotenv.config( { path : './config/config.env'} )

const port = process.env.PORT||3000;

const userRoutes = require('./routes/user');
app.use('/user', userRoutes);

app.get('/', (req, res) => {
  res.send('Hello World!')
})

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`)
})
