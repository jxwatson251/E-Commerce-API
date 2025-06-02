import { Request, Response, NextFunction } from 'express';
import { ObjectSchema } from 'joi';

export const validateBody = (schema: ObjectSchema) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const { error } = schema.validate(req.body, { abortEarly: false });
    if (error) {
      const messages = error.details.map((detail) => detail.message);
      res.status(400).json({ status: 'fail', errors: messages });
    } else {
      next();
    }
  };
}