const dotenv = require('dotenv');
const mongoose = require('mongoose');

const errorController = require('./controllers/errorController');

dotenv.config();

errorController.unCaughtException();

const app = require('./app');

// mongoose.connect(process.env.MONGODB_LOCAL, () => {
//     console.log("Connected to DB");
// })

const DB = process.env.DATABASE.replace(
	'<PASSWORD>',
	process.env.DATABASE_PASSWORD
);

mongoose.set('strictQuery', true);

mongoose
	.connect(DB, {
		useNewUrlParser: true,
		useUnifiedTopology: true,
	})
	.then(() => {
		console.log('DB connection successful!');
	});

const port = process.env.PORT || 5000;

const server = app.listen(port, () =>
	console.log(`App listening on port ${port}!`)
);

errorController.unHandledRejection(server);
