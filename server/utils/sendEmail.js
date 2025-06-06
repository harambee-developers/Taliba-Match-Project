// emailSender.js
const sgMail = require('@sendgrid/mail');

sgMail.setApiKey(process.env.SENDGRID_API_KEY); // store in .env
const TEMPLATE_ID = 'd-e200c3a2b8dc4d30984a700e191b7c28';
const MAX_BATCH_SIZE = 1000;

function chunkArray(arr, size) {
  const chunks = [];
  for (let i = 0; i < arr.length; i += size) {
    chunks.push(arr.slice(i, i + size));
  }
  return chunks;
}

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

/**
 * Send emails using a dynamic SendGrid template.
 * @param {Array} recipients - List of objects: { email, name, ... }
 * @param {string} templateId - Dynamic template ID (d-xxxxxxxxxxx)
 * @param {string} fromEmail - Sender email address
 */
async function sendEmails(recipients = [], templateId, fromEmail = 'default@example.com') {
    if (!templateId) throw new Error('Template ID is required.');
  
    const validRecipients = recipients.filter(r => isValidEmail(r.email));
    const batches = chunkArray(validRecipients, MAX_BATCH_SIZE);
  
    for (const batch of batches) {
      const personalizations = batch.map((recipient) => ({
        to: { email: recipient.email, name: recipient.name },
        dynamic_template_data: {
          name: recipient.name,
          ...recipient
          // include other fields from recipient if needed
        },
      }));
  
      const msg = {
        from: fromEmail,
        templateId,
        personalizations,
        tracking_settings: {
            click_tracking: {
              enable: false,
              enable_text: false
            }
          }
      };
  
      try {
        await sgMail.send(msg);
        console.log(`✅ Sent batch of ${batch.length}`);
      } catch (error) {
        console.error('❌ Batch failed:', error.response?.body || error.message);
  
        // Retry individually
        await Promise.allSettled(batch.map(async (r) => {
          try {
            const individualMsg = {
              to: { email: r.email, name: r.name },
              from: fromEmail,
              templateId,
              dynamic_template_data: {
                name: r.name,
                ...r
              },
            };
            await sgMail.send(individualMsg);
            console.log(`✅ Retried & sent to ${r.email}`);
          } catch (err) {
            console.error(`❌ Failed to send to ${r.email}:`, err.response?.body || err.message);
          }
        }));
      }
    }
  }
  
module.exports = { sendEmails };
