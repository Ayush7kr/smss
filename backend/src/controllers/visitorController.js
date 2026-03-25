const VisitorSchema = require('../models/Visitor');
const UserSchema = require('../models/User');

// @desc    Get all visitors (Guard sees all, Resident sees their own)
// @route   GET /api/visitors
// @access  Private
const getVisitors = async (req, res) => {
  try {
    const Visitor = req.tenantDb.model('Visitor', VisitorSchema);
    
    let query = {};
    if (req.user.role === 'Resident') {
      query.resident = req.user.userId;
    }
    
    const visitors = await Visitor.find(query)
        .populate('resident', 'name flatNumber')
        .populate('registeredBy', 'name')
        .sort({ entryTime: -1 });

    res.json(visitors);
  } catch (error) {
    console.error('getVisitors Error:', error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Register a new visitor
// @route   POST /api/visitors
// @access  Private (Security_Guard)
const createVisitor = async (req, res) => {
  try {
    const { name, phone, purpose, flatNumber, photoUrl } = req.body;
    const Visitor = req.tenantDb.model('Visitor', VisitorSchema);
    const User = req.tenantDb.model('User', UserSchema);

    // Find resident user by flat number
    const resident = await User.findOne({ flatNumber, role: 'Resident' });
    if (!resident) {
      return res.status(404).json({ message: 'No resident found in that flat' });
    }

    const visitor = await Visitor.create({
      name,
      phone,
      purpose,
      resident: resident._id,
      flatNumber,
      photoUrl,
      registeredBy: req.user.userId
    });

    res.status(201).json(visitor);
  } catch (error) {
     console.error('createVisitor Error:', error);
     res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Update visitor status (Approve/Reject by Resident, Log Exit by Guard)
// @route   PUT /api/visitors/:id
// @access  Private
const updateVisitor = async (req, res) => {
  try {
    const { status, exitTime } = req.body;
    const Visitor = req.tenantDb.model('Visitor', VisitorSchema);

    let visitor = await Visitor.findById(req.params.id);
    if (!visitor) return res.status(404).json({ message: 'Visitor not found' });

    // Resident approving/rejecting
    if (req.user.role === 'Resident' && visitor.resident.toString() === req.user.userId) {
       if (status) visitor.status = status;
    } 
    // Guard logging exit
    else if (req.user.role === 'Security_Guard') {
       if (exitTime) visitor.exitTime = exitTime;
       else visitor.exitTime = Date.now();
    } else {
       return res.status(403).json({ message: 'Not authorized' });
    }

    const updatedVisitor = await visitor.save();
    res.json(updatedVisitor);
  } catch (error) {
     console.error('updateVisitor Error:', error);
     res.status(500).json({ message: 'Server Error' });
  }
};

module.exports = { getVisitors, createVisitor, updateVisitor };
