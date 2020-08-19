import bcrypt from 'bcrypt';

export async function hashPassword (password: string) {

  const saltRounds = 10;
  const hashedPassword = await new Promise((resolve, reject) => {
    bcrypt.hash(password, saltRounds, function(err, hash) {
      if (err) {
        console.log(err);
        reject(err);
      }
      resolve(hash)
    });
  });

  return hashedPassword
}

export async function verifyPassword (password:string, hashedPassword: string) {
  const validation = await new Promise((resolve, reject) => {
    bcrypt.compare(password, hashedPassword, function (err, result) {
      if (err) {
        reject(err);
      }
      resolve(result);
    });
  });

  return validation;
}