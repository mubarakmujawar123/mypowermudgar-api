import Product from "../../models/Product.js";
import errorResposne from "../../utils/errorResponse.js";
import successResposne from "../../utils/successResponse.js";

export const fetchFilteredProducts = async (req, res) => {
  const { category = [] } = req.query;
  let filters = {};
  const _category = category === "all-products" ? "" : category;
  if (_category.length) {
    filters.category = { $in: _category.split(",") };
  }

  try {
    const productList = await Product.find(filters);
    return successResposne({
      res,
      statusCode: 200,
      data: productList,
      message: "Products fetched successfully!",
    });
  } catch (e) {
    console.log(e);
    errorResposne({ res, statusCode: 500, message: "Something went wrong!" });
  }
};
