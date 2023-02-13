require('dotenv/config');

const mongoose = require('mongoose');
const app = require('./app');


// mongoose.connect(process.env.MONGODB_LOCAL, () => {
//     console.log("Connected to DB");
// })

 
const port = process.env.PORT || 3001;

app.listen(port, () => {
    mongoose.connect(process.env.MONGODB_LOCAL, () => {
        console.log("Connected to DB");
    })
    console.log(`Server running on port ${port}`);
}
);