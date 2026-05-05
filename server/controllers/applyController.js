const pool = require('../config/db');

exports.getApplyList = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT a.apply_id, u.real_name AS apply_user_name, l.lab_name, c.chemical_name,
             a.apply_quantity, a.usage_purpose, a.apply_time, a.status
      FROM apply_record a
      JOIN sys_user u ON a.apply_user_id = u.user_id
      JOIN laboratory l ON a.lab_id = l.lab_id
      JOIN chemical c ON a.chemical_id = c.chemical_id
      ORDER BY a.apply_id DESC
    `);
    res.json({ message: '获取申请列表成功', data: result.rows });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: '获取申请列表失败', error: error.message });
  }
};

exports.getPendingApply = async (req, res) => {
  try {
    const result = await pool.query(`SELECT * FROM v_pending_apply`);
    res.json({ message: '获取待审批申请成功', data: result.rows });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: '获取待审批申请失败', error: error.message });
  }
};

exports.createApply = async (req, res) => {
  try {
    const { apply_user_id, lab_id, chemical_id, apply_quantity, usage_purpose } = req.body;
    const result = await pool.query(
      `INSERT INTO apply_record (apply_user_id, lab_id, chemical_id, apply_quantity, usage_purpose)
       VALUES ($1,$2,$3,$4,$5) RETURNING apply_id`,
      [apply_user_id, lab_id, chemical_id, apply_quantity, usage_purpose]
    );
    res.json({ message: '提交申请成功', apply_id: result.rows[0].apply_id });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: '提交申请失败', error: error.message });
  }
};

exports.approveApply = async (req, res) => {
  try {
    const { apply_id, approver_user_id, approval_result, approval_opinion } = req.body;
    const result = await pool.query(
      `INSERT INTO approval_record (apply_id, approver_user_id, approval_result, approval_opinion)
       VALUES ($1,$2,$3,$4) RETURNING approval_id`,
      [apply_id, approver_user_id, approval_result, approval_opinion]
    );
    res.json({ message: '审批成功', approval_id: result.rows[0].approval_id });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: '审批失败', error: error.message });
  }
};