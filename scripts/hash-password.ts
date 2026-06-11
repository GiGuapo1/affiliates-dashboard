/**
 * Script to generate bcrypt password hashes for affiliates.
 * Usage: npm run hash-password
 * Then enter the password when prompted.
 */
import * as readline from "readline";
import * as bcrypt from "bcryptjs";

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

rl.question("Password to hash: ", async (password) => {
  const hash = await bcrypt.hash(password.trim(), 10);
  console.log("\nHash:");
  console.log(hash);
  console.log(
    '\nAdd to USERS_JSON:\n{"username":"PARTNER_CODE","password_hash":"' +
      hash +
      '","partner_code":"PARTNER_CODE","name":"Nome do Afiliado"}'
  );
  rl.close();
});
