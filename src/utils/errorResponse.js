const errorResposne = ({
  res,
  statusCode = 500,
  message = "Something went wrong!",
  ...rest
}) => {
  res.status(statusCode).json({
    success: false,
    message: message,
    ...rest,
  });
};

export default errorResposne;
