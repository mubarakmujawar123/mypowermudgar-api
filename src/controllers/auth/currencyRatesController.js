import successResposne from "../../utils/successResponse.js";
import errorResposne from "../../utils/errorResponse.js";
import CurrencyRates from "../../models/CurrencyRates.js";

export const setCurrencyRates = async (req, res) => {
  try {
    const { rates } = req.body;
    console.log("Rates", rates);

    if (!rates) {
      return errorResposne({
        res,
        statusCode: 400,
        message: "Currency rates are required!",
      });
    }

    await CurrencyRates.findOneAndUpdate(
      {},
      { rates: rates },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );
    successResposne({
      res,
      statusCode: 200,
      message: "Currencies has been updated!",
    });
  } catch (e) {
    console.log(e);
    errorResposne({ res, statusCode: 500, message: "Something went wrong!" });
  }
};

export const getCurrencyRates = async (req, res) => {
  try {
    const currencyRatesInfo = await CurrencyRates.find({});
    if (!currencyRatesInfo) {
      return errorResposne({
        res,
        statusCode: 400,
        message: "Facing issue to get curreny rates!",
      });
    }
    successResposne({
      res,
      statusCode: 200,
      data: currencyRatesInfo[0],
      message: "Curreny rates fechted successfully!",
    });
  } catch (e) {
    console.log(e);
    errorResposne({ res, statusCode: 500, message: "Something went wrong!" });
  }
};
