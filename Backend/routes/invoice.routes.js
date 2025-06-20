const express = require('express');
const router = express.Router();
const Invoice = require('../invoice.model');
const { authMiddleware, roleMiddleware } = require('../middleware/authMiddleware');

// Protect all routes with authentication
router.use(authMiddleware);

// Create a new invoice (Admin and Finance Staff)
router.post('/', roleMiddleware('admin', 'finance'), async (req, res) => {
    try {
        const invoice = new Invoice({
            ...req.body,
            createdBy: req.user.id,
            status: 'unpaid',
            paidAmount: 0
        });
        await invoice.save();
        res.status(201).json(invoice);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

// Get all invoices (filtered by role) with search/filter
router.get('/', async (req, res) => {
    try {
        let query = {};
        const userRoles = req.user.roles.map(r => r.name);
        const { student, status, dueFrom, dueTo, feeCategory } = req.query;
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
        if (status) query.status = status;
        if (feeCategory) query.feeCategory = feeCategory;
        if (dueFrom || dueTo) {
            query.dueDate = {};
            if (dueFrom) query.dueDate.$gte = new Date(dueFrom);
            if (dueTo) query.dueDate.$lte = new Date(dueTo);
        }
        const invoices = await Invoice.find(query)
            .populate('student', 'firstName lastName admissionNumber')
            .populate('feeCategory', 'name description')
            .populate('createdBy', 'firstName lastName')
            .sort({ dueDate: 1 });
        res.json(invoices);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Get a single invoice
router.get('/:id', async (req, res) => {
    try {
        const invoice = await Invoice.findById(req.params.id)
            .populate('student', 'firstName lastName admissionNumber')
            .populate('feeCategory', 'name description')
            .populate('createdBy', 'firstName lastName');

        if (!invoice) {
            return res.status(404).json({ error: 'Invoice not found' });
        }

        const userRoles = req.user.roles.map(r => r.name);
        
        // Check authorization
        const isAdmin = userRoles.includes('admin');
        const isFinance = userRoles.includes('finance');
        const isStudent = userRoles.includes('student') && 
                         invoice.student._id.toString() === req.user.id;
        const isGuardian = userRoles.includes('guardian') && 
                          req.user.wards.includes(invoice.student._id.toString());

        if (!isAdmin && !isFinance && !isStudent && !isGuardian) {
            return res.status(403).json({ error: 'Access denied' });
        }

        res.json(invoice);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Update an invoice (Admin and Finance Staff only)
router.put('/:id', roleMiddleware('admin', 'finance'), async (req, res) => {
    try {
        // Don't allow direct updates to status and paidAmount
        const { status, paidAmount, ...updateData } = req.body;

        const invoice = await Invoice.findByIdAndUpdate(
            req.params.id,
            updateData,
            { new: true, runValidators: true }
        );
        if (!invoice) {
            return res.status(404).json({ error: 'Invoice not found' });
        }
        res.json(invoice);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

// Delete an invoice (Admin only)
router.delete('/:id', roleMiddleware('admin'), async (req, res) => {
    try {
        const invoice = await Invoice.findById(req.params.id);
        if (!invoice) {
            return res.status(404).json({ error: 'Invoice not found' });
        }

        // Only allow deletion of unpaid invoices
        if (invoice.status !== 'unpaid') {
            return res.status(400).json({ 
                error: 'Cannot delete invoice with payments. Void it instead.' 
            });
        }

        await invoice.remove();
        res.json({ message: 'Invoice deleted successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Void an invoice (Admin only)
router.put('/:id/void', roleMiddleware('admin'), async (req, res) => {
    try {
        const invoice = await Invoice.findById(req.params.id);
        if (!invoice) {
            return res.status(404).json({ error: 'Invoice not found' });
        }

        invoice.status = 'void';
        invoice.voidedBy = req.user.id;
        invoice.voidedAt = Date.now();
        invoice.voidReason = req.body.reason;

        await invoice.save();
        res.json(invoice);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

// Get invoices by student ID (Admin, Finance Staff, Student themselves, and their Guardians)
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

        const invoices = await Invoice.find({ 
            student: req.params.studentId,
            status: { $ne: 'void' }  // Don't show voided invoices by default
        })
            .populate('feeCategory', 'name description')
            .populate('createdBy', 'firstName lastName')
            .sort({ dueDate: 1 });

        res.json(invoices);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Get overdue invoices (Admin and Finance Staff only)
router.get('/status/overdue', roleMiddleware('admin', 'finance'), async (req, res) => {
    try {
        const invoices = await Invoice.find({
            status: { $in: ['unpaid', 'partial'] },
            dueDate: { $lt: new Date() }
        })
            .populate('student', 'firstName lastName admissionNumber')
            .populate('feeCategory', 'name description')
            .sort({ dueDate: 1 });

        res.json(invoices);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router; 