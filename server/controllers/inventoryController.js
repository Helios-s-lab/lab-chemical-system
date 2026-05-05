const pool = require('../config/db');

exports.getInventoryList = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT i.inventory_id, l.lab_name, c.chemical_name, c.danger_level,
             i.current_quantity, i.warning_threshold, i.status, i.update_time
      FROM inventory i
      JOIN laboratory l ON i.lab_id = l.lab_id
      JOIN chemical c ON i.chemical_id = c.chemical_id
      ORDER BY i.inventory_id DESC
    `);
    res.json({ message: '获取库存列表成功', data: result.rows });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: '获取库存失败', error: error.message });
  }
};

exports.getWarningInventory = async (req, res) => {
  try {
    const result = await pool.query(`SELECT * FROM v_inventory_warning`);
    res.json({ message: '获取预警库存成功', data: result.rows });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: '获取预警库存失败', error: error.message });
  }
};

exports.createInboundRecord = async (req, res) => {
  try {
    const { chemical_id, lab_id, quantity, supplier, operator_user_id, remark } = req.body;
    const result = await pool.query(
      `INSERT INTO inbound_record (chemical_id, lab_id, quantity, supplier, operator_user_id, remark)
       VALUES ($1,$2,$3,$4,$5,$6) RETURNING inbound_id`,
      [chemical_id, lab_id, quantity, supplier, operator_user_id, remark]
    );
    res.json({ message: '新增入库成功', inbound_id: result.rows[0].inbound_id });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: '新增入库失败', error: error.message });
  }
};