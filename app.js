const express = require("express");
const cors = require("cors");
const app = express();
require("dotenv").config();

// ✅ CORS must be applied BEFORE routes
app.use(cors({
  origin: "http://127.0.0.1:5500", // or "*" if you're just testing
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"]
}));

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use("/api/contacts", require("./routes/contact"));
app.use("/api/users", require("./routes/users"));

app.get("/", (req, res) => {
  res.send("Hello World");
});

const port = process.env.PORT || 6700;
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
