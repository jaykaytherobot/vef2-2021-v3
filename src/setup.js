import { promises } from 'fs';
import faker from 'faker';
import { query as query } from './db.js';

const TWO_WEEKS = 1209600000; // Two weeks in ms

/**
 * Returns a IS-SSN-like number
 */
function getRandomNationalId() {
  let id = 0;
  for(let i = 0; i < 10; i++) {
    const digit = Math.floor((Math.random()*10));
    id += digit*Math.pow(10, i);
  }
  return id;
}
/**
 * Returns a Date object from the interval [two weeks ago; now]
 */
function getSignDate() {
  const now = Date.now();
  const past = now - TWO_WEEKS;
  let offset = faker.random.number(now - past);
  return new Date(past + offset);
}

// Clear database
await query('DROP TABLE IF EXISTS signatures');
await query(`CREATE TABLE IF NOT EXISTS signatures(
  id serial primary key,
  name varchar(128) not null,
  nationalId varchar(10) not null unique,
  comment varchar(400) not null,
  anonymous boolean not null default true,
  signed timestamp with time zone not null default current_timestamp
)`);

let name, nationalId, comment, anonymous, signed;

// Create 500 users
for(let i = 0; i < 500; i++) {
  name = faker.name.findName();
  nationalId = getRandomNationalId();
  comment = Math.random() < 0.5 ? faker.lorem.sentence() : '';
  anonymous = Math.random() < 0.5;
  signed = getSignDate();
  await query('INSERT INTO signatures(name, nationalId, comment, anonymous, signed) VALUES($1, $2, $3, $4, $5)', [name, nationalId, comment, anonymous, signed]);
}