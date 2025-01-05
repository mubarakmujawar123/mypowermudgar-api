import PDFDocument from "pdfkit";
import * as fs from "fs";

import {
  convertPrice,
  formatDateISO,
  generateOTP,
  getProductAdditionalInfo,
  getProductAdditionalInfoForInvoice,
} from "../utils/utils.js";
import { currencySymbol, getConstant } from "../utils/constant.js";

const addHorizontalRule = (
  doc,
  spaceFromEdge = 0,
  linesAboveAndBelow = 0.5,
  verticalPosition = 1
) => {
  doc
    .moveTo(0 + spaceFromEdge, verticalPosition)
    .lineTo(doc.page.width - spaceFromEdge, verticalPosition)
    .stroke();

  doc.moveDown(linesAboveAndBelow);
  return doc;
};

const generateTableRow = (doc, y, c1, c2, c3, c4, c5) => {
  doc
    .fontSize(10)
    .text(c1, 50, y)
    .text(c2, 150, y)
    .text(getProductAdditionalInfoForInvoice(doc, c3, 250), 250, y, {
      width: 140,
      align: "left",
    })
    .text(c4, 400, y)
    .text(c5, 480, y);
};

export const generateInvoice = async (order, user) => {
  const orderId = order._id.toString();
  const invoiceDetails = {
    orderDate: order.orderDate,
    invoiceNumber: `MPM-${formatDateISO(order.orderDate).slice(
      0,
      4
    )}-${orderId.slice(-5)}`,
    customerName: user.userName,
    addressInfo: {
      name: user.userName,
      phone: order?.addressInfo?.phone,
      address: order?.addressInfo?.address,
      city: order?.addressInfo?.city,
      state: order?.addressInfo?.state,
      country: order?.addressInfo?.country,
      pincode: order?.addressInfo?.pincode,
      notes: order?.addressInfo?.notes,
    },
    items: order.cartItems.map((cartItem) => ({
      title: cartItem.title,
      category: getConstant(cartItem.category),
      description: cartItem.productAdditionalInfo,
      quantity: cartItem.quantity,
      price: `${currencySymbol[order.orderInCurrency]} ${convertPrice(
        cartItem.price,
        order.orderInCurrencyRate
      )}`,
    })),
    orderStatus: order.orderStatus,
    paymentStatus: order.paymentStatus,
    totalCartPriceWithPreferredCurrency:
      order.totalCartPriceWithPreferredCurrency,
    shippingCost: order.shippingCost,
    orderStatus: order.orderStatus,
    orderInCurrency: order.orderInCurrency,
    orderInCurrencyRate: order.orderInCurrencyRate,
  };
  const doc = new PDFDocument({ margin: 50 });
  const filePath = `${order._id}-invoice.pdf`;
  const stream = fs.createWriteStream(filePath);
  const customerInformationTop = 170;

  doc.pipe(stream); // write to PDF
  // pdf header
  doc
    .image("./image/mymudgar-icon.png", 60, 50, { width: 30 })
    .fillColor("#444444")
    .fontSize(20)
    .text("MyPowerMudgar", 110, 57)
    .fontSize(10)
    .text("Pune, MH", 200, 65, { align: "right" })
    .text("India", 200, 80, { align: "right" })
    .moveDown();

  // main invoice

  doc.fillColor("#444444").fontSize(20).text("Invoice", 50, 120);
  addHorizontalRule(doc, 50, 0.5, customerInformationTop - 15);
  doc
    .fontSize(10)
    .text("Invoice Number:", 50, customerInformationTop)
    .font("Helvetica-Bold")
    .text(invoiceDetails.invoiceNumber, 150, customerInformationTop)
    .font("Helvetica")
    .text("Invoice Date:", 50, customerInformationTop + 15)
    .text(formatDateISO(new Date()), 150, customerInformationTop + 15)
    .text("Order Date:", 50, customerInformationTop + 30)
    .text(
      formatDateISO(invoiceDetails.orderDate),
      150,
      customerInformationTop + 30
    )
    // .text("Order Price", 50, customerInformationTop + 45)
    // .text(
    //   `${
    //     currencySymbol[invoiceDetails.orderInCurrency]
    //   } ${invoiceDetails.totalCartPriceWithPreferredCurrency.toFixed(2)}`,
    //   150,
    //   customerInformationTop + 45
    // )
    // .text("Shipping Charges", 50, customerInformationTop + 60)
    // .text(
    //   `${currencySymbol[invoiceDetails.orderInCurrency]} ${Number(
    //     convertPrice(
    //       invoiceDetails.shippingCost,
    //       invoiceDetails.orderInCurrencyRate
    //     )
    //   ).toFixed(2)}`,
    //   150,
    //   customerInformationTop + 60
    // )
    // .text("Total Order Amount", 50, customerInformationTop + 75)
    // .text(
    //   `${currencySymbol[invoiceDetails.orderInCurrency]} ${Number(
    //     invoiceDetails.totalCartPriceWithPreferredCurrency +
    //       Number(
    //         convertPrice(
    //           invoiceDetails.shippingCost,
    //           invoiceDetails.orderInCurrencyRate
    //         )
    //       )
    //   ).toFixed(2)}`,
    //   150,
    //   customerInformationTop + 75
    // )
    .text("Payament Status", 50, customerInformationTop + 45)
    .text(invoiceDetails.paymentStatus, 150, customerInformationTop + 45)
    .text("Order Status", 50, customerInformationTop + 60)
    .text(invoiceDetails.orderStatus, 150, customerInformationTop + 60)
    .font("Helvetica-Bold")
    .text("Shipping Address", 400, customerInformationTop)
    .text(invoiceDetails.addressInfo.name, 400, customerInformationTop + 15)
    .font("Helvetica")
    .text(invoiceDetails.addressInfo.address, 400, customerInformationTop + 30)
    .font("Helvetica")
    .text(
      `${invoiceDetails.addressInfo.city}, ${invoiceDetails.addressInfo.state}, ${invoiceDetails.addressInfo.country}`,
      400,
      customerInformationTop + 45
    )
    .text(invoiceDetails.addressInfo.pincode, 400, customerInformationTop + 60)
    .moveDown();
  addHorizontalRule(doc, 50, 0.5, customerInformationTop + 75);
  doc
    .moveDown(3)
    .fontSize(15)
    .font("Helvetica")
    .text("Order Details", 50, doc.y);
  doc.moveDown();
  let i,
    invoiceTableTop = doc.y;
  const tableLen = invoiceDetails.items.length;

  doc
    .fontSize(10)
    .font("Helvetica-Bold")
    .text("Title", 50, invoiceTableTop)
    .text("Category", 150, invoiceTableTop)
    .text("Description", 250, invoiceTableTop)
    .text("Quantity", 400, invoiceTableTop)
    .text("Price", 480, invoiceTableTop);
  addHorizontalRule(doc, 50, 0.5, invoiceTableTop + 15);
  doc.fontSize(10).font("Helvetica");
  doc.moveDown();
  for (i = 0; i < tableLen; i++) {
    const item = invoiceDetails.items[i];
    const position = doc.y;
    // const position = doc.y + 10;
    generateTableRow(
      doc,
      position,
      item.title,
      item.category,
      item.description,
      item.quantity,
      item.price
    );
    // if (i > 0) {
    doc.moveDown();
    doc.moveDown();
    addHorizontalRule(doc, 50, 0.9, doc.y + 5);
    doc.moveDown();
    // }
  }
  doc.moveDown();
  doc.text("Order Price *", 350, doc.y);
  doc.moveUp();
  doc.text(
    `${
      currencySymbol[invoiceDetails.orderInCurrency]
    } ${invoiceDetails.totalCartPriceWithPreferredCurrency.toFixed(2)}`,
    480,
    doc.y
  );
  doc.moveDown();
  doc.text("Shipping Charges", 350, doc.y);
  doc.moveUp();
  doc.text(
    `${currencySymbol[invoiceDetails.orderInCurrency]} ${Number(
      convertPrice(
        invoiceDetails.shippingCost,
        invoiceDetails.orderInCurrencyRate
      )
    ).toFixed(2)}`,
    480,
    doc.y
  );
  doc.moveDown();
  doc.text("Total Order Amount", 350, doc.y);
  doc.moveUp();
  doc.text(
    `${currencySymbol[invoiceDetails.orderInCurrency]} ${Number(
      invoiceDetails.totalCartPriceWithPreferredCurrency +
        Number(
          convertPrice(
            invoiceDetails.shippingCost,
            invoiceDetails.orderInCurrencyRate
          )
        )
    ).toFixed(2)}`,
    480,
    doc.y
  );
  doc.moveDown(5);
  doc.fontSize(10).font("Helvetica");
  doc.text("Note:", 50, doc.y);
  doc.moveDown();
  doc.text(
    "*:Order Price is based on product base price, product quantity, product weight ect.",
    50,
    doc.y
  );
  doc.moveDown();
  doc.text(
    "This is system generated invoice. Signature does not required.",
    50,
    doc.y
  );
  // pdf footer
  addHorizontalRule(doc, 50, 1, doc.y);

  doc.end();
  return { stream: stream, filePath: filePath, doc: doc };
  // doc.pipe(fs.createWriteStream(path));
};
