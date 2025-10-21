

const Transaction = require('../models/Transaction');
const Item = require('../models/Item');
const crypto = require('crypto');


exports.createTransaction = async (req, res) => {
  try {
    const { itemId } = req.body;
    const requester = req.user._id;

    console.log('[CREATE TX] Starting transaction creation...');
    const item = await Item.findById(itemId);
    if (!item) {
      return res.status(404).json({ message: 'Item not found' });
    }
    if (item.status !== 'available') {
      return res.status(400).json({ message: 'This item is not currently available.' });
    }
    if (item.owner.toString() === requester.toString()) {
        return res.status(400).json({ message: 'You cannot rent or buy your own item.' });
    }

    // --- LOG #1: Check the generated ID ---
    const chatRoomId = crypto.randomBytes(16).toString('hex');
    console.log(`[CREATE TX] Generated chatRoomId: ${chatRoomId}`);

    const transactionData = {
      item: itemId,
      owner: item.owner,
      requester: requester,
      status: 'pending',
      agreedPrice: item.price,
      chatRoomId: chatRoomId,
    };

    // --- LOG #2: Check the object right before saving ---
    console.log('[CREATE TX] Transaction object BEFORE save:', transactionData);

    const transaction = new Transaction(transactionData);
    const savedTransaction = await transaction.save();
    
    // --- LOG #3: Check the object AFTER saving ---
    console.log('[CREATE TX] Transaction object AFTER save (from DB):', savedTransaction);

    res.status(201).json({ 
      message: 'Your request has been sent to the owner.',
      transaction: savedTransaction 
    });

  } catch (error) {
    console.error("[CREATE TX] CRITICAL ERROR during transaction creation:", error);
    res.status(500).json({ message: "Server error while creating transaction." });
  }
};

// @desc    Update the status of a transaction (approve, reject, complete)
// @route   PUT /api/transactions/:id/status
// @access  Private
exports.updateTransactionStatus = async (req, res) => {
  try {
    const { status } = req.body; // Expecting 'approved', 'rejected', or 'completed'
    const transaction = await Transaction.findById(req.params.id).populate('item');

    if (!transaction) {
      return res.status(404).json({ message: 'Transaction not found.' });
    }

    // SECURITY CHECK: Only the item owner can approve or reject.
    if (status === 'approved' || status === 'rejected') {
      if (transaction.owner.toString() !== req.user._id.toString()) {
        return res.status(403).json({ message: 'Not authorized to perform this action.' });
      }
    }
    
    // SECURITY CHECK: Either party can mark a transaction as complete
    if (status === 'completed') {
        if (transaction.owner.toString() !== req.user._id.toString() && transaction.requester.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Not authorized to complete this transaction.' });
        }
    }

    // Update the transaction status
    transaction.status = status;

    // --- CRUCIAL LOGIC: Update the item's availability ---
    if (status === 'approved') {
      const itemStatus = transaction.item.listingType === 'Sell' ? 'sold' : 'rented_out';
      await Item.findByIdAndUpdate(transaction.item._id, { status: itemStatus });
    } else if (status === 'completed' || status === 'rejected' || status === 'cancelled') {
        // If it was a rental, make it available again. If sold, it remains sold.
        if (transaction.item.listingType === 'Rent') {
             await Item.findByIdAndUpdate(transaction.item._id, { status: 'available' });
        }
    }

    await transaction.save();
    res.json({ message: `Transaction has been ${status}.` });

  } catch (error) {
    console.error("TRANSACTION UPDATE ERROR:", error);
    res.status(500).json({ message: "Server error while updating transaction." });
  }
};