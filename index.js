const nodemailer = require("nodemailer");
const fs = require("fs");
const path = require("path");

// --- 1) transporter (use appropriate SMTP for production: SES, etc.)
const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 465,
  secure: true,
  auth: {
    user: "sandeshshinde7047@gmail.com",
    pass: "eupbhvpefipljxjy"
  }
});


// --- 2) load template once
const TEMPLATE_PATH = path.join(__dirname, "index.html");
let rawTemplate = fs.readFileSync(TEMPLATE_PATH, "utf8");

// --- 3) attachments (match your images folder)
const attachments = [
  { filename: "1_whatsapp_dp.png", path: path.join(__dirname, "images/1_whatsapp_dp.png"), cid: "whatsappDp@cid" },
  { filename: "2_icons8-linked-in-48.png", path: path.join(__dirname, "images/2_icons8-linked-in-48.png"), cid: "linkedin@cid" },
  { filename: "3_icons8-instagram-48.png", path: path.join(__dirname, "images/3_icons8-instagram-48.png"), cid: "instagram@cid" },
  { filename: "4_icons8-youtube-48.png", path: path.join(__dirname, "images/4_icons8-youtube-48.png"), cid: "youtube@cid" },
  { filename: "5_icons8-website-48.png", path: path.join(__dirname, "images/5_icons8-website-48.png"), cid: "website@cid" }
];

// If your template uses src="images/filename" replace them with cid:... once here
// (Only needed if your index.html currently uses relative src="images/..." paths.)
let emailTemplateWithCids = rawTemplate

  .replace(/src="images\/1_whatsapp_dp.png"/g, 'src="cid:whatsappDp@cid"')
  .replace(/src="images\/2_icons8-linked-in-48.png"/g, 'src="cid:linkedin@cid"')
  .replace(/src="images\/3_icons8-instagram-48.png"/g, 'src="cid:instagram@cid"')
  .replace(/src="images\/4_icons8-youtube-48.png"/g, 'src="cid:youtube@cid"')
  .replace(/src="images\/5_icons8-website-48.png"/g, 'src="cid:website@cid"');

// --- 4) helper to fill tokens
function fillTemplate(templateStr, values) {
  // values: { FULL_NAME, USER, PASSWORD, ... }
  let filled = templateStr;
  for (const [key, val] of Object.entries(values)) {
    // replace all occurrences of {{KEY}} (case-sensitive)
    const token = new RegExp(`{{\\s*${key}\\s*}}`, "g");
    filled = filled.replace(token, val != null ? String(val) : "");
  }
  return filled;
}

// --- 5) send function for one recipient
async function sendTo(email, fullName, username, password) {
  const html = fillTemplate(emailTemplateWithCids, {
    FULL_NAME: fullName,
    USER: username,
    PASSWORD: password
  });

  try {
    const info = await transporter.sendMail({
     from: '"Cloudverse 2K25" <sandeshshide7047@gmail.com>',
      to: email,
      subject: "Your IAM Credentials – Cloudverse 2K25",
      html,
      attachments
    });
    console.log(`✅ Sent to ${email} — messageId: ${info.messageId}`);
    return info;
  } catch (err) {
    console.error(`❌ Failed to send to ${email}`, err);
    throw err;
  }
}

// --- 6) Example usage: single send
// sendTo("participant@example.com", "Sandesh Shinde", "sandesh", "sandesh@30");

// --- 7) Example usage: bulk send from an array
async function sendBulk(list) {
  for (const p of list) {
    // p = { email, fullName, username, password }
    try {
      await sendTo(p.email, p.fullName, p.username, p.password);
      // optional: small delay to avoid throttling
      await new Promise(res => setTimeout(res, 500));
    } catch (e) {
      // continue with next recipient
      console.error("Continue to next after error:", e.message || e);
    }
  }
}

// Example bulk list (replace with real data or read from CSV)
const participants = [
//   { email: "sandeshshinde1730@gmail.com", fullName: "Sandesh Shinde", username: "sandesh", password: "sandesh@30" },
  { email: "sakshi.bhosale1@walchandsangli.ac.in", fullName: "Sakshi Bhosale", username: "sakshi", password: "sakshi@1234" }
];

// uncomment to run bulk send
sendBulk(participants);

// For quick testing, uncomment a single send:
// sendTo("sandeshshinde1730@gmail.com", "Sandesh Shinde", "sandesh", "sandesh@30");
