import nodemailer from "nodemailer";

export const sendMail = async ({ userName, to, subject, message }) => {
  let transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.DOMAIN_EMAIL,
      pass: process.env.DOMAIN_EMAIL_PASS,
    },
  });
  // Email options
  let mailOptions = {
    from: `"MyPowerMudgar " <${process.env.DOMAIN_EMAIL}>`, // Sender address
    //to: to, // List of recipients
    to: process.env.DOMAIN_EMAIL, // remove this
    subject: subject, // Subject line
    html: `Hello ${userName}, <br/> ${message} <br/><br/> Regards, <br/> <b>MypowerMudgar Team</>`, // HTML body
  };

  // Send email
  let res;
  try {
    res = await transporter.sendMail(mailOptions);
  } catch (err) {
    res = { Error: err };
  }
  return res;
};
