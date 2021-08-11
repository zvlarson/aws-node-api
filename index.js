const express = require("express")
const cors = require("cors")
const mongoose = require("mongoose")

const app = express()
app.use(express.json())
app.use(cors())

// connect to MongoDB
require("dotenv/config")
mongoose
  .connect(process.env.DB_CONNECTION, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useFindAndModify: false,
  })
  .then(() => {
    app.listen("5000", () => console.log("App is listening on port 5000"))
  })
  .catch((err) => console.error(err))

const userSchema = mongoose.Schema(
  {
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    email: { type: String, required: true },
    password: { type: String, required: true },
  },
  { timestamps: true }
)
const UsersModel = mongoose.model("Users", userSchema)

app.get("/users", (req, res) => {
  UsersModel.find()
    .then((allUsers) => res.status(200).send(allUsers))
    .then(() => console.log("All users sent"))
    .catch((err) => console.error(err))
})

app.post("/create-user", (req, res) => {
  new UsersModel(req.body)
    .save()
    .then(() => {
      UsersModel.findOne({ email: req.body.email }).then((foundUser) =>
        res.send(foundUser)
      )
    })
    .catch((err) => console.error(err))
})

app.post("/login", (req, res) => {
  UsersModel.findOne({ email: req.body.email })
    .then((userFound) => {
      console.log(userFound)
      if (!userFound || userFound.password !== req.body.password) {
        return res
          .status(404)
          .send("Authentication failed: User not found or incorrect password.")
      }
      if (userFound && userFound.password === req.body.password) {
        res.status(200).send(userFound)
      } else {
        res.status(401).send("Authentication failed.")
      }
    })
    .catch((err) => console.error(err))
})
