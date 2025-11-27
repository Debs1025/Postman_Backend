const Joi = require('joi');

const adjustSchema = Joi.object({
  success: Joi.boolean().required(),
});

function validate(schema) {
  return (req, res, next) => {
    const { error, value } = schema.validate(req.body, { abortEarly: true, stripUnknown: true, convert: true });
    if (error) return res.status(400).json({ message: error.details[0].message });
    req.body = value; 
    next();
  };
}

module.exports = { validateAdjust: validate(adjustSchema) };