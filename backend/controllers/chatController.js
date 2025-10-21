const Message = require('../models/Message');
const Transaction = require('../models/Transaction');

// @desc    Get all messages for a specific transaction
// @route   GET /api/chat/:transactionId
// @access  Private
exports.getChatHistory = async (req, res) => {
  try {
    const { transactionId } = req.params;
    const loggedInUserId = req.user._id.toString(); // Get string version of logged-in user ID

    console.log(`[BACKEND] Chat History Request for Tx: ${transactionId}`);
    console.log(`[BACKEND] Logged-in User ID: ${loggedInUserId}`);

    const transaction = await Transaction.findById(transactionId);
    if (!transaction) {
      console.log('[BACKEND] Transaction not found.');
      return res.status(404).json({ message: "Transaction not found." });
    }

    const ownerId = transaction.owner.toString();
    const requesterId = transaction.requester.toString();

    // --- CRITICAL LOGS ---
    console.log(`[BACKEND] Transaction Owner ID:    ${ownerId}`);
    console.log(`[BACKEND] Transaction Requester ID: ${requesterId}`);

    // Security Check
    if (ownerId !== loggedInUserId && requesterId !== loggedInUserId) {
      console.error('[BACKEND] SECURITY FAIL! User is not part of this transaction.');
      return res.status(403).json({ message: "You are not authorized to view this chat." });
    }

    console.log('[BACKEND] Security check passed. Fetching messages...');
    const messages = await Message.find({ transactionId: transactionId })
      .sort({ createdAt: 'asc' })
      .populate('author', 'username');

    res.status(200).json(messages);

  } catch (error) {
    console.error('[BACKEND] Error in getChatHistory:', error);
    res.status(500).json({ message: "Server Error: Could not fetch chat history." });
  }
};