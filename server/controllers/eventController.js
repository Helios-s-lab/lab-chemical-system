const pool = require('../config/db');

// 获取事件列表
exports.getEventList = async (req, res) => {
  try {
    const [rows] = await pool.query(`SELECT * FROM v_event_tracking ORDER BY event_id DESC`);
    res.json({ message: '获取事件列表成功', data: rows });
  } catch (error) {
    console.error('获取事件列表失败:', error);
    res.status(500).json({ message: '获取事件列表失败', error: error.message });
  }
};

// 上报事件
exports.createEvent = async (req, res) => {
  try {
    const { lab_id, report_user_id, event_type, event_level, event_desc, status } = req.body;

    const [result] = await pool.query(
      `INSERT INTO safety_event (lab_id, report_user_id, event_type, event_level, event_desc, status)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [lab_id, report_user_id, event_type, event_level, event_desc, status || '待处理']
    );

    res.json({ message: '上报事件成功', event_id: result.insertId });
  } catch (error) {
    console.error('上报事件失败:', error);
    res.status(500).json({ message: '上报事件失败', error: error.message });
  }
};

// 处理事件
exports.handleEvent = async (req, res) => {
  try {
    const { event_id, handler_user_id, handle_content, handle_result } = req.body;

    const [result] = await pool.query(
      `INSERT INTO event_handle_record (event_id, handler_user_id, handle_content, handle_result)
       VALUES (?, ?, ?, ?)`,
      [event_id, handler_user_id, handle_content, handle_result]
    );

    res.json({ message: '事件处理成功', handle_id: result.insertId });
  } catch (error) {
    console.error('事件处理失败:', error);
    res.status(500).json({ message: '事件处理失败', error: error.message });
  }
};