const express = require('express');
const cors = require('cors');

const usersRoutes = require('./Routes/usersRoutes');
const circuitsRoutes = require('./Routes/circuitsRoutes');
const authRoutes = require('./Routes/authRoutes');
const teamsRoutes = require('./Routes/teamRoutes');
const commentsRoutes = require('./Routes/commentRoutes')
const optionalRoutes = require('./Routes/optionalRoutes')
const uploadRoutes = require('./Routes/uploadRoutes')


let app = express();
app.use(express.json());
app.use(cors());
app.use("/uploads", express.static("uploads"))
app.use((req, res, next) => {
  req.requestedAt = new Date().toISOString();
  next();
})


//* ROUTES
app.use("/", authRoutes);
app.use("/users", usersRoutes)
app.use("/circuits", circuitsRoutes)
app.use('/main', teamsRoutes)
app.use('/comments', commentsRoutes)
app.use('/optional', optionalRoutes)
app.use('/upload', uploadRoutes)

//* TEST ROUTE *
app.get('/', (req, res, next) => {
  res.status(200).json({
    status: 'Success',
    message: 'Online'
  })
})

module.exports = app