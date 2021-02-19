import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const {
  DATABASE_URL: connectionString,
  NODE_ENV: nodeEnv = 'development',
} = process.env;

if(!connectionString) {
  console.error('Vantar DATABASE_URL');
  process.exit(1);
}

// Notum SSL tengingu við gagnagrunn ef við erum *ekki* í development mode, þ.e.a.s. á local vél
const ssl = nodeEnv !== 'development' ? { rejectUnauthorized: false } : false;

const pool = new pg.Pool({ connectionString, ssl });

pool.on('error', (err) => {
  console.error('Villa í tengingu við gagnagrunn, forrit hættir', err);
  process.exit(-1);
});

export async function query(_query, values = []) {
  const client = await pool.connect();

  try {
    const result = await client.query(_query, values);
    return result;
  } finally {
    client.release();
  }
}

/**
 * Insert a single registration into the registration table.
 *
 * @param {string} entry.name – Name of registrant
 * @param {string} entry.nationalId – National ID of registrant
 * @param {string} entry.comment – Comment, if any from registrant
 * @param {boolean} entry.anonymous – If the registrants name should be displayed or not
 * @returns {Promise<boolean>} Promise, resolved as true if inserted, otherwise false
 */
export async function insert({
  name, nationalId, comment, anonymous, 
} = {}) {
  let success = true;

  const q = `
    INSERT INTO signatures
      (name, nationalId, comment, anonymous)
    VALUES
      ($1, $2, $3, $4);`;
  const values = [name, nationalId, comment, anonymous === 'on'];
  try {
    await query(q, values);
  } catch (e) {
    console.error('Error inserting signature', e);
    success = false;
  }
  return success;
}

/**
 * List all registrations from the registration table.
 *
 * @returns {Promise<Array<list>>} Promise, resolved to array of all registrations.
 */
export async function list() {
  let result = [];
  try {
    const queryResult = await query(
      'SELECT name, nationalId, comment, anonymous, signed FROM signatures ORDER BY signed DESC',
    );

    if (queryResult && queryResult.rows) {
      result = queryResult.rows;
    }
  } catch (e) {
    console.error('Error selecting signatures', e);
  }

  return result;
}
/**
 * Function that returns a page{bool prev, [] result, bool next} object
 * @param {integer} page Number of the page to fetch from the DB
 */
export async function selectPage(page, pageSize = 50) {
  // Make sure page is a positive integer.
  if(!Number.isInteger(page) || page < 1) {
    page = 1;
  }
  const pageObj = {
    prev: page !== 1,
    result: [],
    next: false,
  }

  try {
    const q = 'SELECT * FROM signatures ORDER BY id OFFSET $1 LIMIT $2';
    const queryResult = await query(q, [((page-1)*pageSize) + 1, pageSize + 1]); // tries to get one more record to determine if there is another page

    if (queryResult && queryResult.rows) {
      pageObj.result = queryResult.rows;
    }
  }
  catch (e) {
    console.error('Error selecting page', e);
  }

  if (pageObj.result.length === pageSize + 1) {
    pageObj.next = true;
    pageObj.result.pop();
  }

  return pageObj;
}

// Helper to remove pg from the event loop
export async function end() {
  await pool.end();
}