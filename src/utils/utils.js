export const calculateItemPrice = (basePrice, quantity, productDescription) => {
  let finalPrice = basePrice * parseInt(quantity);

  let productWeight = productDescription.weight;
  if (productWeight) {
    if (productWeight.includes("-")) {
      productWeight = productWeight.split("-")?.[0];
    }

    finalPrice = finalPrice * parseInt(productWeight);
  }
  finalPrice = finalPrice.toFixed(2);
  return finalPrice;
};
