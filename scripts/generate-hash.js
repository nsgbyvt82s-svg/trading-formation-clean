const { hash } = require('bcryptjs');

async function generateHash() {
  const password = 'xP4$N8L!eQ0&';
  const hashedPassword = await hash(password, 10);
  console.log('Nouveau hachage généré:');
  console.log(hashedPassword);
}

generateHash().catch(console.error);
