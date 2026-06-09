const express = require('express');
const expressAsync = require('express-async-handler');
const { isAuth, isAdmin } = require('../util');
const logActivity = require('../util/activityLogger');
const Expense = require('../models/expenseModel');

const ExpenseRoute = express.Router();

// Get all expenses
ExpenseRoute.get('/', isAuth, expressAsync(async(req, res) => {
    const expenses = await Expense.find({})
        .populate('vendor', 'name email')
        .populate('createdBy', '_id email')
        .populate('approvedBy', '_id email');
    res.send(expenses);
}));

// Get expense summary stats
ExpenseRoute.get('/summary/stats', isAuth, expressAsync(async(req, res) => {
    const currentMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
    const totalExpenses = await Expense.countDocuments({});
    const vendorInvoices = await Expense.countDocuments({ status: 'pending' });
    const approvals = await Expense.countDocuments({ approvalStatus: 'pending' });
    const pendingBills = await Expense.countDocuments({ paymentStatus: { $in: ['unpaid', 'partial'] } });

    const monthlySpend = await Expense.aggregate([
        {
            $match: {
                createdAt: { $gte: currentMonth },
                status: { $in: ['approved', 'paid'] }
            }
        },
        {
            $group: {
                _id: null,
                total: { $sum: '$amount' }
            }
        }
    ]);

    const lastMonth = new Date(new Date().getFullYear(), new Date().getMonth() - 1, 1);
    const lastMonthSpend = await Expense.aggregate([
        {
            $match: {
                createdAt: { $gte: lastMonth, $lt: currentMonth },
                status: { $in: ['approved', 'paid'] }
            }
        },
        {
            $group: {
                _id: null,
                total: { $sum: '$amount' }
            }
        }
    ]);

    const paidExpenses = await Expense.countDocuments({ paymentStatus: 'paid' });
    const reconciledExpenses = await Expense.countDocuments({ status: { $in: ['approved', 'paid'] } });
    const expenseCategories = await Expense.distinct('category');

    const approvalTimeStats = await Expense.aggregate([
        {
            $match: {
                status: 'approved'
            }
        },
        {
            $project: {
                approvalHours: {
                    $divide: [
                        { $subtract: ['$updatedAt', '$createdAt'] },
                        1000 * 60 * 60
                    ]
                }
            }
        },
        {
            $group: {
                _id: null,
                averageApprovalHours: { $avg: '$approvalHours' }
            }
        }
    ]);

    const thisMonthAmount = monthlySpend.length > 0 ? monthlySpend[0].total : 0;
    const lastMonthAmount = lastMonthSpend.length > 0 ? lastMonthSpend[0].total : 0;
    const trend = lastMonthAmount !== 0 ? Math.round(((thisMonthAmount - lastMonthAmount) / lastMonthAmount) * 100) : 0;
    const averageApproval = approvalTimeStats.length > 0 ? Math.round(approvalTimeStats[0].averageApprovalHours) : 0;
    const cashPayments = totalExpenses > 0 ? Math.round((paidExpenses / totalExpenses) * 100) : 0;
    const reconciled = totalExpenses > 0 ? Math.round((reconciledExpenses / totalExpenses) * 100) : 0;

    const recentSpend = await Expense.find({ status: 'paid' })
        .sort({ paidDate: -1 })
        .limit(5)
        .populate('vendor', 'name');

    res.send({
        vendorInvoices,
        approvals,
        pendingApprovals: approvals,
        pendingBills,
        monthlySpend: thisMonthAmount,
        trend,
        recentSpend,
        expenseCategories: expenseCategories.length,
        cashPayments,
        averageApproval,
        reconciled
    });
}));

// Get single expense
ExpenseRoute.get('/:id', isAuth, expressAsync(async(req, res) => {
    const expense = await Expense.findById(req.params.id)
        .populate('vendor', 'name email')
        .populate('createdBy', '_id email')
        .populate('approvedBy', '_id email');
    if (expense) {
        res.send(expense);
    } else {
        res.status(404).send({ message: 'Expense Not Found' });
    }
}));

