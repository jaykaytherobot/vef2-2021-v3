import express from 'express';
import { selectPage, deleteSignatureById } from './db.js';

export const router = express.Router();

function ensureLoggedIn(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }
  return res.redirect('/login');
}

router.get('/admin', ensureLoggedIn, async (req, res) => {
  let { page = 1 } = req.query;
  page = Number(page);

  const formData = {
    name: '',
    nationalId: '',
    anonymous: false,
    comment: '',
  };

  const registrationPage = await selectPage(page);

  res.render('admin', {formData, registrationPage});
});


router.post('/delete', ensureLoggedIn, async (req, res) => {
  let { id } = req.body;
  id = Number(id);
  if( !Number.isInteger(id)) {
    id = -1;
    console.log('not an integer');
  }
  await deleteSignatureById(id);
  
  res.redirect('/admin');
});