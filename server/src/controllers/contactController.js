import { asyncHandler } from '../utils/asyncHandler.js';
import { sendContactLeadEmail } from '../services/emailService.js';

export const createContactLead = asyncHandler(async (req, res) => {
  const lead = {
    name: String(req.body.name || '').trim(),
    email: String(req.body.email || '').trim().toLowerCase(),
    company: String(req.body.company || '').trim(),
    phone: String(req.body.phone || '').trim(),
    interest: String(req.body.interest || '').trim(),
    budget: String(req.body.budget || '').trim(),
    message: String(req.body.message || '').trim()
  };

  if (!lead.name || !lead.email || !lead.message) {
    return res.status(400).json({ message: 'Name, email and message are required.' });
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(lead.email)) {
    return res.status(400).json({ message: 'Please enter a valid email address.' });
  }

  await sendContactLeadEmail(lead);
  res.status(201).json({ message: 'Your message has been sent to the Weblix team.' });
});
