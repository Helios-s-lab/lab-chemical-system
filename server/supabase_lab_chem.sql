-- ============================================
-- 清理旧对象
-- ============================================
DROP VIEW IF EXISTS v_inventory_warning CASCADE;
DROP VIEW IF EXISTS v_pending_apply CASCADE;
DROP VIEW IF EXISTS v_event_tracking CASCADE;

DROP TRIGGER IF EXISTS trg_after_inbound_insert ON inbound_record CASCADE;
DROP TRIGGER IF EXISTS trg_after_approval_insert ON approval_record CASCADE;
DROP TRIGGER IF EXISTS trg_after_usage_return_insert ON usage_return_record CASCADE;

DROP FUNCTION IF EXISTS fn_after_inbound_insert CASCADE;
DROP FUNCTION IF EXISTS fn_after_approval_insert CASCADE;
DROP FUNCTION IF EXISTS fn_after_usage_return_insert CASCADE;
DROP FUNCTION IF EXISTS sp_get_lab_inventory CASCADE;
DROP FUNCTION IF EXISTS sp_get_apply_statistics CASCADE;
DROP FUNCTION IF EXISTS sp_get_event_statistics CASCADE;

DROP TABLE IF EXISTS attachment CASCADE;
DROP TABLE IF EXISTS event_handle_record CASCADE;
DROP TABLE IF EXISTS safety_event CASCADE;
DROP TABLE IF EXISTS rectification_record CASCADE;
DROP TABLE IF EXISTS inspection_record CASCADE;
DROP TABLE IF EXISTS training_participant CASCADE;
DROP TABLE IF EXISTS training CASCADE;
DROP TABLE IF EXISTS usage_return_record CASCADE;
DROP TABLE IF EXISTS approval_record CASCADE;
DROP TABLE IF EXISTS apply_record CASCADE;
DROP TABLE IF EXISTS inbound_record CASCADE;
DROP TABLE IF EXISTS inventory CASCADE;
DROP TABLE IF EXISTS chemical CASCADE;
DROP TABLE IF EXISTS chemical_category CASCADE;
DROP TABLE IF EXISTS sys_user CASCADE;
DROP TABLE IF EXISTS laboratory CASCADE;
DROP TABLE IF EXISTS role CASCADE;

-- ============================================
-- 重建数据库（sys_user 版）
-- ============================================
CREATE TABLE role (
    role_id SERIAL PRIMARY KEY,
    role_name VARCHAR(50) NOT NULL UNIQUE,
    role_desc VARCHAR(200)
);

CREATE TABLE laboratory (
    lab_id SERIAL PRIMARY KEY,
    lab_name VARCHAR(100) NOT NULL,
    location VARCHAR(100),
    safety_level VARCHAR(20),
    status VARCHAR(20) DEFAULT '正常',
    remark VARCHAR(255)
);

