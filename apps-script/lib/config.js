/**
 * Script Properties → typed configuration (contract §8).
 * `props` is a plain object, e.g. PropertiesService.getScriptProperties().getProperties().
 */

var CONFIG_DEFAULTS = {
  SENDER_NAME: 'DigitalStrike Solutions',
  CALENDLY_URL: 'https://calendly.com/rcasanas/1hr',
  SITE_URL: 'https://digitalstrike-solutions.com',
  SEND_EMAILS: 'true',
  MAX_LEADS_PER_EMAIL_PER_HOUR: '3',
  MAX_LEADS_PER_HOUR: '20',
  MAX_LEADS_PER_DAY: '40',
};

function readConfig(props) {
  var p = props || {};
  function str(key) {
    var v = p[key];
    if (v === undefined || v === null || String(v).trim() === '') {
      return CONFIG_DEFAULTS[key] !== undefined ? CONFIG_DEFAULTS[key] : '';
    }
    return String(v).trim();
  }
  function positiveInt(key) {
    var n = Number(str(key));
    if (!Number.isInteger(n) || n < 1) {
      n = Number(CONFIG_DEFAULTS[key]);
    }
    return n;
  }
  return {
    sheetId: str('SHEET_ID'),
    ownerNotificationEmail: str('OWNER_NOTIFICATION_EMAIL'),
    replyToEmail: str('REPLY_TO_EMAIL'),
    senderName: str('SENDER_NAME'),
    calendlyUrl: str('CALENDLY_URL'),
    siteUrl: str('SITE_URL'),
    acceptedPrivacyNoticeVersions: str('ACCEPTED_PRIVACY_NOTICE_VERSIONS')
      .split(',')
      .map(function (s) {
        return s.trim();
      })
      .filter(function (s) {
        return s !== '';
      }),
    // Anything other than an explicit "false" keeps emails on (contract §8 default `true`).
    sendEmails: str('SEND_EMAILS').toLowerCase() !== 'false',
    maxLeadsPerEmailPerHour: positiveInt('MAX_LEADS_PER_EMAIL_PER_HOUR'),
    maxLeadsPerHour: positiveInt('MAX_LEADS_PER_HOUR'),
    maxLeadsPerDay: positiveInt('MAX_LEADS_PER_DAY'),
  };
}
