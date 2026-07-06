const fs = require('fs');
let js = fs.readFileSync('c:\\Cap-KxG\\scratch\\fill_06.js', 'utf8');
js = "(() => { " + js + " })();";

const payload = {
    action: 'evaluate',
    args: { code: js },
    session: 'tricky_06_unicode_injection_attempt'
};

fs.writeFileSync('c:\\Cap-KxG\\scratch\\req_fill_06.json', JSON.stringify(payload));
