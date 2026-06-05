import nodemailer from "nodemailer";
import { EMAIL, PASS } from "./secrets.js";
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: EMAIL,
    pass: PASS,
  },
});

export const sendEmail = async (
  subject: string,
  text: string,
  email: string,
  password: string
) => {
  const mailOptions = {
    from: '"Gym Manager" <zyadbassem9090@gmail.com>',
    to: email,
    subject,
    text,
    html: `<table width="100%" cellpadding="10" cellspacing="0" style="max-width: 400px; border-collapse: collapse; font-family: Arial, sans-serif; border: 1px solid #dddddd;">
    <thead>
        <tr>
            <th colspan="2" style="background-color: #f4f4f4; color: #333333; text-align: center; font-size: 18px; border-bottom: 1px solid #dddddd;">
                GYM MANAGER
            </th>
        </tr>
        <tr>
            <th style="text-align: left; background-color: #fafafa; border-bottom: 1px solid #dddddd; border-right: 1px solid #dddddd; width: 50%; color: #333333;">
                Email
            </th>
            <th style="text-align: left; background-color: #fafafa; border-bottom: 1px solid #dddddd; width: 50%; color: #333333;">
                Password
            </th>
        </tr>
    </thead>
    <tbody>
        <tr>
            <td style="border-right: 1px solid #dddddd; color: #555555; font-size: 14px;">
                ${email}
            </td>
            <td style="color: #555555; font-size: 14px;">
                ${password}
            </td>
        </tr>
    </tbody>
</table>`,
  };
  const info = await transporter.sendMail(mailOptions);
  console.log("Message sent: %s", info.messageId);
};
