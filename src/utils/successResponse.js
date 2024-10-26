const successResposne = ({
  res,
  statusCode = 200,
  message = "Request triggered successfully!",
  data = "",
  ...rest
}) => {
  res.status(statusCode).json({
    success: true,
    message: message,
    data: data,
    ...rest,
  });
};

export default successResposne;
