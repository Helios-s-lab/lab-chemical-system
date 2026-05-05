const pool = require('../config/db');

exports.getEventList = async (req, res) => {
  try {
    const result = await pool.query(`SELECT * FROM v_event_tracking ORDER BY event_id DESC`);
    res.json({ message: '获取事件列表成功', data: result.rows });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: '获取事件列表失败', error: error.message });
  }
};

exports.createEvent = async (req, res) => {
  try {
    const { lab_id, report_user_id, event_type, event_level, event_desc, status } = req.body;
    const result = await pool.query(
      `INSERT INTO safety_event (lab_id, report_user_id, event_type, event_level, event_desc, status)
       VALUES ($1,$2,$3,$4,$5,$6) RETURNING event_id`,
      [lab_id, report_user_id, event_type, event_level, event_desc, status || '待处理']
    );
    res.json({ message: '上报事件成功', event_id: result.rows[0].event_id });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: '上报事件失败', error: error.message });
  }
};

exports.handleEvent = async (req, res) => {
  try {
    const { event_id, handler_user_id, handle_content, handle_result } = req.body;
    const result = await pool.query(
      `INSERT INTO event_handle_record (event_id, handler_user_id, handle_content, handle_result)
       VALUES ($1,$2,$3,$4) RETURNING handle_id`,
      [event_id, handler_user_id, handle_content, handle_result]
    );
    res.json({ message: '事件处理成功', handle_id: result.rows[0].handle_id });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: '事件处理失败', error: error.message });
  }
};