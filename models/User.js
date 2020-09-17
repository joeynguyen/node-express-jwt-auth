const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const { isEmail } = require('validator');

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: [true, 'Please enter an email'],
    unique: true,
    lowercase: true,
    validate: [isEmail, 'Please enter a valid email']
  },
  password: {
    type: String,
    required: [true, 'Please enter a password'],
    minlength: [6, 'Minimum password length is 6 characters'],
  }
});

// fire a function before doc saved to db
userSchema.pre('save', async function (next) {
  // encrypt the password
  const salt = await bcrypt.genSalt();
  // `this` refers to the request object with the email and pw
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// fire a function after doc saved to db
userSchema.post('save', function (doc, next) {
  console.log('new user was created & saved', doc);
  next();
});

// static method to login user
userSchema.statics.login = async function(email, password) {
  // `this` refers to the the userSchema
  const user = await this.findOne({ email });
  if (user) {
    const auth = await bcrypt.compare(password, user.password);
    if (auth) {
      return user;
    }
    throw Error('incorrect password');
  }
  throw Error('incorrect email');
};

const User = mongoose.model('user', userSchema);

module.exports = User;
