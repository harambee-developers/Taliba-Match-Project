// emailService.js
const sgMail = require('@sendgrid/mail')
sgMail.setApiKey(process.env.SENDGRID_API_KEY)
const logger = require('../logger')

/**
 * Send an email via SendGrid
 * @param {string} to - Recipient email
 * @param {string} subject - Email subject
 * @param {string} textContent - Plain text content
 * @param {string} htmlContent - HTML content
 */
const sendEmail = async (to, subject, textContent, htmlContent) => {
  const msg = {
    to,
    from: 'noreply@talibah.co.uk', // Your authenticated domain email
    subject,
    text: textContent,
    html: htmlContent,
  }

  try {
    await sgMail.send(msg)
    logger.info(`✅ Email sent to ${to}`)
  } catch (error) {
    logger.error("❌ SendGrid Error:", error.response?.body || error.message)
  }
}

module.exports = sendEmail
