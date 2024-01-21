// MongoDB
require("./config/db");

const app = require("express")();
const port = process.env.PORT || 5000;

const UserRouter = require(`./API/User`);

// For accepting POST form data

const bodyParser = require(`express`).json;
app.use(bodyParser());

app.use('/user', UserRouter);

app.listen(port, () => {
    console.log(`Server runnning on port ${port}`);
});