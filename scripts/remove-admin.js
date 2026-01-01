const fs = require('fs');
const path = require('path');

const DB_PATH = path.join(__dirname, '..', 'data', 'users.json');

// Read the current users data
const data = JSON.parse(fs.readFileSync(DB_PATH, 'utf-8'));

// Filter out the admin user
const adminId = 'user_f82bc861-ea0e-4bc4-9004-2666a2188126';
const updatedUsers = data.users.filter(user => user.id !== adminId);

// Check if any users were removed
if (updatedUsers.length === data.users.length) {
  console.log('Admin user not found or already removed');
} else {
  // Save the updated data back to the file
  fs.writeFileSync(DB_PATH, JSON.stringify({ users: updatedUsers }, null, 2));
  console.log('Admin user successfully removed');
}

// Display the remaining users
console.log('Remaining users:', updatedUsers.map(u => ({ id: u.id, email: u.email, role: u.role })));
