const errorResposne = ({
  res,
  statusCode = 500,
  message = "Some error occured!",
  ...rest
}) => {
  res.status(statusCode).json({
    success: false,
    message: message,
    ...rest,
  });
};

export default errorResposne;
