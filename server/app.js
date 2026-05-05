const express = require('express');
const cors = require('cors');
const path = require('path');
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

// test-db 路由
app.get('/test-db', async (req, res) => {
  try {
    const result = await pool.query('SELECT NOW() AS currentTime');
    res.json({
      message: '数据库连接成功',
      data: result.rows
    });
  } catch (error) {
    console.error('数据库连接失败:', error);
    res.status(500).json({
      message: '数据库连接失败',
      error: error.message
    });
  }
});

// test-users 路由 — 注意表名要改成 sys_user
app.get('/test-users', async (req, res) => {
  try {
    const result = await pool.query('SELECT user_id, username, real_name, status FROM sys_user');
    res.json({
      message: '用户数据获取成功',
      data: result.rows
    });
  } catch (error) {
    console.error('查询用户失败:', error);
    res.status(500).json({
      message: '查询用户失败',
      error: error.message
    });
  }
});

// API 路由
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/labs', labRoutes);
app.use('/api/chemicals', chemicalRoutes);
app.use('/api/inventory', inventoryRoutes);
app.use('/api/apply', applyRoutes);
app.use('/api/events', eventRoutes);

// 托管前端静态文件
app.use(express.static(path.join(__dirname, 'dist')));

// 解决前端路由刷新问题
app.use((req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

// 导出 app 实例（给 Vercel Serverless 使用）
module.exports = app;

// 如果当前环境不是 Vercel（即没有 IS_VERCEL 环境变量），则启动本地服务器
if (!process.env.IS_VERCEL) {
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => {
    console.log(`Server is running at http://localhost:${PORT}`);
  });
}
