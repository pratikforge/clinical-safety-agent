/**
 * commandBlocker.js
 * 
 * Middleware to detect and block malicious OS command injection payloads
 * before they are processed by the LLM or backend systems.
 */

const logger = require("../utils/logger");

function commandBlocker() {
  return function (req, res, next) {
    if (!req.body) {
      return next();
    }

    const payload = JSON.stringify(req.body).toLowerCase();

    // Regex to match dangerous OS commands and typical injection vectors
    // Using word boundaries \b to avoid matching partial words in clinical text
    const dangerousPatterns = [
      /rm\s+-r/i,            // rm -rf, rm -r
      /\bmkfs\b/i,           // mkfs
      /\bfdisk\b/i,          // fdisk
      /\bwget\s+/i,          // wget
      /\bcurl\s+/i,          // curl
      /\bnc\s+/i,            // netcat
      /\bncat\s+/i,          // netcat
      /\|\s*bash/i,          // piping to bash
      /\|\s*sh/i,            // piping to sh
      /\/bin\/bash/i,        // direct bash execution
      /\/bin\/sh/i,          // direct sh execution
      />\s*\/dev\/null/i,    // hiding output
      />>\s*\/etc\//i,       // writing to system config
      /\beval\s*\(/i,        // JS eval execution
      /\bexec\s*\(/i,        // JS/Python exec execution
      /\bsystem\s*\(/i       // C/Python system execution
    ];

    for (const pattern of dangerousPatterns) {
      if (pattern.test(payload)) {
        logger.warn(`[SECURITY_ALERT] Command injection blocked from IP ${req.ip}. Pattern matched: ${pattern}`);
        return res.status(403).json({
          error: "Security violation: Blocked command pattern detected.",
          code: "COMMAND_INJECTION_BLOCKED"
        });
      }
    }

    next();
  };
}

module.exports = { commandBlocker };
