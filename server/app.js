// server/app.js
const express = require('express');
const cors = require('cors');
const app = express();
const authRoutes = require('./routes/authRoutes');
const mindmapRoutes = require('./routes/mindmapRoutes');
const thankRoutes = require('./routes/thankRoutes');
const connectDB = require('./db/index');

app.use(cors());
app.use(express.json());

// DB接続
connectDB();

// ルーティング
app.use('/api/mindmaps', mindmapRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/thank', thankRoutes);

const PORT = process.env.PORT;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
