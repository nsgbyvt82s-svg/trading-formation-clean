const fs = require('fs');
const path = require('path');

const DB_PATH = path.join(__dirname, '..', 'data', 'users.json');

// Read the current users data
const data = JSON.parse(fs.readFileSync(DB_PATH, 'utf-8'));

// Filter out the owner user
const ownerId = '1429585635500363876';
const updatedUsers = data.users.filter(user => user.id !== ownerId);

// Check if any users were removed
if (updatedUsers.length === data.users.length) {
  console.log('Owner user not found or already removed');
} else {
  // Save the updated data back to the file
  fs.writeFileSync(DB_PATH, JSON.stringify({ users: updatedUsers }, null, 2));
  console.log('Owner user successfully removed');
}

// Display the remaining users
console.log('Remaining users:', updatedUsers.map(u => ({ id: u.id, email: u.email, role: u.role })));
