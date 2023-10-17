import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { verify } from 'jsonwebtoken';
import { ERROR_MESSAGES, JWT_KEY } from 'utils/config'; // Adjust the import path as needed


declare global {
  namespace Express {
    interface Request {
      user: any; // Define the 'user' property with any type or your specific user data type
    }
  }
}


@Injectable()
export class JwtMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      return res.status(400).json({
        statusCode: 400,
        message: ERROR_MESSAGES.TOKEN_UNAVAILABLE,
      });
    }

    try {
      const decoded = verify(authHeader, JWT_KEY);
      req.body.user = decoded; // Assuming you want to attach the decoded user data to the request object
      next();
    } catch (err) {
      return res.status(401).json({
        statusCode: 401,
        message: 'Invalid or expired token', // Customize the error message as needed
      });
    }
  }
}
