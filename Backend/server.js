const express = require("express");
const cors = require("cors");
require("dotenv").config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
const authRoutes = require("./routes/auth");
const productRoutes = require("./routes/products");
const orderRoutes = require("./routes/orders");
const reviewRoutes = require("./routes/reviews");
const adminRoutes = require("./routes/admin");
const uploadRoutes = require("./routes/upload"); // ← NEW

app.get("/", (req, res) => res.send("Livylamp API is running"));

app.use("/", authRoutes);
app.use("/products", productRoutes);
app.use("/products/:id/reviews", reviewRoutes);
app.use("/orders", orderRoutes);
app.use("/admin", adminRoutes);
app.use("/admin/upload", uploadRoutes); // ← NEW

// Handle routes that don't exist
app.use((req, res) => {
  res.status(404).json({ message: "Route not found" });
});

// Handle unexpected server errors
app.use((err, req, res, next) => {
  console.error(err.message);
  res.status(500).json({ message: "Something went wrong on the server" });
});

// Start server
app.listen(process.env.PORT, () => {
  console.log(`Livylamp API is running on port ${process.env.PORT}`);
});
