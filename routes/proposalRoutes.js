// const express = require('express');
// const router = express.Router();
// const Proposal = require('../models/proposalModel');

// // CREATE
// router.post('/', async (req, res) => {
//   const proposal = await Proposal.create(req.body);
//   res.status(201).json(proposal);
// });

// // // READ ALL
// // router.get('/', async (req, res) => {
// //   const proposals = await Proposal.find()
// //    .populate('projects')
// //     .populate('submittedBy');
// //   res.json(proposals);
// // });

// router.get('/', async (req, res) => {
//   try {
//     const proposals = await Proposal.find()
//       .populate('submittedBy'); // ✅ VALID

//     res.json(proposals);
//   } catch (error) {
//     res.status(500).json({ error: error.message });
//   }
// });


// // READ ONE
// router.get('/:id', async (req, res) => {
//   const proposal = await Proposal.findById(req.params.id);
//   res.json(proposal);
// });

// // UPDATE
// router.put('/:id', async (req, res) => {
//   const proposal = await Proposal.findByIdAndUpdate(
//     req.params.id,
//     req.body,
//     { new: true }
//   );
//   res.json(proposal);
// });

// // DELETE
// router.delete('/:id', async (req, res) => {
//   await Proposal.findByIdAndDelete(req.params.id);
//   res.json({ message: 'Proposal deleted' });
// });

// module.exports = router;




const express = require('express');
const router = express.Router();
const Proposal = require('../models/proposalModel');


// CREATE proposal
router.post('/', async (req, res) => {
  try {
    const proposal = await Proposal.create(req.body);
    res.status(201).json(proposal);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});


// READ ALL proposals ✅ (FIXED)
router.get('/', async (req, res) => {
  try {
    const proposals = await Proposal.find()
      .populate('submittedBy'); // ✅ ONLY VALID POPULATE

    res.json(proposals);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


// READ ONE proposal by ID
router.get('/:id', async (req, res) => {
  try {
    const proposal = await Proposal.findById(req.params.id)
      .populate('submittedBy');

    if (!proposal) {
      return res.status(404).json({ message: 'Proposal not found' });
    }

    res.json(proposal);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


// UPDATE proposal
router.put('/:id', async (req, res) => {
  try {
    const proposal = await Proposal.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );

    res.json(proposal);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});


// DELETE proposal
router.delete('/:id', async (req, res) => {
  try {
    await Proposal.findByIdAndDelete(req.params.id);
    res.json({ message: 'Proposal deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
