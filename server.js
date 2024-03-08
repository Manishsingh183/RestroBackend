const express = require("express");
const cors = require("cors");
const app = express();
const bodyParser = require("body-parser");
const mongoose = require("mongoose");

app.use(cors());
require("dotenv").config();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
const port = 8080;
const database_URL = process.env.database_URL;

// Connecting through the database
// LammaRestro here is database name
mongoose
  .connect(database_URL)
  .then((res) => {
    console.log("Connected to Database");
  })
  .catch((error) => {
    console.error("Error while connecting to database", error);
  });

const multer = require("multer");
const { all } = require("axios");

// This here specify where our images are gonna store
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/");
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now();
    // here cb means Callback
    cb(null, uniqueSuffix + file.originalname);
  },
});

const upload = multer({ storage: storage });

const userAuthenticate = (req, res, next) => {
  const isLogin = "True";
  if (!isLogin) {
    res.redirect("/login");
  } else {
    next();
  }
};

// Create different Schemas(or table) to store different data.
const contactSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true },
  comment: { type: String, required: true },
});

const reservationSchema = new mongoose.Schema({
  fullName: { type: String, required: true },
  guestNo: { type: Number, required: true },
  date: { type: Date, required: true },
  timeSlot: { type: String, required: true },
  bookingType: { type: String, required: true },
});

const mailingSchema = new mongoose.Schema({
  email: { type: String, required: true },
});

const menuSchema = new mongoose.Schema({
  dishName: { type: String, required: true },
  dishDescription: { type: String, required: true },
  price: { type: Number, required: true },
  category: { type: String, required: true },
  subCategory: { type: String, required: true },
});

const MailingModel = new mongoose.model("Mailing", mailingSchema);
// Now create a collection for this schema where all your data will be stored
const contactUsEntry = new mongoose.model("Contact", contactSchema);

const reservationModel = new mongoose.model("Reservations", reservationSchema);

const menuModel = new mongoose.model("MenuDesc", menuSchema);
////////////  Now we need to use Multer to store and save image
// here upload.single(<image_name>) bcoz we are storing only single image at a time.
app.post("/adminMenu", upload.single("image"), async (req, res) => {
  // console.log(req.body);
  const { image, dishName, price, dishDescription, category, subCategory } =
    req.body;
  const menuItem = new menuModel({
    dishName: dishName,
    dishDescription: dishDescription,
    price: price,
    category: category,
    subCategory: subCategory,
  });
  console.log(menuItem);
  menuItem.save();

  res.send("Uploaded!!");
});

app.get("/adminMenu", async (req, res) => {
  try {
    // const StarterValues = await menuModel.find({ category: "Starter" });
    // const MainCourseValues = await menuModel.find({ category: "MainCourse" });
    // const SpecialValues = await menuModel.find({ category: "Specials" });
    // const DrinksValues = await menuModel.find({ category: "Drinks" });
    // const allValues = {
    //   starter: StarterValues,
    //   mainCourse: MainCourseValues,
    //   specials: SpecialValues,
    //   drinks: DrinksValues,
    // };
    // console.log(allValues);
    const allValues = await menuModel.find();
    res.json(allValues);
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Internal Server Error!" });
  }
});

app.get("/menu", async (req, res) => {
  try {
    const StarterValues = await menuModel.find({ category: "Starter" });
    const MainCourseValues = await menuModel.find({ category: "MainCourse" });
    const SpecialValues = await menuModel.find({ category: "Specials" });
    const DrinksValues = await menuModel.find({ category: "Drinks" });
    const allValues = {
      starter: StarterValues,
      mainCourse: MainCourseValues,
      specials: SpecialValues,
      drinks: DrinksValues,
    };
    res.json(allValues);
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

app.post("/reservation", (req, res) => {
  console.log(req.body);
  const { fullName, guestNo, bookingtype, selectedDate, timeslot } = req.body;
  const reservation = new reservationModel({
    fullName: fullName,
    guestNo: guestNo,
    date: new Date(selectedDate),
    timeSlot: timeslot,
    bookingType: bookingtype,
  });

  reservation.save();
  res.json({ message: "Reservation successful" });
});

app.get("/reservation", async (req, res) => {
  try {
    const allValues = await reservationModel.find();
    res.json(allValues);
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

app.post("/contactUs", (req, res) => {
  // console.log(req.body);
  const { name, email, comment } = req.body;
  const contactData = new contactUsEntry({
    name: name,
    email: email,
    comment: comment,
  });
  console.log(contactData);
  contactData.save();
  res.json("Your comment has reached to us!!");
});

app.get("/contactUs", async (req, res) => {
  try {
    const allValues = await contactUsEntry.find();
    res.json(allValues);
  } catch (error) {
    console.error("Error found", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

app.post("/mailing", (req, res) => {
  const mailingData = new MailingModel({
    email: Object.keys(req.body)[0],
  });
  mailingData.save();
  console.log(Object.keys(req.body)[0]);
  res.json({ message: "You have been added to our mailing List" });
});

app.get("/mailing", async (req, res) => {
  try {
    const allValues = await MailingModel.find();
    res.json(allValues);
  } catch (error) {
    console.error("Error fetching data:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

app.listen(process.env.PORT || port, (req, res) => {
  console.log("Server is up and running on port", port);
});
