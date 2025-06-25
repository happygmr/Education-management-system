const express = require('express');
const router = express.Router();
const Student = require('../student.model');
const Teacher = require('../teacher.model');
const Class = require('../class.model');
const Subject = require('../subject.model');
const Invoice = require('../invoice.model');
const Payment = require('../payment.model');
const { authMiddleware, roleMiddleware } = require('../middleware/authMiddleware');

// Dashboard stats endpoint (admin/finance only)
router.get('/stats', authMiddleware, roleMiddleware('admin', 'finance'), async (req, res) => {
    try {
        // Disable caching for this dynamic endpoint
        res.set('Cache-Control', 'no-cache, no-store, must-revalidate'); // HTTP 1.1.
        res.set('Pragma', 'no-cache'); // HTTP 1.0.
        res.set('Expires', '0'); // Proxies.
        
        const [
            studentCount,
            teacherCount,
            classCount,
            subjectCount,
            invoiceTotal,
            invoicePaid,
            invoiceUnpaid,
            invoiceOverdue,
            paymentTotal,
            paymentConfirmed,
            paymentPending,
            recentStudents,
            recentPayments
        ] = await Promise.all([
            Student.countDocuments(),
            Teacher.countDocuments(),
            Class.countDocuments(),
            Subject.countDocuments(),
            Invoice.countDocuments(),
            Invoice.countDocuments({ status: 'paid' }),
            Invoice.countDocuments({ status: 'unpaid' }),
            Invoice.countDocuments({ status: { $in: ['unpaid', 'partial'] }, dueDate: { $lt: new Date() } }),
            Payment.countDocuments(),
            Payment.countDocuments({ status: 'confirmed' }),
            Payment.countDocuments({ status: 'pending' }),
            Student.countDocuments({ createdAt: { $gte: new Date(Date.now() - 7*24*60*60*1000) } }),
            Payment.countDocuments({ createdAt: { $gte: new Date(Date.now() - 7*24*60*60*1000) } })
        ]);

        res.json({
            students: { total: studentCount, recent7days: recentStudents },
            teachers: { total: teacherCount },
            classes: { total: classCount },
            subjects: { total: subjectCount },
            invoices: {
                total: invoiceTotal,
                paid: invoicePaid,
                unpaid: invoiceUnpaid,
                overdue: invoiceOverdue
            },
            payments: {
                total: paymentTotal,
                confirmed: paymentConfirmed,
                pending: paymentPending,
                recent7days: recentPayments
            }
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router; 