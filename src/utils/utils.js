export const calculateItemPrice = (
  basePrice,
  quantity,
  productAdditionalInfo
) => {
  let finalPrice = Number(basePrice) * Number(quantity);

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

export const convertPrice = (price, currancyRate) => {
  let calculatePrice = price;
  if (currancyRate) {
    calculatePrice = Number(price) * Number(currancyRate);
  }
  return Number(calculatePrice).toFixed(2);
};
