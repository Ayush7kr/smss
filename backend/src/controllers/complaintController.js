const ComplaintSchema = require('../models/Complaint');

// @desc    Get all complaints for a tenant (filtered by user if role=Resident, vendor if role=Vendor)
// @route   GET /api/complaints
// @access  Private
const getComplaints = async (req, res) => {
  try {
    const Complaint = req.tenantDb.model('Complaint', ComplaintSchema);
    
    let query = {};
    if (req.user.role === 'Resident') {
      query.resident = req.user.userId;
    } else if (req.user.role === 'Vendor') {
      query.vendor = req.user.userId;
    }
    
    const complaints = await Complaint.find(query)
        .populate('resident', 'name flatNumber')
        .populate('vendor', 'name phone')
        .sort({ createdAt: -1 });

    res.json(complaints);
  } catch (error) {
    console.error('getComplaints Error:', error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Create a new complaint
// @route   POST /api/complaints
// @access  Private (Resident)
const createComplaint = async (req, res) => {
  try {
    if (req.user.role !== 'Resident') {
      return res.status(403).json({ message: 'Only residents can submit complaints' });
    }

    const { category, description, location, priority, imageUrl } = req.body;
    const Complaint = req.tenantDb.model('Complaint', ComplaintSchema);

    const complaint = await Complaint.create({
      resident: req.user.userId,
      category,
      description,
      location,
      priority,
      imageUrl
    });

    res.status(201).json(complaint);
  } catch (error) {
     console.error('createComplaint Error:', error);
     res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Update complaint status or assign vendor
// @route   PUT /api/complaints/:id
// @access  Private (Admin, Vendor)
const updateComplaint = async (req, res) => {
  try {
    const { status, vendorId, resolutionNotes } = req.body;
    const Complaint = req.tenantDb.model('Complaint', ComplaintSchema);

    let complaint = await Complaint.findById(req.params.id);
    if (!complaint) return res.status(404).json({ message: 'Complaint not found' });

    // Admins can assign vendor and update status
    if (req.user.role === 'Society_Admin' || req.user.role === 'Super_Admin') {
      if (vendorId) complaint.vendor = vendorId;
      if (status) complaint.status = status;
    } 
    // Vendors can only update status to In Progress or Resolved, and add notes
    else if (req.user.role === 'Vendor' && complaint.vendor.toString() === req.user.userId) {
       if (status) complaint.status = status;
       if (resolutionNotes) complaint.resolutionNotes = resolutionNotes;
    } else {
       return res.status(403).json({ message: 'Not authorized to update this complaint' });
    }

    const updatedComplaint = await complaint.save();
    res.json(updatedComplaint);
  } catch (error) {
     console.error('updateComplaint Error:', error);
     res.status(500).json({ message: 'Server Error' });
  }
};

module.exports = { getComplaints, createComplaint, updateComplaint };
