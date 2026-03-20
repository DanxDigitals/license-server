const express = require("express");
const fs = require("fs");

const app = express();
app.use(express.json());

app.post("/webhook", (req, res) => {
    console.log("Webhook received:", req.body);

    const data = JSON.parse(fs.readFileSync("keys.json"));

    const keyObj = data.find(k => !k.used);

    if (!keyObj) {
        return res.status(500).send("No keys left");
    }

    keyObj.used = true;

    fs.writeFileSync("keys.json", JSON.stringify(data, null, 2));

    console.log("KEY TO SEND:", keyObj.key);

    res.send("OK");
});

app.get("/test", (req, res) => {
    const fs = require("fs");

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

app.listen(3000, () => console.log("Server running on port 3000"));