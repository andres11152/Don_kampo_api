// Middleware de validación de ID
const validateId = [
    check('id').isUUID().withMessage('El ID debe ser un UUID válido'),
    (req, res, next) => {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }
      next();
    }
  ];
  