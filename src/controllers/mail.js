const { google } = require('googleapis');
const nodemailer = require("nodemailer");

const CLIENT_ID = "343078561560-07li85lqhi9qnkf7s7rp9c3duf6uah9s.apps.googleusercontent.com";
const CLIENT_SECRET = "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";
const REFRESH_TOKEN = "1//04zpx-OaFgFh8CgYIARAAGAQSNwF-L9IrhlazEc5sGdLz4d_iAo6CJe7i2VSa5nBk2kQQHinBvsCkTVf6OV3fdMEwMtT0G2RQJZw";

const oAuth2Client = new google.auth.OAuth2(
  CLIENT_ID, CLIENT_SECRET, "https://developers.google.com/oauthplayground/"
);

oAuth2Client.setCredentials({ refresh_token: REFRESH_TOKEN });

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    type: "OAuth2",
    user: "doanduythanh1111@gmail.com",
    clientId: CLIENT_ID,
    clientSecret: CLIENT_SECRET,
    refreshToken: REFRESH_TOKEN,
    accessToken: oAuth2Client.getAccessToken(),
    expires: 3600, // Set the access token expiry time (in seconds)
  },
  tls: {
    rejectUnauthorized: true,
  },
});

exports.sendOrder = async (req, res, next) => {
  try {
    const resData = {};
    const order = req.body;
    console.log(order);

    const prodToHtml = (prod) => {
      return `
      <tr>
        <td>${prod.product.name}</td>
        <td><img src="${prod.product.imgs[0]}" alt="product"></td>
        <td>${Number(prod.product.price).toLocaleString()} VND</td>
        <td>${prod.qty}</td>
        <td>${Number(prod.product.price * prod.qty).toLocaleString()} VND</td>
      </tr>
      `;
    };

    const msg = {
      from: "thanhddfx21978@funix.edu.vn",
      to: order.user.email,
      subject: "Thông tin đơn đặt hàng",
      html: `
      <!DOCTYPE html>
      <html lang="en">
        <head>
          <meta charset="UTF-8">
          <meta http-equiv="X-UA-Compatible" content="IE=edge">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Order</title>
          <style>
            img {
              width: 100%;
              max-width: 100px;
            }
            table {
              text-align: center;
            }
            table th,
            table td {
              border: 1px solid #000;
              padding: 7.5px;
            }
          </style>
        </head>
        <body>
          <h2>Xin chào ${order.user.full_name}</h2>
          <h3>Chúng tôi xin gửi bạn thông tin đơn đặt hàng</h3>
          <p>Người nhận đơn: ${order.receiver.full_name}</p>
          <p>Số điện thoại: ${order.receiver.phone_number}</p>
          <p>Địa chỉ: ${order.receiver.address}</p>
          <table>
            <thead>
              <tr>
                <th>Tên Sản Phẩm</th>
                <th>Hình ảnh</th>
                <th>Giá</th>
                <th>Số lượng</th>
                <th>Thành tiền</th>
              </tr>
            </thead>
            <tbody>
              ${order.products.reduce((str, prod) => str + prodToHtml(prod), "")}
            </tbody>
          </table>
          <h2>Tổng Thanh Toán: ${Number(order.total_price).toLocaleString()} VND</h2>
          <h2>Cảm ơn bạn!</h2>
        </body>
      </html>
      `,
    };

    await transporter.sendMail(msg);

    resData.message = "Email sent successfully";
    return res.json(resData);
  } catch (error) {
    next(error);
  }
};