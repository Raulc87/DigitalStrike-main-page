/**
 * Durable throttles counted from the stored rows (contract §5.3). Pure functions.
 */

var HOUR_MS = 3600000;

/** How many of the most recent rows to read: enough for the daily and hourly caps. */
function throttleRowsToRead(config) {
  return Math.max(config.maxLeadsPerDay, config.maxLeadsPerHour) + 1;
}

/**
 * Seconds until fewer than `limit` of `timesMs` (inside the last hour) remain in the window.
 * `timesMs` holds at least `limit` instants inside the window.
 */
function secondsUntilHourWindowFrees_(timesMs, limit, nowMs) {
  var sorted = timesMs.slice().sort(function (a, b) {
    return a - b;
  });
  var mustExpire = sorted[sorted.length - limit];
  return Math.max(1, Math.ceil((mustExpire + HOUR_MS - nowMs) / 1000));
}

/**
 * `recentRows`: `[{ submittedAt: 'yyyy-MM-dd HH:mm:ss', email }]`, the most recent stored rows
 * (columns A and E). Returns `{ limited: false }` or `{ limited: true, retryAfterSeconds }`
 * (the longest wait when several limits are exceeded).
 */
function checkThrottles(recentRows, email, now, config) {
  var nowMs = now.getTime();
  var today = formatCostaRicaDate(now);
  var lastHour = [];
  var lastHourSameEmail = [];
  var todayCount = 0;

  recentRows.forEach(function (row) {
    var text = String(row.submittedAt).trim();
    var t = parseCostaRicaDateTime(text);
    if (isNaN(t)) {
      return;
    }
    if (text.slice(0, 10) === today) {
      todayCount++;
    }
    if (t > nowMs - HOUR_MS && t <= nowMs) {
      lastHour.push(t);
      var rowEmail = String(row.email).replace(/^'/, '').trim().toLowerCase();
      if (rowEmail === email) {
        lastHourSameEmail.push(t);
      }
    }
  });

  var waits = [];
  if (lastHourSameEmail.length >= config.maxLeadsPerEmailPerHour) {
    waits.push(secondsUntilHourWindowFrees_(lastHourSameEmail, config.maxLeadsPerEmailPerHour, nowMs));
  }
  if (lastHour.length >= config.maxLeadsPerHour) {
    waits.push(secondsUntilHourWindowFrees_(lastHour, config.maxLeadsPerHour, nowMs));
  }
  if (todayCount >= config.maxLeadsPerDay) {
    waits.push(Math.max(1, Math.ceil((nextCostaRicaMidnightMs(now) - nowMs) / 1000)));
  }
  if (waits.length === 0) {
    return { limited: false };
  }
  return { limited: true, retryAfterSeconds: Math.max.apply(null, waits) };
}
