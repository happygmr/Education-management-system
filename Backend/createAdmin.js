const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./user.model');
const Role = require('./role.model');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/education-management'; // adjust if needed

async function createAdmin() {
  await mongoose.connect(MONGO_URI);

  // Find or create the admin role
  let adminRole = await Role.findOne({ name: 'admin' });
  if (!adminRole) {
    adminRole = await Role.create({ name: 'admin', description: 'Administrator' });
  }

  // Check if admin user already exists
  const username = 'admin';
  const email = 'admin@example.com';
  const password = 'admin123'; // Change this after first login!

  let user = await User.findOne({ username });
  if (user) {
    console.log('Admin user already exists:', username);
    process.exit(0);
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  user = new User({
    username,
    email,
    password: hashedPassword,
    roles: [adminRole._id],
    fullName: 'System Admin'
  });

  await user.save();
  console.log('Admin user created!');
  console.log('Username:', username);
  console.log('Password:', password);
  process.exit(0);
}

createAdmin().catch(err => {
  console.error(err);
  process.exit(1);
}); 