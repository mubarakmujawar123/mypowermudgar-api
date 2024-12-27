import axios from "axios";

const generateAccessToken = async () => {
  const response = await axios({
    url: process.env.PAYPAL_BASE_URL + "/v1/oauth2/token",
    method: "post",
    data: "grant_type=client_credentials",
    auth: {
      username: process.env.PAYPAL_CLIENT_ID,
      password: process.env.PAYPAL_SECRET,
    },
  });
  return response.data.access_token;
};

export const createOrderPayPal = async (cartItems, totalAmountDetails) => {
  try {
    const accessToken = await generateAccessToken();
    const response = await axios({
      url: process.env.PAYPAL_BASE_URL + "/v2/checkout/orders",
      method: "post",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + accessToken,
      },
      data: JSON.stringify({
        intent: "CAPTURE",
        purchase_units: [
          {
            items: cartItems,
            amount: totalAmountDetails,
          },
        ],

        application_context: {
          return_url: process.env.BASE_URL + "/shop/capture-payment",
          cancel_url: process.env.BASE_URL + "/shop/cancel-payment",
          shipping_preference: "NO_SHIPPING",
          user_action: "PAY_NOW",
          brand_name: "myMudger.com",
        },
      }),
    });
    return {
      status: "success",
      data: response.data,
    };
  } catch (e) {
    console.log(e);
    return { status: "error", data: "" };
  }
};

export const capturePaymentPaypal = async (paymentId) => {
  try {
    const accessToken = await generateAccessToken();
    const response = await axios({
      url:
        process.env.PAYPAL_BASE_URL +
        `/v2/checkout/orders/${paymentId}/capture`,
      method: "post",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + accessToken,
      },
    });

    return {
      status: "success",
      data: response.data,
    };
  } catch (e) {
    console.log(e);
    return { status: "error", data: "" };
  }
};
