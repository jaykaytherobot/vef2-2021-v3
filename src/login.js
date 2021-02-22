// import { id } from 'date-fns/locale';
import passport from 'passport';
import { Strategy } from 'passport-local';
import { findByUsername, findById, comparePassword } from './users.js';

// Hægt að útfæra passport virkni hér til að létta á app.js

export default passport;

passport.use(new Strategy(
  async (username, password, done) => {
    try {
      const user = await findByUsername(username);

      if (!user) {
        return done(null, false);
      }

      const result = await comparePassword(user, password);

      return done(null, result);
    } catch (e) {
      console.error(e);
      return done(e);
    }
  },
));

passport.serializeUser((user, done) => done(null, user.id));

passport.deserializeUser(async (id, done) => {
  try {
    const user = await findById(id);
    return done(null, user);
  } catch (e) {
    return done(e);
  }
});
