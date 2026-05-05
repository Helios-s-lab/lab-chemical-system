const pool = require('../config/db');

exports.getAllLabs = async (req, res) => {
  try {
    const result = await pool.query(`SELECT * FROM laboratory ORDER BY lab_id DESC`);
    res.json({ message: '获取实验室列表成功', data: result.rows });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: '获取实验室失败', error: error.message });
  }
};

exports.createLab = async (req, res) => {
  try {
    const { lab_name, location, safety_level, status, remark } = req.body;
    const result = await pool.query(
      `INSERT INTO laboratory (lab_name, location, safety_level, status, remark)
       VALUES ($1,$2,$3,$4,$5) RETURNING lab_id`,
      [lab_name, location, safety_level, status || '正常', remark]
    );
    res.json({ message: '新增实验室成功', lab_id: result.rows[0].lab_id });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: '新增实验室失败', error: error.message });
  }
};

exports.updateLab = async (req, res) => {
  try {
    const { id } = req.params;
    const { lab_name, location, safety_level, status, remark } = req.body;
    await pool.query(
      `UPDATE laboratory SET lab_name=$1, location=$2, safety_level=$3, status=$4, remark=$5 WHERE lab_id=$6`,
      [lab_name, location, safety_level, status, remark, id]
    );
    res.json({ message: '修改实验室成功' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: '修改实验室失败', error: error.message });
  }
};

exports.deleteLab = async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query(`DELETE FROM laboratory WHERE lab_id=$1`, [id]);
    res.json({ message: '删除实验室成功' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: '删除实验室失败，可能存在关联数据', error: error.message });
  }
};