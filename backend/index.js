const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');
const db = require('./db');

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const JWT_SECRET = process.env.JWT_SECRET;

const verifyToken = (req, res, next) => {
  const token = req.header('Authorization')?.replace('Bearer ', '');
  if (!token) {
    return res.status(401).json({ error: 'Access denied. No token provided.' });
  }

  jwt.verify(token, JWT_SECRET, (err, decoded) => {
    if (err) {
      return res.status(401).json({ error: 'Invalid or expired token.' });
    }

    req.user = decoded; 
    next(); 
  });
};

// ------------------ CLIENT SIGNUP ------------------
app.post('/signup', (req, res) => {
  const {
    firstName,
    middleInitial = null,
    lastName,
    birthdate,
    contactNumber,
    ltmsNumber,
    email,
    password,
    confirmPassword
  } = req.body;

  if (password !== confirmPassword) {
    return res.status(400).json({ error: 'Passwords do not match' });
  }

  bcrypt.hash(password, 10, (err, hash) => {
    if (err) return res.status(500).json({ error: 'Error hashing password' });

    db.query(
      `INSERT INTO users 
        (first_name, middle_initial, last_name, birthdate, contact_number, ltms_number, email, password) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [firstName, middleInitial, lastName, birthdate, contactNumber, ltmsNumber, email, hash],
      (err) => {
        if (err) {
          console.error(err);
          return res.status(400).json({ error: 'Email or LTMS number may already exist' });
        }
        res.json({ message: 'User registered successfully' });
      }
    );
  });
});

// ------------------ CLIENT SIGNIN ------------------
app.post('/signin', (req, res) => {
  const { email, password } = req.body;

  db.query('SELECT * FROM users WHERE email = ?', [email], (err, results) => {
    if (err || results.length === 0) {
      return res.status(400).json({ error: 'Invalid email or password' });
    }

    const user = results[0];

    bcrypt.compare(password, user.password, (err, isMatch) => {
      if (err || !isMatch) {
        return res.status(400).json({ error: 'Invalid credentials' });
      }

      const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, { expiresIn: '1h' });

      res.json({ message: 'Logged in successfully', token, userId: user.id });
    });
  });
});

// ------------------ GET USER INFO BY ID ------------------
app.get('/users/:id', verifyToken, (req, res) => {
  const userId = req.params.id;

  if (parseInt(userId) !== req.user.id) {
    return res.status(403).json({ error: 'Forbidden. You can only access your own data.' });
  }

  db.query('SELECT * FROM users WHERE id = ?', [userId], (err, results) => {
    if (err || results.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    const user = results[0];
    res.json({
      first_name: user.first_name,
      middle_initial: user.middle_initial,
      last_name: user.last_name,
      birthdate: user.birthdate,
      contact_number: user.contact_number,
      ltms_number: user.ltms_number,
      email: user.email
    });
  });
});

// ------------------ EDIT USER INFO BY ID ------------------
app.put('/users/:id', verifyToken, (req, res) => {
  const userId = parseInt(req.params.id);

  if (userId !== req.user.id) {
    return res.status(403).json({ error: 'Forbidden. You can only update your own data.' });
  }

  const {
    firstName,
    middleInitial,
    lastName,
    birthdate,
    contactNumber,
    ltmsNumber,
    email
  } = req.body;

  db.query(
    `UPDATE users SET first_name = ?, middle_initial = ?, last_name = ?, birthdate = ?, contact_number = ?, ltms_number = ?, email = ? WHERE id = ?`,
    [firstName, middleInitial, lastName, birthdate, contactNumber, ltmsNumber, email, userId],
    (err) => {
      if (err) {
        console.error(err);
        return res.status(500).json({ error: 'Failed to update user info' });
      }
      res.json({ message: 'User info updated successfully' });
    }
  );
});

// ------------------ DELETE USER INFO BY ID ------------------
app.delete('/users/:id', verifyToken, (req, res) => {
  const userId = parseInt(req.params.id);

  if (parseInt(userId) !== req.user.id) {
    return res.status(403).json({ error: 'Forbidden. You can only access your own data.' });
  }  

  db.query('DELETE FROM users WHERE id = ?', [userId], (err) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: 'Failed to delete user' });
    }
    res.json({ message: 'User deleted successfully' });
  });
});



// ------------------ START SERVER ------------------
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

// ------------------ CLIENT: Request Appointment ------------------
app.post('/appointments', (req, res) => {
  const { client_id, appointment_date, appointment_time, status, request_date, user_id, transaction_type, uploaded_files } = req.body;

  db.query(
    `INSERT INTO appointments (client_id, appointment_date, appointment_time, status, request_date, user_id, transaction_type, uploaded_files) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [client_id, appointment_date, appointment_time, status, request_date, user_id, transaction_type, uploaded_files],
    (err) => {
      if (err) {
        console.error('Appointment Error:', err);
        return res.status(500).json({ error: 'Failed to create appointment' });
      }
      res.json({ message: 'Appointment requested' });
    }
  );
});

// ------------------ ADMIN: View Appointments ------------------
app.get('/admin/appointments', (req, res) => {
  db.query(
    `SELECT a.id, u.first_name, u.last_name, a.appointment_date, a.appointment_time, a.status 
     FROM appointments a 
     JOIN users u ON a.client_id = u.id 
     ORDER BY a.appointment_date, a.appointment_time`,
    (err, results) => {
      if (err) {
        console.error('Fetch error:', err);
        return res.status(500).json({ error: 'Failed to fetch appointments' });
      }
      res.json(results);
    }
  );
});

// ------------------ ADMIN: Update Status ------------------
app.post('/admin/appointments/:id/status', (req, res) => {
  const appointmentId = req.params.id;
  const { status } = req.body;

  if (!['pending', 'accepted', 'rejected'].includes(status)) {
    return res.status(400).json({ error: 'Invalid status' });
  }

  db.query(
    `UPDATE appointments SET status = ? WHERE id = ?`,
    [status, appointmentId],
    (err) => {
      if (err) {
        console.error('Update error:', err);
        return res.status(500).json({ error: 'Failed to update status' });
      }
      res.json({ message: 'Status updated' });
    }
  );
});

// ------------------ CLIENT: View Their Appointments ------------------
app.get('/appointments/client/:clientId', (req, res) => {
  const clientId = req.params.clientId;

  db.query(
    `SELECT * FROM appointments WHERE client_id = ? ORDER BY appointment_date DESC`,
    [clientId],
    (err, results) => {
      if (err) {
        console.error('Fetch error:', err);
        return res.status(500).json({ error: 'Failed to fetch appointments' });
      }
      res.json(results);
    }
  );
});
