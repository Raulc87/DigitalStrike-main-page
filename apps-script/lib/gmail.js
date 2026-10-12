/**
 * Maps a composed email (lib/emails.js) to GmailApp.sendEmail(recipient, subject, body, options).
 * Sending goes through GmailApp: on this Workspace account Gmail rejects MailApp messages to
 * external addresses, while GmailApp messages are delivered (owner test, 2026-10-11).
 * `replyTo` is passed only when set, so an empty value never reaches Gmail.
 */
function toGmailSendArgs(message) {
  var options = { htmlBody: message.htmlBody, name: message.name };
  if (message.replyTo) {
    options.replyTo = message.replyTo;
  }
  return {
    recipient: message.to,
    subject: message.subject,
    body: message.body,
    options: options,
  };
}
