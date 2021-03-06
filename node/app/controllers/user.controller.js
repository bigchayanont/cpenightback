const jwt = require("jsonwebtoken");
const secretKey = require("../config/auth.config").secret;
const db = require("../models");
const User = db.user;
const { validationResult } = require("express-validator");
const multer = require('multer');
const fs = require('fs')
var bcrypt = require("bcryptjs");

// exports.allAccess = (req, res) => {
//   res.status(200).send("Public Content.");
// };

exports.userBoard = (req, res) => {
  User.findOne({
    where: {
      id: req.body.id,
    },
  })
    .then((user) => {
      if (!user) {
        return res.status(404).send({ message: "User Not found." });
      }
      res.status(200).send({
        id: user.id,
        email: user.email,
        accountType: user.accountType,
        authId: user.authId,
        profilePic: user.profilePic,
        firstName: user.firstName,
        lastName: user.lastName,
        nickName: user.nickName,
        birthday_day: user.birthday_day,
        birthday_month: user.birthday_month,
        birthday_year: user.birthday_year,
        classOf: user.classOf,
        phoneNumber: user.phoneNumber,
        line: user.line,
        facebookAccount: user.facebookAccount,
        organ: user.organ,
        role: user.role,
        field: user.field,
      });
    })
    .catch((err) => {
      res.status(500).send({ message: err.message });
    });
};

exports.editData = (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  User.update(
    {
      email: req.body.email,
      firstName: req.body.firstName,
      lastName: req.body.lastName,
      nickName: req.body.nickName,
      birthday_day: req.body.birthday_day,
      birthday_month: req.body.birthday_month,
      birthday_year: req.body.birthday_year,
      classOf: req.body.classOf,
      phoneNumber: req.body.phoneNumber,
      line: req.body.line,
      facebookAccount: req.body.facebookAccount,
      organ: req.body.organ,
      role: req.body.role,
      field: req.body.field,
    },
    {
      where: {
        id: req.body.id,
      },
    }
  )
    .then(() => {
      res.send({ message: "User edit successfully!" });
    })
    .catch((err) => {
      res.status(500).send({ message: err.message });
    });
};

// exports.moderatorBoard = (req, res) => {
//   res.status(200).send("Moderator Content.");
// };

exports.userInfo = (req, res) => {
  const token = req.cookies.Authorization;
  const payload = jwt.decode(token, secretKey);
  const { id, email } = payload;
  res.send({ id, email });
};

exports.changePassword = (req, res) => {
  User.findOne({
    where: {
      id: req.body.id,
    },
  }).then((user) => {
    if (!user) {
      return res.status(404).send({ message: "User Not found." });
    }
    isPasswordOld = bcrypt.compareSync(req.body.newPassword, user.password);
    if (isPasswordOld) {
      return res.status(400).send({
        message: "Old password!",
      });
    }

    isPasswordWrong = bcrypt.compareSync(req.body.oldPassword, user.password);
    if (!isPasswordWrong) {
      return res.status(401).send({
        message: "Old password is wrong",
      });
    }

    User.update({
        password: bcrypt.hashSync(req.body.newPassword, 8),
      },
      {
        where: {
          id: req.body.id,
        },
      }
    )
      .then((user) => {
        res.send({ message: "edit password success" });
      })
      .error((err) => {
        res.status(500).send({ message: err.message });
      });
  });
};

exports.uploadPic = (req, res) => {
  fs.mkdir('./data/uploads/' + req.query.id,{ recursive: true }, (err) => {
    console.log('mkdir err -->' + err);
  });
  console.log("id: ",req.query.id);

  upload(req, res, (err) =>{
    if(err){
      console.log('error by uploading IMG');
      console.log(err);
      res.status(500).send({ message: err.message });
    }
    else{
      console.log('id UPLOAD IMG --> ' + req.query.id);
      res.send({ message: "upload image success" })
    }
    });
}

/*display pic to the user */
exports.displayPic = (req,res) => {
    User.findOne({
      where: {
      id: req.params.id,
      }}). then((user) => {
      if(!user) console.log('cant find id usr');
      res.sendFile(user.id + '/' + user.profilePic,{ root: './data/uploads/' });
    })

 
}

const storage = multer.diskStorage({
  destination: function (req, file, callback) {
    // callback(fs.mkdir('/data/uploads/' + request.user._id));
      User.update({
	      profilePic : req.query.id + '-' + file.originalname
      },
      {
        where: {id: req.query.id},
      })
      .then(() => {
        console.log('upload image form usr --> ' + req.query.id);
      })
      .catch((err) => {  
        console.log('upload failed' + err)
      }),
    callback(null, './data/uploads/' + req.query.id); //will automate catagory
  },
  filename: function (req, file, callback) {
    console.log(file);
    callback(null, req.query.id + '-' + file.originalname);
    }
  });
  // Function to upload images
const upload = multer({storage: storage}).single('uploadedImages');