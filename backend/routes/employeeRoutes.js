const express = require('express');
const router = express.Router();
const { Op } = require('sequelize');

// Import Middleware
const { authenticate, authorize } = require('../middleware/authMiddleware');

// Import Models
const User = require('../models/User');
const Attendance = require('../models/Attendance');
const LeaveRequest = require('../models/LeaveRequest');
const LeaveBalance = require('../models/LeaveBalance');
const Task = require('../models/Task');
const Payslip = require('../models/Payslip');
const PerformanceReview = require('../models/PerformanceReview');
const Notification = require('../models/Notification');
const TrainingCourse = require('../models/TrainingCourse');
const Document = require('../models/Document');
const ChatMessage = require('../models/ChatMessage');
const EmployeeProfile = require('../models/EmployeeProfile');

// Ensure all employee routes are authenticated and authorized for EMPLOYEE role
router.use(authenticate);
router.use(authorize(['Employee']));

// ================= 1. DASHBOARD & STATS =================
router.get('/stats', async (req, res) => {
  try {
    const userId = req.user.userId;

    // 1. Attendance %
    const totalDays = await Attendance.count({ where: { user_id: userId } });
    const presentDays = await Attendance.count({
      where: {
        user_id: userId,
        status: { [Op.in]: ['Present', 'Late'] }
      }
    });
    const attendancePct = totalDays > 0 ? Math.round((presentDays / totalDays) * 100) : 100;

    // 2. Pending Tasks
    const pendingTasks = await Task.count({
      where: {
        user_id: userId,
        status: { [Op.in]: ['To Do', 'In Progress'] }
      }
    });

    // 3. Leave Balance (Total remaining casual + sick + earned)
    const balance = await LeaveBalance.findOne({ where: { user_id: userId } });
    const remainingLeave = balance 
      ? (balance.casual_days + balance.sick_days + balance.earned_days) 
      : 0;

    // 4. Latest Payslip Amount
    const latestPayslip = await Payslip.findOne({
      where: { user_id: userId },
      order: [['year', 'DESC'], ['month', 'DESC']]
    });
    const latestSalary = latestPayslip ? `$${latestPayslip.net_pay.toLocaleString()}` : '$0.00';

    res.json({
      attendancePct: `${attendancePct}%`,
      pendingTasks,
      remainingLeave: `${remainingLeave}d`,
      latestSalary,
      attendanceDetails: `${presentDays} / ${totalDays} days tracked`
    });
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// ================= 2. PROFILE =================
router.get('/profile', async (req, res) => {
  try {
    const userId = req.user.userId;
    const user = await User.findByPk(userId, { attributes: ['name', 'email', 'role', 'created_at'] });
    let profile = await EmployeeProfile.findOne({ where: { user_id: userId } });

    if (!profile) {
      profile = await EmployeeProfile.create({
        user_id: userId,
        phone: '',
        address: '',
        skills_json: '[]',
        certifications_json: '[]',
        emergency_contact_name: '',
        emergency_contact_relation: '',
        emergency_contact_phone: ''
      });
    }

    res.json({
      user,
      profile
    });
  } catch (error) {
    console.error('Error fetching profile:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

router.put('/profile', async (req, res) => {
  try {
    const userId = req.user.userId;
    const { name, phone, address, skills, certifications, emergencyContact } = req.body;

    // Update User Name
    if (name) {
      await User.update({ name }, { where: { id: userId } });
    }

    // Update Profile Details
    const updateData = {};
    if (phone !== undefined) updateData.phone = phone;
    if (address !== undefined) updateData.address = address;
    if (skills !== undefined) updateData.skills_json = JSON.stringify(skills);
    if (certifications !== undefined) updateData.certifications_json = JSON.stringify(certifications);
    
    if (emergencyContact) {
      if (emergencyContact.name !== undefined) updateData.emergency_contact_name = emergencyContact.name;
      if (emergencyContact.relation !== undefined) updateData.emergency_contact_relation = emergencyContact.relation;
      if (emergencyContact.phone !== undefined) updateData.emergency_contact_phone = emergencyContact.phone;
    }

    await EmployeeProfile.update(updateData, { where: { user_id: userId } });

    res.json({ success: true, message: 'Profile updated successfully.' });
  } catch (error) {
    console.error('Error updating profile:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// ================= 3. ATTENDANCE =================
router.get('/attendance', async (req, res) => {
  try {
    const userId = req.user.userId;
    const records = await Attendance.findAll({
      where: { user_id: userId },
      order: [['date', 'DESC']]
    });
    res.json(records);
  } catch (error) {
    console.error('Error fetching attendance:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

router.get('/attendance/status', async (req, res) => {
  try {
    const userId = req.user.userId;
    const today = new Date().toISOString().slice(0, 10);
    const record = await Attendance.findOne({ where: { user_id: userId, date: today } });
    
    res.json({
      checkedIn: !!record,
      checkedOut: record ? !!record.check_out_time : false,
      record
    });
  } catch (error) {
    console.error('Error checking attendance status:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

router.post('/attendance/checkin', async (req, res) => {
  try {
    const userId = req.user.userId;
    const today = new Date().toISOString().slice(0, 10);
    
    // Check if already checked in
    const existing = await Attendance.findOne({ where: { user_id: userId, date: today } });
    if (existing) {
      return res.status(400).json({ success: false, message: 'Already checked in for today.' });
    }

    const now = new Date();
    const checkInTime = now.toTimeString().split(' ')[0];

    // Determine status (Late if after 09:15:00)
    let status = 'Present';
    const limit = new Date();
    limit.setHours(9, 15, 0);
    if (now > limit) {
      status = 'Late';
    }

    const record = await Attendance.create({
      user_id: userId,
      date: today,
      check_in_time: checkInTime,
      status
    });

    // Create a Notification
    await Notification.create({
      user_id: userId,
      type: 'Attendance',
      title: 'Checked In Successfully',
      message: `You checked in today at ${checkInTime} (${status}).`,
      is_read: false
    });

    res.json({ success: true, record });
  } catch (error) {
    console.error('Error checking in:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

router.post('/attendance/checkout', async (req, res) => {
  try {
    const userId = req.user.userId;
    const today = new Date().toISOString().slice(0, 10);
    
    const record = await Attendance.findOne({ where: { user_id: userId, date: today } });
    if (!record) {
      return res.status(400).json({ success: false, message: 'No check-in record found for today.' });
    }
    if (record.check_out_time) {
      return res.status(400).json({ success: false, message: 'Already checked out for today.' });
    }

    const checkOutTime = new Date().toTimeString().split(' ')[0];
    record.check_out_time = checkOutTime;
    await record.save();

    res.json({ success: true, record });
  } catch (error) {
    console.error('Error checking out:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// ================= 4. LEAVE =================
router.get('/leave/balances', async (req, res) => {
  try {
    const userId = req.user.userId;
    let balance = await LeaveBalance.findOne({ where: { user_id: userId } });
    if (!balance) {
      balance = await LeaveBalance.create({ user_id: userId });
    }
    res.json(balance);
  } catch (error) {
    console.error('Error fetching leave balances:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

router.get('/leave/requests', async (req, res) => {
  try {
    const userId = req.user.userId;
    const requests = await LeaveRequest.findAll({
      where: { user_id: userId },
      order: [['applied_at', 'DESC']]
    });
    res.json(requests);
  } catch (error) {
    console.error('Error fetching leave requests:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

router.post('/leave/requests', async (req, res) => {
  try {
    const userId = req.user.userId;
    const { leave_type, start_date, end_date, reason } = req.body;

    if (!leave_type || !start_date || !end_date) {
      return res.status(400).json({ success: false, message: 'Missing required leave fields.' });
    }

    // Calculate days requested
    const start = new Date(start_date);
    const end = new Date(end_date);
    const diffTime = Math.abs(end - start);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;

    // Check Balance
    const balance = await LeaveBalance.findOne({ where: { user_id: userId } });
    let balanceKey = '';
    if (leave_type === 'Casual') balanceKey = 'casual_days';
    else if (leave_type === 'Sick') balanceKey = 'sick_days';
    else if (leave_type === 'Earned') balanceKey = 'earned_days';

    if (balance && balance[balanceKey] < diffDays) {
      return res.status(400).json({ success: false, message: `Insufficient ${leave_type} leave balance. Requested ${diffDays} days, available ${balance[balanceKey]} days.` });
    }

    const request = await LeaveRequest.create({
      user_id: userId,
      leave_type,
      start_date,
      end_date,
      reason,
      status: 'Pending'
    });

    // Notify
    await Notification.create({
      user_id: userId,
      type: 'Leave',
      title: 'Leave Request Submitted',
      message: `Your ${leave_type} leave request from ${start_date} to ${end_date} has been submitted for approval.`,
      is_read: false
    });

    res.json({ success: true, request });
  } catch (error) {
    console.error('Error submitting leave:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// ================= 5. TASKS =================
router.get('/tasks', async (req, res) => {
  try {
    const userId = req.user.userId;
    const tasks = await Task.findAll({
      where: { user_id: userId },
      order: [['due_date', 'ASC']]
    });
    res.json(tasks);
  } catch (error) {
    console.error('Error fetching tasks:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

router.post('/tasks', async (req, res) => {
  try {
    const userId = req.user.userId;
    const { title, description, priority, due_date } = req.body;

    const task = await Task.create({
      user_id: userId,
      title,
      description,
      priority: priority || 'Medium',
      due_date,
      status: 'To Do'
    });

    res.json({ success: true, task });
  } catch (error) {
    console.error('Error creating task:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

router.put('/tasks/:id', async (req, res) => {
  try {
    const userId = req.user.userId;
    const { status, priority, title, description, due_date } = req.body;

    const task = await Task.findOne({ where: { id: req.params.id, user_id: userId } });
    if (!task) {
      return res.status(404).json({ success: false, message: 'Task not found.' });
    }

    if (status !== undefined) task.status = status;
    if (priority !== undefined) task.priority = priority;
    if (title !== undefined) task.title = title;
    if (description !== undefined) task.description = description;
    if (due_date !== undefined) task.due_date = due_date;

    await task.save();
    res.json({ success: true, task });
  } catch (error) {
    console.error('Error updating task:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// ================= 6. PAYROLL =================
router.get('/payslips', async (req, res) => {
  try {
    const userId = req.user.userId;
    const records = await Payslip.findAll({
      where: { user_id: userId },
      order: [['year', 'DESC'], ['month', 'DESC']]
    });
    res.json(records);
  } catch (error) {
    console.error('Error fetching payslips:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// ================= 7. PERFORMANCE =================
router.get('/performance', async (req, res) => {
  try {
    const userId = req.user.userId;
    const records = await PerformanceReview.findAll({
      where: { user_id: userId },
      order: [['id', 'DESC']]
    });
    res.json(records);
  } catch (error) {
    console.error('Error fetching performance:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// ================= 8. CHAT =================
router.get('/chat/contacts', async (req, res) => {
  try {
    const userId = req.user.userId;
    // Return Admin and HR users
    const contacts = await User.findAll({
      where: {
        role: { [Op.in]: ['Admin', 'HR'] }
      },
      attributes: ['id', 'name', 'email', 'role']
    });
    res.json(contacts);
  } catch (error) {
    console.error('Error fetching chat contacts:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

router.get('/chat/messages/:contactId', async (req, res) => {
  try {
    const userId = req.user.userId;
    const contactId = req.params.contactId;

    const messages = await ChatMessage.findAll({
      where: {
        [Op.or]: [
          { sender_id: userId, receiver_id: contactId },
          { sender_id: contactId, receiver_id: userId }
        ]
      },
      order: [['sent_at', 'ASC']]
    });
    res.json(messages);
  } catch (error) {
    console.error('Error fetching chat messages:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

router.post('/chat/messages', async (req, res) => {
  try {
    const userId = req.user.userId;
    const { receiver_id, message } = req.body;

    if (!receiver_id || !message) {
      return res.status(400).json({ success: false, message: 'Missing fields' });
    }

    const chat = await ChatMessage.create({
      sender_id: userId,
      receiver_id,
      message,
      sent_at: new Date()
    });

    res.json({ success: true, message: chat });
  } catch (error) {
    console.error('Error sending message:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// ================= 9. NOTIFICATIONS =================
router.get('/notifications', async (req, res) => {
  try {
    const userId = req.user.userId;
    const notifications = await Notification.findAll({
      where: { user_id: userId },
      order: [['created_at', 'DESC']]
    });
    res.json(notifications);
  } catch (error) {
    console.error('Error fetching notifications:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

router.put('/notifications/:id/read', async (req, res) => {
  try {
    const userId = req.user.userId;
    await Notification.update(
      { is_read: true },
      { where: { id: req.params.id, user_id: userId } }
    );
    res.json({ success: true });
  } catch (error) {
    console.error('Error marking notification as read:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

router.put('/notifications/read-all', async (req, res) => {
  try {
    const userId = req.user.userId;
    await Notification.update(
      { is_read: true },
      { where: { user_id: userId } }
    );
    res.json({ success: true });
  } catch (error) {
    console.error('Error marking all notifications as read:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// ================= 10. TRAINING =================
router.get('/training', async (req, res) => {
  try {
    const userId = req.user.userId;
    const courses = await TrainingCourse.findAll({
      where: { user_id: userId }
    });
    res.json(courses);
  } catch (error) {
    console.error('Error fetching training:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// ================= 11. DOCUMENTS =================
router.get('/documents', async (req, res) => {
  try {
    const userId = req.user.userId;
    const documents = await Document.findAll({
      where: { user_id: userId },
      order: [['uploaded_at', 'DESC']]
    });
    res.json(documents);
  } catch (error) {
    console.error('Error fetching documents:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

router.post('/documents', async (req, res) => {
  try {
    const userId = req.user.userId;
    const { file_name, file_type } = req.body;

    if (!file_name || !file_type) {
      return res.status(400).json({ success: false, message: 'Missing file details.' });
    }

    const doc = await Document.create({
      user_id: userId,
      file_name,
      file_type,
      uploaded_at: new Date()
    });

    res.json({ success: true, document: doc });
  } catch (error) {
    console.error('Error uploading document:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
