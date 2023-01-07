import { Request, Response, NextFunction } from 'express';
import mongoose from 'mongoose';
import { ErrorCode } from '../error-handler/error-code';
import { ErrorException } from '../error-handler/error-exception';
import {verifyToken} from "../services/jwtService";
import {UserModel} from "../models/User";

const TOKEN_START_INDEX = 7;

export const checkAuthMiddleware = (withAccessControl: boolean = false) => {
    return async (req: Request, res: Response, next: NextFunction): Promise<any> => {
        const auth = req.headers.authorization;

        if (auth && auth.startsWith('Bearer')) {

            const token = auth.slice(TOKEN_START_INDEX);

            try {
                const tokenPayload = verifyToken(token);
                const { _id } = tokenPayload;

                const userExists = await UserModel.findOne({
                    _id: new mongoose.Types.ObjectId(_id),
                });

                if (!userExists) {
                    return next(new ErrorException(ErrorCode.Unauthenticated));
                }

                if (userExists.status === 'blocked') {
                    return next(new ErrorException(ErrorCode.Blocked));
                }

                if (withAccessControl && userExists.access === 'basic') {
                    return next(new ErrorException(ErrorCode.NotAllowed));
                }

                req.body.tokenPayload = tokenPayload;

                next();
            } catch (error) {
                return next(new ErrorException(ErrorCode.Unauthenticated));
            }
        } else {
            return next(new ErrorException(ErrorCode.Unauthenticated));
        }
    };
};