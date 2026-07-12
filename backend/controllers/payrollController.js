const Payslip = require("../models/Payslip");
const User = require("../models/User");

const toAmount = (value) => {
  const amount = Number(value);
  return Number.isFinite(amount) && amount >= 0 ? amount : null;
};

const buildPayrollPayload = (body) => {
  const basic = toAmount(body.basic);
  const allowances = toAmount(body.allowances ?? 0);
  const deductions = toAmount(body.deductions ?? 0);
  const year = Number(body.year);
  const userId = Number(body.user_id);
  const month = String(body.month || "").trim();

  if (!userId || !month || !Number.isInteger(year) || year < 2000 || year > 2100 || basic === null || allowances === null || deductions === null) {
    return { error: "Please provide employee, month, year, basic salary, allowances, and deductions." };
  }

  return {
    payload: {
      user_id: userId,
      month,
      year,
      basic,
      allowances,
      deductions,
      net_pay: basic + allowances - deductions,
    },
  };
};

const getAllPayrolls = async (req, res) => {
  try {
    const payrolls = await Payslip.findAll({
      order: [["year", "DESC"], ["month", "DESC"]],
      raw: true,
    });

    const users = await User.findAll({
      attributes: ["id", "name", "email", "role"],
      raw: true,
    });

    const userMap = {};

    users.forEach((u) => {
      userMap[u.id] = u;
    });

    const data = payrolls.map((payroll) => ({
      ...payroll,
      employeeName: userMap[payroll.user_id]?.name || "Unknown",
      employeeEmail: userMap[payroll.user_id]?.email || "",
    }));

    return res.json({
      success: true,
      payrolls: data,
    });
  } catch (err) {
    console.error("Payroll Fetch Error:", err);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch payroll records",
    });
  }
};

const getPayrollEmployees = async (req, res) => {
  try {
    const employees = await User.findAll({
      where: { status: "Approved" },
      attributes: ["id", "name", "email", "role"],
      order: [["name", "ASC"]],
      raw: true,
    });

    return res.json({ success: true, employees });
  } catch (err) {
    console.error("Payroll Employee Fetch Error:", err);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch payroll users",
    });
  }
};

const createPayroll = async (req, res) => {
  try {
    const { payload, error } = buildPayrollPayload(req.body);
    if (error) {
      return res.status(400).json({ success: false, message: error });
    }

    const existing = await Payslip.findOne({
      where: {
        user_id: payload.user_id,
        month: payload.month,
        year: payload.year,
      },
    });

    if (existing) {
      return res.status(409).json({
        success: false,
        message: "A payroll record already exists for this employee and period.",
      });
    }

    const payroll = await Payslip.create(payload);
    return res.status(201).json({ success: true, payroll });
  } catch (err) {
    console.error("Payroll Create Error:", err);

    return res.status(500).json({
      success: false,
      message: "Failed to create payroll record",
    });
  }
};

const updatePayroll = async (req, res) => {
  try {
    const { payload, error } = buildPayrollPayload(req.body);
    if (error) {
      return res.status(400).json({ success: false, message: error });
    }

    const payroll = await Payslip.findByPk(req.params.id);
    if (!payroll) {
      return res.status(404).json({ success: false, message: "Payroll record not found." });
    }

    const duplicate = await Payslip.findOne({
      where: {
        user_id: payload.user_id,
        month: payload.month,
        year: payload.year,
      },
    });

    if (duplicate && duplicate.id !== payroll.id) {
      return res.status(409).json({
        success: false,
        message: "Another payroll record already exists for this employee and period.",
      });
    }

    await payroll.update(payload);
    return res.json({ success: true, payroll });
  } catch (err) {
    console.error("Payroll Update Error:", err);

    return res.status(500).json({
      success: false,
      message: "Failed to update payroll record",
    });
  }
};

const deletePayroll = async (req, res) => {
  try {
    const deleted = await Payslip.destroy({ where: { id: req.params.id } });
    if (!deleted) {
      return res.status(404).json({ success: false, message: "Payroll record not found." });
    }

    return res.json({ success: true });
  } catch (err) {
    console.error("Payroll Delete Error:", err);

    return res.status(500).json({
      success: false,
      message: "Failed to delete payroll record",
    });
  }
};

module.exports = {
  getAllPayrolls,
  getPayrollEmployees,
  createPayroll,
  updatePayroll,
  deletePayroll,
};

