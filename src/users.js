import bcrypt from 'bcrypt';
import { query } from './db.js';

export async function findByUsername(username) {
  const q = `SELECT * FROM users
    WHERE username = $1`;

  try {
    const result = await query(q, [username]);

    if (result.rowCount === 1) {
      return result.rows[0];
    }
  } catch (e) {
    console.error('Gat ekki fundið notanda eftir notendanafni', e);
  }
  return false;
}

export async function findById(id) {
  const q = `SELECT * FROM users
    WHERE id = $1`;

  try {
    const result = await query(q, [id]);

    if (result.rowCount === 1) {
      return result.rows[0];
    }
  } catch (e) {
    console.error('Gat ekki deserialize-að notenda', e);
  }
  return false;
}

export async function comparePassword(user, password) {
  const result = await bcrypt.compare(password, user.password);
  if (result) {
    return user;
  }
  return false;
}