// Create expense
ExpenseRoute.post('/', isAuth, expressAsync(async(req, res) => {
    const expense = new Expense({
        category: req.body.category,
        description: req.body.description,
        vendor: req.body.vendor,
        vendorName: req.body.vendorName,
        amount: req.body.amount,
        currency: req.body.currency || 'KES',
        status: 'draft',
        approvalStatus: 'pending',
        paymentStatus: 'unpaid',
        invoiceNumber: req.body.invoiceNumber,
        invoiceDate: req.body.invoiceDate,
        dueDate: req.body.dueDate,
        notes: req.body.notes,
        createdBy: req.user._id
    });

    const createdExpense = await expense.save();
    if (createdExpense) {
        await logActivity(req.user._id, 'EXPENSE_CREATED', `Created expense ${createdExpense.expenseNumber}`);
        res.status(201).send({
            message: 'Expense Created Successfully',
            expense: createdExpense
        });
    } else {
        res.status(500).send({ message: 'Expense Creation Failed' });
    }
}));

// Update expense
ExpenseRoute.put('/:id', isAuth, isAdmin, expressAsync(async(req, res) => {
    const expense = await Expense.findById(req.params.id);
    if (expense) {
        expense.category = req.body.category || expense.category;
        expense.description = req.body.description || expense.description;
        expense.vendor = req.body.vendor || expense.vendor;
        expense.vendorName = req.body.vendorName || expense.vendorName;
        expense.amount = req.body.amount !== undefined ? req.body.amount : expense.amount;
        expense.currency = req.body.currency || expense.currency;
        expense.status = req.body.status || expense.status;
        expense.invoiceNumber = req.body.invoiceNumber || expense.invoiceNumber;
        expense.invoiceDate = req.body.invoiceDate || expense.invoiceDate;
        expense.dueDate = req.body.dueDate || expense.dueDate;
        expense.notes = req.body.notes || expense.notes;

        const updatedExpense = await expense.save();
        await logActivity(req.user._id, 'EXPENSE_UPDATED', `Updated expense ${updatedExpense.expenseNumber}`);
        res.send({
            message: 'Expense Updated Successfully',
            expense: updatedExpense
        });
    } else {
        res.status(404).send({ message: 'Expense Not Found' });
    }
}));

// Approve expense
ExpenseRoute.post('/:id/approve', isAuth, isAdmin, expressAsync(async(req, res) => {
    const expense = await Expense.findById(req.params.id);
    if (expense) {
        expense.status = 'approved';
        expense.approvalStatus = 'approved';
        expense.approvedBy = req.user._id;
        const updatedExpense = await expense.save();
        await logActivity(req.user._id, 'EXPENSE_APPROVED', `Approved expense ${updatedExpense.expenseNumber}`);
        res.send({
            message: 'Expense Approved',
            expense: updatedExpense
        });
    } else {
        res.status(404).send({ message: 'Expense Not Found' });
    }
}));

// Reject expense
ExpenseRoute.post('/:id/reject', isAuth, isAdmin, expressAsync(async(req, res) => {
    const expense = await Expense.findById(req.params.id);
    if (expense) {
        expense.status = 'rejected';
        expense.approvalStatus = 'rejected';
        const updatedExpense = await expense.save();
        await logActivity(req.user._id, 'EXPENSE_REJECTED', `Rejected expense ${updatedExpense.expenseNumber}`);
        res.send({
            message: 'Expense Rejected',
            expense: updatedExpense
        });
    } else {
        res.status(404).send({ message: 'Expense Not Found' });
    }
}));

// Mark expense as paid
ExpenseRoute.post('/:id/pay', isAuth, isAdmin, expressAsync(async(req, res) => {
    const expense = await Expense.findById(req.params.id);
    if (expense) {
        expense.paymentStatus = 'paid';
        expense.status = 'paid';
        expense.paidDate = new Date();
        const updatedExpense = await expense.save();
        await logActivity(req.user._id, 'EXPENSE_PAID', `Marked expense ${updatedExpense.expenseNumber} as paid`);
        res.send({
            message: 'Expense Marked as Paid',
            expense: updatedExpense
        });
    } else {
        res.status(404).send({ message: 'Expense Not Found' });
    }
}));

// Export ledger
ExpenseRoute.get('/export/ledger', isAuth, expressAsync(async(req, res) => {
    const expenses = await Expense.find({})
        .select('expenseNumber category amount vendor status paymentStatus createdAt')
        .populate('vendor', 'name');
    res.send(expenses);
}));

module.exports = ExpenseRoute;
