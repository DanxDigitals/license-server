require("dotenv").config();
const express = require("express");
const fs = require("fs");
const { MailerSend, EmailParams, Sender, Recipient } = require("mailersend");

const mailerSend = new MailerSend({
    apiKey: process.env.MAILERSEND_API_KEY,
});

const app = express();
app.use(express.json());

async function sendKeyEmail(email, key) {
    const sentFrom = new Sender("noreply@test-z0vklo6v977l7qrx.mlsender.net", "DayDraft Pro");
    const recipients = [new Recipient(email)];

    const emailParams = new EmailParams()
        .setFrom(sentFrom)
        .setTo(recipients)
        .setSubject("Your License Key")
        .setHtml(`
            <h2>Thank you for your purchase!</h2>
            <p>Your license key is:</p>
            <h1>${key}</h1>
        `);

    await mailerSend.email.send(emailParams);
}

app.post("/webhook", async (req, res) => {
    console.log("Webhook received:", req.body);

    let data = JSON.parse(fs.readFileSync("keys.json"));

    const keyObj = data.find(k => !k.used);

    if (!keyObj) {
        return res.status(500).send("No keys left");
    }

    const email = req.body?.customer?.email;

    if (!email) {
        return res.status(400).send("No email found");
    }

    keyObj.used = true;
    fs.writeFileSync("keys.json", JSON.stringify(data, null, 2));

    console.log("Sending key to:", email);
    await sendKeyEmail(email, keyObj.key);

    res.send("Key sent successfully");
});

app.get("/test", (req, res) => {
    const data = JSON.parse(fs.readFileSync("keys.json"));

    const keyObj = data.find(k => !k.used);

    if (!keyObj) {
        return res.send("No keys left");
    }

    keyObj.used = true;
    fs.writeFileSync("keys.json", JSON.stringify(data, null, 2));

    console.log("TEST KEY:", keyObj.key);
    res.send(`Your key is: ${keyObj.key}`);
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log("Server running on port " + PORT));
