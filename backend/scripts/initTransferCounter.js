// migration/startup script: initialize and log transfer counter state
// how to run: node backend/scripts/initTransferCounter.js
const mongoose = require('mongoose');
const mongooseConnector = require('../config/mongoosDB');
const Transfer = require('../models/transferModel');

async function run() {
  try {
    const Counter = mongoose.model('Counter');
    const currentCounter = await Counter.findById('transferNumber');
    const transferNumbers = await Transfer.find({ transferNumber: { $exists: true, $ne: null } })
      .select('transferNumber')
      .lean();

    const maxExistingSequence = transferNumbers.reduce((max, transfer) => {
      const match = String(transfer.transferNumber).match(/^TR-(\d{6})$/);
      if (!match) return max;
      const seq = parseInt(match[1], 10);
      return Number.isNaN(seq) ? max : Math.max(max, seq);
    }, 0);

    const transferCount = await Transfer.countDocuments();

    console.log('Transfer counter initialization report:');
    console.log(`- Existing counter doc present: ${Boolean(currentCounter)}`);
    console.log(`- Current counter sequence: ${currentCounter ? currentCounter.seq : 'none'}`);
    console.log(`- Transfer count: ${transferCount}`);
    console.log(`- Highest existing transfer number sequence: ${maxExistingSequence}`);

    const desiredSequence = Math.max(maxExistingSequence, transferCount);
    if (!currentCounter) {
      await Counter.create({ _id: 'transferNumber', seq: desiredSequence });
      console.log(`Initialized transfer counter to ${desiredSequence}`);
    } else if (currentCounter.seq < desiredSequence) {
      currentCounter.seq = desiredSequence;
      await currentCounter.save();
      console.log(`Adjusted transfer counter from ${currentCounter.seq} to ${desiredSequence}`);
    } else {
      console.log('Counter sequence is already up to date. No changes made.');
    }

    process.exit(0);
  } catch (error) {
    console.error('Failed to initialize transfer counter:', error);
    process.exit(1);
  }
}

run();
