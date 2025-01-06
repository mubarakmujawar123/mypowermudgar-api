import { getConstant } from "./constant.js";

export const calculateItemPrice = (
  basePrice,
  quantity,
  productAdditionalInfo,
  isForInvoice = false,
  orderInCurrencyRate = 1
) => {
  let finalPrice = isForInvoice
    ? Number(basePrice) * Number(orderInCurrencyRate)
    : Number(basePrice);
  finalPrice = finalPrice * Number(quantity);

  let productWeight = productAdditionalInfo?.weight;
  if (productWeight) {
    if (productWeight.includes("-")) {
      productWeight = productWeight.split("-")?.[0];
    }

    finalPrice = finalPrice * Number(productWeight);
  }
  // finalPrice = finalPrice.toFixed(2);
  return finalPrice;
};

export const convertPrice = (price, currencyRate) => {
  let calculatePrice = price;
  if (currencyRate) {
    calculatePrice = Number(price) * Number(currencyRate);
  }
  return Number(calculatePrice).toFixed(2);
};

export const formatDateISO = (date) => {
  // Convert the date to ISO string
  const isoString = date.toISOString();
  // Split at the "T" character to get the date part
  const formattedDate = isoString.split("T")[0];
  return formattedDate;
};

export const getProductAdditionalInfo = (obj) => {
  let desc = "";
  if (obj) {
    for (const key in obj) {
      if (key === "height") {
        desc += `<br/>Height : ${obj[key]} (Feet)`;
      }
      if (key === "weight") {
        desc += `<br/>Weight : ${obj[key]} (KG)`;
      }
      if (key === "woodType") {
        desc += `<br/>Wood Type : ${obj[key]}`;
      }
    }
  }
  return desc;
};

export const getAddress = (obj) => {
  let _address;
  if (obj) {
    _address = `
        Phone: ${obj.phone}<br/>
        Address: ${obj.address}<br/>
        City: ${obj.city}<br/>
        Notes: ${obj.notes}<br/>
        State: ${obj.state}<br/>
        Country: ${obj.country}<br/>
        Pincode: ${obj.pincode}<br/>
      `;
  }
  return _address;
};

export const getProductAdditionalInfoForInvoice = (doc, obj, x) => {
  doc.moveUp();
  if (obj) {
    for (const key in obj) {
      if (key === "height") {
        doc.text(`Height : ${getConstant(obj[key])} (Feet)`, x, doc.y);
      }
      if (key === "weight") {
        doc.text(`Weight : ${getConstant(obj[key])} (KG)`, x, doc.y);
      }
      if (key === "woodType") {
        doc.text(`Wood Type : ${getConstant(obj[key])}`, x, doc.y);
      }
    }
  }
};

export const generateOTP = () => {
  const minNumber = 100000;
  const maxNumber = 999999;

  return Math.floor(Math.random() * (maxNumber - minNumber)) + minNumber; // 6 digit otp
};