CREATE TABLE sys_user (
    user_id SERIAL PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    password VARCHAR(100) NOT NULL,
    real_name VARCHAR(50) NOT NULL,
    gender VARCHAR(10),
    phone VARCHAR(20),
    email VARCHAR(100),
    role_id INT NOT NULL REFERENCES role(role_id),
    lab_id INT REFERENCES laboratory(lab_id),
    status VARCHAR(20) DEFAULT '正常',
    create_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE chemical_category (
    category_id SERIAL PRIMARY KEY,
    category_name VARCHAR(100) NOT NULL UNIQUE,
    danger_level_desc VARCHAR(100),
    remark VARCHAR(255)
);

CREATE TABLE chemical (
    chemical_id SERIAL PRIMARY KEY,
    chemical_name VARCHAR(100) NOT NULL,
    category_id INT NOT NULL REFERENCES chemical_category(category_id),
    cas_no VARCHAR(50) UNIQUE,
    danger_level VARCHAR(20) NOT NULL,
    unit VARCHAR(20) NOT NULL,
    storage_requirement VARCHAR(255),
    validity_date DATE,
    sds_file_path VARCHAR(255),
    status VARCHAR(20) DEFAULT '正常',
    remark VARCHAR(255)
);

CREATE TABLE inventory (
    inventory_id SERIAL PRIMARY KEY,
    chemical_id INT NOT NULL REFERENCES chemical(chemical_id),
    lab_id INT NOT NULL REFERENCES laboratory(lab_id),
    current_quantity DECIMAL(10,2) NOT NULL DEFAULT 0,
    warning_threshold DECIMAL(10,2) NOT NULL DEFAULT 10,
    status VARCHAR(20) DEFAULT '正常',
    update_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (chemical_id, lab_id)
);

CREATE TABLE inbound_record (
    inbound_id SERIAL PRIMARY KEY,
    chemical_id INT NOT NULL REFERENCES chemical(chemical_id),
    lab_id INT NOT NULL REFERENCES laboratory(lab_id),
    quantity DECIMAL(10,2) NOT NULL,
    supplier VARCHAR(100),
    operator_user_id INT NOT NULL REFERENCES sys_user(user_id),
    inbound_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    remark VARCHAR(255)
);

CREATE TABLE apply_record (
    apply_id SERIAL PRIMARY KEY,
    apply_user_id INT NOT NULL REFERENCES sys_user(user_id),
    lab_id INT NOT NULL REFERENCES laboratory(lab_id),
    chemical_id INT NOT NULL REFERENCES chemical(chemical_id),
    apply_quantity DECIMAL(10,2) NOT NULL,
    usage_purpose VARCHAR(255),
    apply_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    status VARCHAR(20) DEFAULT '待审批'
);

CREATE TABLE approval_record (
    approval_id SERIAL PRIMARY KEY,
    apply_id INT NOT NULL REFERENCES apply_record(apply_id),
    approver_user_id INT NOT NULL REFERENCES sys_user(user_id),
    approval_result VARCHAR(20) NOT NULL,
    approval_opinion VARCHAR(255),
    approval_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE usage_return_record (
    usage_id SERIAL PRIMARY KEY,
    apply_id INT NOT NULL REFERENCES apply_record(apply_id),
    used_quantity DECIMAL(10,2) NOT NULL,
    returned_quantity DECIMAL(10,2) DEFAULT 0,
    return_time TIMESTAMP,
    abnormal_flag VARCHAR(20) DEFAULT '否',
    remark VARCHAR(255)
);

CREATE TABLE training (
    training_id SERIAL PRIMARY KEY,
    training_title VARCHAR(100) NOT NULL,
    training_content TEXT,
    training_time TIMESTAMP NOT NULL,
    organizer_user_id INT NOT NULL REFERENCES sys_user(user_id),
    attachment_path VARCHAR(255),
    remark VARCHAR(255)
);

CREATE TABLE training_participant (
    participant_id SERIAL PRIMARY KEY,
    training_id INT NOT NULL REFERENCES training(training_id),
    user_id INT NOT NULL REFERENCES sys_user(user_id),
    sign_status VARCHAR(20) DEFAULT '未签到',
    score DECIMAL(5,2),
    result VARCHAR(20)
);

CREATE TABLE inspection_record (
    inspection_id SERIAL PRIMARY KEY,
    lab_id INT NOT NULL REFERENCES laboratory(lab_id),
    inspector_user_id INT NOT NULL REFERENCES sys_user(user_id),
    inspection_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    inspection_content TEXT,
    result VARCHAR(50),
    remark VARCHAR(255)
);

CREATE TABLE rectification_record (
    rectify_id SERIAL PRIMARY KEY,
    inspection_id INT NOT NULL REFERENCES inspection_record(inspection_id),
    problem_desc TEXT NOT NULL,
    responsible_user_id INT NOT NULL REFERENCES sys_user(user_id),
    deadline TIMESTAMP,
    status VARCHAR(20) DEFAULT '待整改',
    rectify_result VARCHAR(255)
);

CREATE TABLE safety_event (
    event_id SERIAL PRIMARY KEY,
    lab_id INT NOT NULL REFERENCES laboratory(lab_id),
    report_user_id INT NOT NULL REFERENCES sys_user(user_id),
    event_type VARCHAR(50) NOT NULL,
    event_level VARCHAR(20) NOT NULL,
    event_desc TEXT NOT NULL,
    event_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    status VARCHAR(20) DEFAULT '待处理'
);

CREATE TABLE event_handle_record (
    handle_id SERIAL PRIMARY KEY,
    event_id INT NOT NULL REFERENCES safety_event(event_id),
    handler_user_id INT NOT NULL REFERENCES sys_user(user_id),
    handle_content TEXT NOT NULL,
    handle_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    handle_result VARCHAR(100)
);

CREATE TABLE attachment (
    attachment_id SERIAL PRIMARY KEY,
    event_id INT REFERENCES safety_event(event_id),
    training_id INT REFERENCES training(training_id),
    file_name VARCHAR(255) NOT NULL,
    file_type VARCHAR(50),
    file_path VARCHAR(255) NOT NULL,
    upload_user_id INT NOT NULL REFERENCES sys_user(user_id),
    upload_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 索引
CREATE INDEX idx_sys_user_role_id ON sys_user(role_id);
CREATE INDEX idx_sys_user_lab_id ON sys_user(lab_id);
CREATE INDEX idx_chemical_name ON chemical(chemical_name);
CREATE INDEX idx_inventory_chemical_lab ON inventory(chemical_id, lab_id);
CREATE INDEX idx_apply_status_time ON apply_record(status, apply_time);
CREATE INDEX idx_approval_apply_id ON approval_record(apply_id);
CREATE INDEX idx_event_status_time ON safety_event(status, event_time);
CREATE INDEX idx_inspection_lab_id ON inspection_record(lab_id);
CREATE INDEX idx_rectify_status ON rectification_record(status);
CREATE INDEX idx_training_time ON training(training_time);

-- 基础数据
INSERT INTO role (role_name, role_desc) VALUES
('系统管理员', '负责系统配置与维护'),
('实验室管理员', '负责实验室与库存管理'),
('安全管理员', '负责审批、巡检与安全事件管理'),
('教师', '负责申请与使用危化品'),
('学生', '参与实验与培训');

INSERT INTO laboratory (lab_name, location, safety_level, status, remark) VALUES
('化学实验室A', '实验楼A-301', '高', '正常', '有机化学实验室'),
('化学实验室B', '实验楼A-302', '中', '正常', '分析化学实验室'),
('材料实验室', '实验楼B-201', '中', '正常', '材料合成实验室'),
('生物实验室', '实验楼C-101', '高', '正常', '生物试剂实验室'),
('环境检测实验室', '实验楼D-205', '中', '正常', '环境分析实验室');

INSERT INTO sys_user (username, password, real_name, gender, phone, email, role_id, lab_id, status) VALUES
('admin', '123456', '系统管理员', '男', '13800000001', 'admin@example.com', 1, NULL, '正常'),
('labadmin1', '123456', '实验室管理员1', '女', '13800000002', 'lab1@example.com', 2, 1, '正常'),
('safeadmin', '123456', '安全管理员', '男', '13800000003', 'safe@example.com', 3, NULL, '正常'),
('teacher1', '123456', '张老师', '女', '13800000004', 'teacher1@example.com', 4, 1, '正常'),
('student1', '123456', '李学生', '男', '13800000005', 'student1@example.com', 5, 1, '正常'),
('teacher2', '123456', '王老师', '男', '13800000006', 'teacher2@example.com', 4, 2, '正常'),
('student2', '123456', '赵学生', '女', '13800000007', 'student2@example.com', 5, 2, '正常');

INSERT INTO chemical_category (category_name, danger_level_desc, remark) VALUES
('易燃液体', '高危险', '需远离火源'),
('腐蚀品', '中高危险', '需防护保存'),
('有毒品', '高危险', '严格管理'),
('氧化剂', '高危险', '避免混放'),
('易爆品', '高危险', '禁止高温摩擦'),
('压缩气体', '中高危险', '注意密封与防泄漏');

INSERT INTO chemical (chemical_name, category_id, cas_no, danger_level, unit, storage_requirement, validity_date, sds_file_path, status, remark) VALUES
('乙醇', 1, '64-17-5', '高', 'L', '阴凉通风，远离火源', '2027-12-31', '/files/sds/ethanol.pdf', '正常', '常用溶剂'),
('浓硫酸', 2, '7664-93-9', '高', 'L', '密封避光，防腐蚀', '2028-06-30', '/files/sds/h2so4.pdf', '正常', '强腐蚀性'),
('甲醇', 3, '67-56-1', '高', 'L', '阴凉密封保存', '2027-09-30', '/files/sds/methanol.pdf', '正常', '有毒易燃'),
('高锰酸钾', 4, '7722-64-7', '中', 'kg', '干燥保存，避免受潮', '2028-03-31', '/files/sds/kmno4.pdf', '正常', '氧化剂'),
('丙酮', 1, '67-64-1', '高', 'L', '阴凉通风，远离火源', '2027-11-30', '/files/sds/acetone.pdf', '正常', '易燃液体'),
('盐酸', 2, '7647-01-0', '高', 'L', '防腐蚀密封保存', '2028-05-31', '/files/sds/hcl.pdf', '正常', '挥发性腐蚀品'),
('氯仿', 3, '67-66-3', '高', 'L', '避光、低温、密封', '2027-08-31', '/files/sds/chloroform.pdf', '正常', '有毒溶剂'),
('双氧水', 4, '7722-84-1', '中', 'L', '避光低温保存', '2028-01-31', '/files/sds/h2o2.pdf', '正常', '氧化剂');

INSERT INTO inventory (chemical_id, lab_id, current_quantity, warning_threshold, status) VALUES
(1, 1, 50.00, 10.00, '正常'),
(2, 1, 20.00, 5.00, '正常'),
(3, 1, 8.00, 10.00, '预警'),
(4, 2, 30.00, 8.00, '正常'),
(5, 2, 25.00, 10.00, '正常'),
(6, 3, 15.00, 5.00, '正常'),
(7, 4, 6.00, 10.00, '预警'),
(8, 5, 12.00, 6.00, '正常');

INSERT INTO inbound_record (chemical_id, lab_id, quantity, supplier, operator_user_id, remark) VALUES
(1, 1, 50.00, '国药集团', 2, '首批入库'),
(2, 1, 20.00, '国药集团', 2, '首批入库'),
(3, 1, 8.00, '化学试剂公司', 2, '首批入库'),
(4, 2, 30.00, '试剂供应商A', 2, '首批入库'),
(5, 2, 25.00, '试剂供应商B', 2, '首批入库'),
(6, 3, 15.00, '试剂供应商C', 2, '首批入库'),
(7, 4, 6.00, '试剂供应商D', 2, '首批入库'),
(8, 5, 12.00, '试剂供应商E', 2, '首批入库');

INSERT INTO apply_record (apply_user_id, lab_id, chemical_id, apply_quantity, usage_purpose, status) VALUES
(4, 1, 1, 5.00, '有机实验教学', '待审批'),
(5, 1, 3, 2.00, '课程实验', '待审批'),
(6, 2, 4, 3.00, '氧化反应实验', '已通过'),
(7, 2, 5, 4.00, '样品清洗实验', '已驳回');

INSERT INTO approval_record (apply_id, approver_user_id, approval_result, approval_opinion) VALUES
(3, 3, '已通过', '用途明确，允许领用'),
(4, 3, '已驳回', '申请说明不充分');

INSERT INTO usage_return_record (apply_id, used_quantity, returned_quantity, return_time, abnormal_flag, remark) VALUES
(3, 2.50, 0.50, NOW(), '否', '正常使用并部分归还');

INSERT INTO training (training_title, training_content, training_time, organizer_user_id, attachment_path, remark) VALUES
('实验室危化品安全培训', '讲解危险化学品分类、储存和应急处理', '2025-05-01 09:00:00', 3, '/files/training/training1.pdf', '新学期培训'),
('实验室事故应急演练', '讲解泄漏与火灾事故应急流程', '2025-05-08 14:00:00', 3, '/files/training/training2.pdf', '应急演练');

INSERT INTO training_participant (training_id, user_id, sign_status, score, result) VALUES
(1, 4, '已签到', 92.00, '合格'),
(1, 5, '已签到', 88.00, '合格'),
(1, 6, '已签到', 90.00, '合格'),
(2, 4, '已签到', 95.00, '合格'),
(2, 7, '未签到', NULL, '未考核');

INSERT INTO inspection_record (lab_id, inspector_user_id, inspection_content, result, remark) VALUES
(1, 3, '检查危化品储存柜、消防设备、台账记录', '发现隐患', '部分危化品标签模糊'),
(2, 3, '检查通风橱、药品摆放和防护用品', '正常', '无明显问题'),
(4, 3, '检查有毒试剂存放区域', '发现隐患', '库存数量与台账有差异');

INSERT INTO rectification_record (inspection_id, problem_desc, responsible_user_id, deadline, status, rectify_result) VALUES
(1, '乙醇与甲醇标签老化，存在识别风险', 2, '2025-05-20 18:00:00', '整改中', '已采购新标签'),
(3, '氯仿库存记录与实际库存不一致', 2, '2025-05-22 18:00:00', '待整改', NULL);

INSERT INTO safety_event (lab_id, report_user_id, event_type, event_level, event_desc, status) VALUES
(1, 4, '泄漏', '中', '实验过程中乙醇少量泄漏，已初步处理', '处理中'),
(4, 7, '人员误操作', '高', '有毒试剂取用流程不规范，存在安全风险', '待处理');

INSERT INTO event_handle_record (event_id, handler_user_id, handle_content, handle_result) VALUES
(1, 3, '已组织现场清理并通风处理', '已控制'),
(1, 2, '补充实验室安全警示标识', '已完成');

INSERT INTO attachment (event_id, training_id, file_name, file_type, file_path, upload_user_id) VALUES
(1, NULL, '泄漏现场照片1.jpg', 'image/jpeg', '/files/events/event1_photo1.jpg', 4),
(NULL, 1, '危化品培训签到表.pdf', 'application/pdf', '/files/training/signin1.pdf', 3);

-- 视图
CREATE OR REPLACE VIEW v_inventory_warning AS
SELECT 
    i.inventory_id,
    l.lab_name,
    c.chemical_name,
    i.current_quantity,
    i.warning_threshold,
    i.status,
    i.update_time
FROM inventory i
JOIN laboratory l ON i.lab_id = l.lab_id
JOIN chemical c ON i.chemical_id = c.chemical_id
WHERE i.current_quantity <= i.warning_threshold
   OR i.status = '预警';

CREATE OR REPLACE VIEW v_pending_apply AS
SELECT 
    a.apply_id,
    u.real_name AS apply_user_name,
    l.lab_name,
    c.chemical_name,
    a.apply_quantity,
    a.usage_purpose,
    a.apply_time,
    a.status
FROM apply_record a
JOIN sys_user u ON a.apply_user_id = u.user_id
JOIN laboratory l ON a.lab_id = l.lab_id
JOIN chemical c ON a.chemical_id = c.chemical_id
WHERE a.status = '待审批';

CREATE OR REPLACE VIEW v_event_tracking AS
SELECT
    e.event_id,
    l.lab_name,
    u.real_name AS report_user_name,
    e.event_type,
    e.event_level,
    e.event_desc,
    e.event_time,
    e.status
FROM safety_event e
JOIN laboratory l ON e.lab_id = l.lab_id
JOIN sys_user u ON e.report_user_id = u.user_id;

-- 触发器与函数
CREATE OR REPLACE FUNCTION fn_after_inbound_insert() RETURNS TRIGGER AS $$
DECLARE
    existing_count INT;
BEGIN
    SELECT COUNT(*) INTO existing_count
    FROM inventory
    WHERE chemical_id = NEW.chemical_id AND lab_id = NEW.lab_id;

    IF existing_count = 0 THEN
        INSERT INTO inventory (chemical_id, lab_id, current_quantity, warning_threshold, status)
        VALUES (NEW.chemical_id, NEW.lab_id, NEW.quantity, 10, '正常');
    ELSE
        UPDATE inventory
        SET current_quantity = current_quantity + NEW.quantity,
            status = CASE 
                        WHEN current_quantity + NEW.quantity <= warning_threshold THEN '预警'
                        ELSE '正常'
                     END,
            update_time = NOW()
        WHERE chemical_id = NEW.chemical_id AND lab_id = NEW.lab_id;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_after_inbound_insert
AFTER INSERT ON inbound_record
FOR EACH ROW EXECUTE FUNCTION fn_after_inbound_insert();

CREATE OR REPLACE FUNCTION fn_after_approval_insert() RETURNS TRIGGER AS $$
DECLARE
    v_chemical_id INT;
    v_lab_id INT;
    v_apply_quantity DECIMAL(10,2);
BEGIN
    IF NEW.approval_result = '已通过' THEN
        SELECT chemical_id, lab_id, apply_quantity
        INTO v_chemical_id, v_lab_id, v_apply_quantity
        FROM apply_record
        WHERE apply_id = NEW.apply_id;

        UPDATE apply_record SET status = '已通过' WHERE apply_id = NEW.apply_id;

        UPDATE inventory
        SET current_quantity = current_quantity - v_apply_quantity,
            status = CASE
                        WHEN current_quantity - v_apply_quantity <= warning_threshold THEN '预警'
                        ELSE '正常'
                     END,
            update_time = NOW()
        WHERE chemical_id = v_chemical_id AND lab_id = v_lab_id;
    ELSEIF NEW.approval_result = '已驳回' THEN
        UPDATE apply_record SET status = '已驳回' WHERE apply_id = NEW.apply_id;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_after_approval_insert
AFTER INSERT ON approval_record
FOR EACH ROW EXECUTE FUNCTION fn_after_approval_insert();

CREATE OR REPLACE FUNCTION fn_after_usage_return_insert() RETURNS TRIGGER AS $$
DECLARE
    v_chemical_id INT;
    v_lab_id INT;
    v_returned_quantity DECIMAL(10,2);
BEGIN
    SELECT chemical_id, lab_id
    INTO v_chemical_id, v_lab_id
    FROM apply_record
    WHERE apply_id = NEW.apply_id;

    v_returned_quantity := NEW.returned_quantity;
    IF v_returned_quantity > 0 THEN
        UPDATE inventory
        SET current_quantity = current_quantity + v_returned_quantity,
            status = CASE
                        WHEN current_quantity + v_returned_quantity <= warning_threshold THEN '预警'
                        ELSE '正常'
                     END,
            update_time = NOW()
        WHERE chemical_id = v_chemical_id AND lab_id = v_lab_id;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_after_usage_return_insert
AFTER INSERT ON usage_return_record
FOR EACH ROW EXECUTE FUNCTION fn_after_usage_return_insert();

-- 存储过程（函数）
CREATE OR REPLACE FUNCTION sp_get_lab_inventory(p_lab_id INT)
RETURNS TABLE(
    lab_name VARCHAR,
    chemical_name VARCHAR,
    danger_level VARCHAR,
    current_quantity DECIMAL,
    warning_threshold DECIMAL,
    status VARCHAR,
    update_time TIMESTAMP
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        l.lab_name,
        c.chemical_name,
        c.danger_level,
        i.current_quantity,
        i.warning_threshold,
        i.status,
        i.update_time
    FROM inventory i
    JOIN laboratory l ON i.lab_id = l.lab_id
    JOIN chemical c ON i.chemical_id = c.chemical_id
    WHERE i.lab_id = p_lab_id
    ORDER BY c.chemical_name;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION sp_get_apply_statistics(p_start TIMESTAMP, p_end TIMESTAMP)
RETURNS TABLE(
    chemical_name VARCHAR,
    apply_count BIGINT,
    total_apply_quantity DECIMAL
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        c.chemical_name,
        COUNT(a.apply_id)::BIGINT,
        SUM(a.apply_quantity)
    FROM apply_record a
    JOIN chemical c ON a.chemical_id = c.chemical_id
    WHERE a.apply_time BETWEEN p_start AND p_end
    GROUP BY c.chemical_name
    ORDER BY total_apply_quantity DESC;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION sp_get_event_statistics()
RETURNS TABLE(
    lab_name VARCHAR,
    event_count BIGINT,
    finished_count BIGINT,
    unfinished_count BIGINT
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        l.lab_name,
        COUNT(e.event_id)::BIGINT,
        SUM(CASE WHEN e.status = '已完成' THEN 1 ELSE 0 END)::BIGINT,
        SUM(CASE WHEN e.status <> '已完成' THEN 1 ELSE 0 END)::BIGINT
    FROM safety_event e
    JOIN laboratory l ON e.lab_id = l.lab_id
    GROUP BY l.lab_name
    ORDER BY event_count DESC;
END;
$$ LANGUAGE plpgsql;