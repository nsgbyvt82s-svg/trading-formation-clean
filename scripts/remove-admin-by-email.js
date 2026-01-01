const fs = require('fs');
const path = require('path');

const DB_PATH = path.join(__dirname, '..', 'data', 'users.json');

// Read the current users data
const data = JSON.parse(fs.readFileSync(DB_PATH, 'utf-8'));

// Filter out the admin user by email
const adminEmail = 'admin@example.com';
const initialCount = data.users.length;
const updatedUsers = data.users.filter(user => user.email !== adminEmail);

// Check if any users were removed
if (updatedUsers.length === initialCount) {
  console.log('No user found with email:', adminEmail);
} else {
  // Save the updated data back to the file
  fs.writeFileSync(DB_PATH, JSON.stringify({ users: updatedUsers }, null, 2));
  console.log(`User with email ${adminEmail} has been removed.`);
}

// Display the remaining users
console.log('Remaining users:', updatedUsers.map(u => ({ 
  id: u.id, 
  email: u.email, 
  role: u.role 
})));
