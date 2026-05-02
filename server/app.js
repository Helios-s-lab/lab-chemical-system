const express = require('express');
const cors = require('cors');
require('dotenv').config();

const pool = require('./config/db');
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const labRoutes = require('./routes/labRoutes');
const chemicalRoutes = require('./routes/chemicalRoutes');
const inventoryRoutes = require('./routes/inventoryRoutes');
const applyRoutes = require('./routes/applyRoutes');
const eventRoutes = require('./routes/eventRoutes');


const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get('/', (req, res) => {
  res.json({ message: '后端服务启动成功！' });
});

app.get('/test-db', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT NOW() AS currentTime');
    res.json({
      message: '数据库连接成功',
      data: rows
    });
  } catch (error) {
    console.error('数据库连接失败:', error);
    res.status(500).json({
      message: '数据库连接失败',
      error: error.message
    });
  }
});

app.get('/test-users', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT user_id, username, real_name, status FROM user');
    res.json({
      message: '用户数据获取成功',
      data: rows
    });
  } catch (error) {
    console.error('查询用户失败:', error);
    res.status(500).json({
      message: '查询用户失败',
      error: error.message
    });
  }
});

// 登录路由
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/labs', labRoutes);
app.use('/api/chemicals', chemicalRoutes);
app.use('/api/inventory', inventoryRoutes);
app.use('/api/apply', applyRoutes);
app.use('/api/events', eventRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running at http://localhost:${PORT}`);
});
