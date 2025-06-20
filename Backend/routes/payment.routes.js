const express = require('express');
const router = express.Router();
const Payment = require('../payment.model');
const Invoice = require('../invoice.model');
const { authMiddleware, roleMiddleware } = require('../middleware/authMiddleware');

// Protect all routes with authentication
router.use(authMiddleware);

// Create a new payment (Admin and Finance Staff)
router.post('/', roleMiddleware('admin', 'finance'), async (req, res) => {
    try {
        const payment = new Payment({
            ...req.body,
            recordedBy: req.user.id,
            status: 'pending'
        });

        // If this payment is linked to an invoice, update the invoice's paid amount
        if (payment.invoice) {
            const invoice = await Invoice.findById(payment.invoice);
            if (!invoice) {
                return res.status(404).json({ error: 'Invoice not found' });
            }

            // Update invoice paid amount and status
            invoice.paidAmount += payment.amount;
            invoice.status = invoice.paidAmount >= invoice.totalAmount ? 'paid' : 'partial';
            await invoice.save();
        }

        await payment.save();
        res.status(201).json(payment);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

// Get all payments (filtered by role) with search/filter
router.get('/', async (req, res) => {
    try {
        let query = {};
        const userRoles = req.user.roles.map(r => r.name);
        const { student, invoice, status, paymentMethod, dateFrom, dateTo } = req.query;
        // Role-based filtering
        if (!userRoles.includes('admin') && !userRoles.includes('finance')) {
            if (userRoles.includes('student')) {
                query.student = req.user.id;
            } else if (userRoles.includes('guardian')) {
                query.student = { $in: req.user.wards };
            } else {
                return res.status(403).json({ error: 'Access denied' });
            }
        }
        // Search filters
        if (student) query.student = student;
        if (invoice) query.invoice = invoice;
        if (status) query.status = status;
        if (paymentMethod) query.paymentMethod = paymentMethod;
        if (dateFrom || dateTo) {
            query.createdAt = {};
            if (dateFrom) query.createdAt.$gte = new Date(dateFrom);
            if (dateTo) query.createdAt.$lte = new Date(dateTo);
        }
        const payments = await Payment.find(query)
            .populate('student', 'firstName lastName admissionNumber')
            .populate('invoice', 'invoiceNumber totalAmount dueDate')
            .populate('recordedBy', 'firstName lastName')
            .sort({ createdAt: -1 });
        res.json(payments);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Get a single payment
router.get('/:id', async (req, res) => {
    try {
        const payment = await Payment.findById(req.params.id)
            .populate('student', 'firstName lastName admissionNumber')
            .populate('invoice', 'invoiceNumber totalAmount dueDate')
            .populate('recordedBy', 'firstName lastName');

        if (!payment) {
            return res.status(404).json({ error: 'Payment not found' });
        }

        const userRoles = req.user.roles.map(r => r.name);
        
        // Check authorization
        const isAdmin = userRoles.includes('admin');
        const isFinance = userRoles.includes('finance');
        const isStudent = userRoles.includes('student') && 
                         payment.student._id.toString() === req.user.id;
        const isGuardian = userRoles.includes('guardian') && 
                          req.user.wards.includes(payment.student._id.toString());

        if (!isAdmin && !isFinance && !isStudent && !isGuardian) {
            return res.status(403).json({ error: 'Access denied' });
        }

        res.json(payment);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Update a payment status (Admin and Finance Staff only)
router.put('/:id/status', roleMiddleware('admin', 'finance'), async (req, res) => {
    try {
        const { status } = req.body;
        if (!status || !['pending', 'confirmed', 'rejected'].includes(status)) {
            return res.status(400).json({ error: 'Invalid payment status' });
        }

        const payment = await Payment.findById(req.params.id);
        if (!payment) {
            return res.status(404).json({ error: 'Payment not found' });
        }

        // If rejecting a previously confirmed payment, update the invoice
        if (payment.status === 'confirmed' && status === 'rejected' && payment.invoice) {
            const invoice = await Invoice.findById(payment.invoice);
            if (invoice) {
                invoice.paidAmount -= payment.amount;
                invoice.status = invoice.paidAmount >= invoice.totalAmount ? 'paid' : 
                                invoice.paidAmount > 0 ? 'partial' : 'unpaid';
                await invoice.save();
            }
        }

        // If confirming a pending payment, update the invoice
        if (payment.status === 'pending' && status === 'confirmed' && payment.invoice) {
            const invoice = await Invoice.findById(payment.invoice);
            if (invoice) {
                invoice.paidAmount += payment.amount;
                invoice.status = invoice.paidAmount >= invoice.totalAmount ? 'paid' : 'partial';
                await invoice.save();
            }
        }

        payment.status = status;
        payment.processedBy = req.user.id;
        payment.processedAt = Date.now();
        await payment.save();

        res.json(payment);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

// Get payments by student ID (Admin, Finance Staff, Student themselves, and their Guardians)
router.get('/student/:studentId', async (req, res) => {
    try {
        const userRoles = req.user.roles.map(r => r.name);
        
        // Check authorization
        const isAdmin = userRoles.includes('admin');
        const isFinance = userRoles.includes('finance');
        const isStudent = userRoles.includes('student') && req.params.studentId === req.user.id;
        const isGuardian = userRoles.includes('guardian') && 
                          req.user.wards.includes(req.params.studentId);

        if (!isAdmin && !isFinance && !isStudent && !isGuardian) {
            return res.status(403).json({ error: 'Access denied' });
        }

        const payments = await Payment.find({ student: req.params.studentId })
            .populate('invoice', 'invoiceNumber totalAmount dueDate')
            .populate('recordedBy', 'firstName lastName')
            .sort({ createdAt: -1 });

        res.json(payments);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Get payments by invoice ID (Admin and Finance Staff only)
router.get('/invoice/:invoiceId', roleMiddleware('admin', 'finance'), async (req, res) => {
    try {
        const payments = await Payment.find({ invoice: req.params.invoiceId })
            .populate('student', 'firstName lastName admissionNumber')
            .populate('recordedBy', 'firstName lastName')
            .sort({ createdAt: -1 });

        res.json(payments);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router; 