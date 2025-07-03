const mongoose = require('mongoose');
const mongoURI = 'mongodb+srv://gofoodmern:dhee123@cluster0.vlkozdu.mongodb.net/gofoodmern?retryWrites=true&w=majority';

const connectDB = async () => {
  try {
    await mongoose.connect(mongoURI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('Connected to MongoDB');

    const foodCollection = mongoose.connection.db.collection("food_items");
    const data = await foodCollection.find({}).toArray();

    const categoryCollection = mongoose.connection.db.collection("foodCategory");
    const Catdata = await categoryCollection.find({}).toArray();

    global.foodData = data;
    global.foodCategory = Catdata;
    
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1); // Stop the server if DB fails
  }
};

module.exports = connectDB;
