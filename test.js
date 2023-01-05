// const secretkey = require('crypto').randomBytes(64).toString('hex');
// console.log(secretkey);
const nodemailer = require('nodemailer');

let mailTransporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'vasanthram227@gmail.com',
    pass: 'qpmexclhxkaricjo',
  },
});

let mailDetails = {
  from: 'vasanthram227@gmail.com',
  to: 'sanjeevmajhi036@gmail.com',
  subject: 'Test mail',
  text: 'testing mail from NodeJS',
};

mailTransporter.sendMail(mailDetails, function (err, data) {
  if (err) {
    console.log('Error Occurs');
    console.log(err);
  } else {
    console.log('Email sent successfully');
  }
});
