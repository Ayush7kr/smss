const BillSchema = require('../models/Bill');

// @desc    Get all bills (Admin sees all, Resident sees their own)
// @route   GET /api/billing
// @access  Private
const getBills = async (req, res) => {
  try {
    const Bill = req.tenantDb.model('Bill', BillSchema);
    
    let query = {};
    if (req.user.role === 'Resident') {
      query.resident = req.user.userId;
    }
    
    const bills = await Bill.find(query)
        .populate('resident', 'name flatNumber')
        .sort({ createdAt: -1 });

    res.json(bills);
  } catch (error) {
    console.error('getBills Error:', error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Generate a new bill
// @route   POST /api/billing
// @access  Private (Society_Admin, Super_Admin)
const createBill = async (req, res) => {
  try {
    const { residentId, amount, description, month, dueDate, lateFee } = req.body;
    const Bill = req.tenantDb.model('Bill', BillSchema);

    const bill = await Bill.create({
      resident: residentId,
      amount,
      description,
      month,
      dueDate,
      lateFee
    });

    res.status(201).json(bill);
  } catch (error) {
     console.error('createBill Error:', error);
     res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Pay a bill
// @route   PUT /api/billing/:id/pay
// @access  Private (Resident)
const payBill = async (req, res) => {
  try {
    const { paymentMethod } = req.body;
    const Bill = req.tenantDb.model('Bill', BillSchema);

    let bill = await Bill.findById(req.params.id);
    if (!bill) return res.status(404).json({ message: 'Bill not found' });

    if (bill.resident.toString() !== req.user.userId && req.user.role !== 'Society_Admin') {
       return res.status(403).json({ message: 'Not authorized' });
    }

    bill.status = 'Paid';
    bill.paymentDate = Date.now();
    bill.paymentMethod = paymentMethod || 'Credit Card';

    const updatedBill = await bill.save();
    res.json(updatedBill);
  } catch (error) {
     console.error('payBill Error:', error);
     res.status(500).json({ message: 'Server Error' });
  }
};

module.exports = { getBills, createBill, payBill };
