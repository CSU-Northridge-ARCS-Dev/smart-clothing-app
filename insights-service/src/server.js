require("dotenv").config({ path: require("path").join(__dirname, "..", ".env") });

const { createApp } = require("./app");
const { getConfig } = require("./config");

const { port } = getConfig();

createApp().listen(port, () => {
  console.log(`insights-service listening on http://localhost:${port}`);
});
