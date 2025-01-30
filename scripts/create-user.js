require('dotenv').config({ path: '.env.local' });

const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const MONGODB_URI = process.env.MONGODB_URI;
const ADMIN_EMAIL = process.env.ADMIN_EMAIL;
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;

if (!MONGODB_URI || !ADMIN_EMAIL || !ADMIN_PASSWORD) {
  throw new Error('Please define the MONGODB_URI, ADMIN_EMAIL, and ADMIN_PASSWORD environment variables inside .env.local');
}

mongoose.connect(MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const UserSchema = new mongoose.Schema({
  name: String,
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
}, { timestamps: true });

const User = mongoose.models.User || mongoose.model('User', UserSchema);

async function createUser() {
  const hashedPassword = await bcrypt.hash(ADMIN_PASSWORD, 10);

  try {
    const user = await User.create({
      name: 'Admin',
      email: ADMIN_EMAIL,
      password: hashedPassword,
    });
    console.log('User created successfully:', user);
  } catch (error) {
    console.error('Error creating user:', error);
  } finally {
    mongoose.connection.close();
  }
}

createUser();