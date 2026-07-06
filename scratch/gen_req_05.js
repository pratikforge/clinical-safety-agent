const fs = require('fs');
let js = fs.readFileSync('c:\\Cap-KxG\\scratch\\fill_05.js', 'utf8');
js = "(() => { " + js + " })();";

const payload = {
    action: 'evaluate',
    args: { code: js },
    session: 'tricky_05_pii_smuggled_in_caregiver_field'
};

fs.writeFileSync('c:\\Cap-KxG\\scratch\\req_fill_05.json', JSON.stringify(payload));
