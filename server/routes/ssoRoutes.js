const express = require('express');
const jwt = require('jsonwebtoken');
const db = require('../Config/connection');

const router = express.Router();
router.post('/sso/e2e', (req, res) => {
  const assertion = req.body && req.body.assertion;
  const trustKey = process.env.E2E_SSO_SECRET;
  if (!trustKey) return res.status(503).json({ message: 'E2E SSO is not configured' });
  if (!assertion) return res.status(400).json({ message: 'SSO assertion is required' });
  let identity;
  try {
    identity = jwt.verify(assertion, trustKey, { algorithms:['HS256'],issuer:'e2e-tracking',audience:'teamflow-manager' });
  } catch (error) {
    return res.status(401).json({ message: 'Invalid or expired E2E assertion' });
  }
  if (identity.purpose !== 'teamflow_sso' || !identity.teamflow_user_id) {
    return res.status(403).json({ message: 'This assertion cannot access TeamFlow' });
  }
  db.query('SELECT id,email,full_name,role FROM users WHERE id=? AND LOWER(email)=LOWER(?) LIMIT 1',
    [Number(identity.teamflow_user_id), identity.email], (error, rows) => {
      if (error) return res.status(500).json({ message: 'Unable to validate candidate identity' });
      if (!rows.length) return res.status(403).json({ message: 'Mapped TeamFlow user was not found' });
      const user = rows[0];
      const token = jwt.sign({ id:user.id,email:user.email,name:user.full_name,role:user.role,candidate_id:identity.candidate_id },
        process.env.JWT_SECRET, { expiresIn:'1d' });
      return res.json({ message:'SSO successful',token,user:{ id:user.id,name:user.full_name,email:user.email,role:user.role } });
    });
});
module.exports = router;
