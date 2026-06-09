const nodemailer = require("nodemailer");
const Booking = require("./models/Booking");
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

const app = express();

app.use(cors());
app.use(express.json());

mongoose.connect(process.env.MONGO_URI)
.then(() => {
    console.log("MongoDB Connected ✅");
})
.catch((err) => {
    console.log(err);
});

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
port: Number(process.env.SMTP_PORT),
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS
  }
});

transporter.verify((error, success) => {

  if (error) {
    console.log("SMTP ERROR:");
    console.log(error);
  } else {
    console.log("SMTP READY ✅");
  }

});

console.log("SMTP_HOST =", process.env.SMTP_HOST);
console.log("SMTP_PORT =", process.env.SMTP_PORT);
console.log("SMTP_USER =", process.env.SMTP_USER);
console.log("SMTP_PASS =", process.env.SMTP_PASS ? "Loaded ✅" : "Missing ❌");

app.get("/", (req, res) => {
    res.send("Server Running 🚀");
});

app.get("/api/bookings", async (req, res) => {

  try {

    const bookings =
      await Booking.find().sort({
        createdAt: -1
      });

    res.json(bookings);

  } catch (error) {

    res.status(500).json({
      message: error.message
    });

  }

});

app.post("/api/bookings", async (req, res) => {

  try {

    const booking = new Booking(req.body);

    await booking.save();

const info = await transporter.sendMail({
  from: '"Parth Portfolio" <vishnupriyagouda@gmail.com>',
  to: "goudaparth07@gmail.com",
  subject: "🚀 New Portfolio Booking",
  html: `
    <h2>New Booking Received</h2>

    <p><strong>Name:</strong> ${booking.name}</p>
    <p><strong>Email:</strong> ${booking.email}</p>
    <p><strong>Phone:</strong> ${booking.phone}</p>
    <p><strong>Service:</strong> ${booking.service}</p>
    <p><strong>Budget:</strong> ${booking.budget}</p>
    <p><strong>Deadline:</strong> ${booking.deadline}</p>
    <p><strong>Description:</strong> ${booking.description}</p>
  `
});

console.log("MAIL SENT ✅");
console.log(info);

    res.status(201).json({
      success: true,
      message: "Booking Saved Successfully"
    });

  } catch (error) {

    res.status(500).json({
      success: false,
      message: error.message
    });

  }

});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

app.put("/api/bookings/:id", async (req, res) => {

  try {

    const booking =
      await Booking.findByIdAndUpdate(
        req.params.id,
        {
          status: req.body.status
        },
        {
          new: true
        }
      );

    res.json(booking);

  } catch (error) {

    res.status(500).json({
      message: error.message
    });

  }

});
app.delete("/api/bookings/:id", async (req, res) => {

  try {

    await Booking.findByIdAndDelete(req.params.id);

    res.json({
      message: "Booking deleted successfully"
    });

  } catch (error) {

    res.status(500).json({
      message: error.message
    });

  }

});