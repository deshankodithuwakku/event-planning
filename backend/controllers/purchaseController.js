import Payment from '../models/Payment.js';
import { Event } from '../models/eventModel.js';
import { Package } from '../models/packageModel.js';
import { Feedback } from '../models/feedbackModel.js';
import { User } from '../models/userModel.js';

/**
 * Get all customer purchases with event, package, and feedback details
 */
export const getCustomerPurchases = async (req, res) => {
  try {
    // Get all payments with populated customer, event, and package data
    const payments = await Payment.find({})
      .sort({ p_date: -1 });
    
    const customerPurchases = [];
    
    // For each payment, fetch the associated customer, event, package, and feedback details
    for (const payment of payments) {
      try {
        // Get event details
        const event = await Event.findOne({ E_ID: payment.eventId });
        
        // Get package details
        const package_ = await Package.findOne({ Pg_ID: payment.packageId });
        
        // Get customer details - checking both new and old models
        let customer = await User.findOne({ userId: payment.customerId });
        
        if (!customer) {
          // Try to find in old Customer model if needed
          const { Customer } = await import('../models/customerModel.js');
          customer = await Customer.findOne({ C_ID: payment.customerId });
          
          if (!customer) {
            continue; // Skip this payment if customer not found
          }
        }
        
        // Get feedback (if any)
        let feedback = await Feedback.findOne({ customerId: payment.customerId });
        
        // Only include if event and package exist
        if (event && package_) {
          customerPurchases.push({
            customer: {
              customerId: customer.userId || customer.C_ID,
              name: customer.firstName && customer.lastName 
                ? `${customer.firstName} ${customer.lastName}` 
                : customer.name || 'Unknown',
              phoneNo: customer.phoneNo
            },
            event: {
              eventId: event.E_ID,
              name: event.E_name
            },
            payment: {
              paymentId: payment.P_ID,
              amount: payment.p_amount,
              date: payment.p_date,
              status: payment.status
            },
            package: {
              packageId: package_.Pg_ID,
              price: package_.Pg_price
            },
            feedback: feedback ? {
              rating: feedback.rating,
              comment: feedback.message
            } : null
          });
        }
      } catch (err) {
        console.log(`Error processing payment ${payment.P_ID}: ${err.message}`);
        // Continue with next payment
      }
    }
    
    res.status(200).json({
      count: customerPurchases.length,
      data: customerPurchases
    });
  } catch (error) {
    console.log(error.message);
    res.status(500).send({ message: error.message });
  }
};
