import {NextFunction, Request, Response} from 'express';
import {AuthMiddlewareBodyType} from '../types/AuthTypes';
import {
    DeleteUsersRequestBodyType,
    GetAllUsersRequestQueryType,
    GetAllUsersResponseBodyType, UpdateUsersRequestBodyType,
    UpdateUsersResponseBodyType
} from "../types/UsersType";
import {UserModel} from "../models/User";
import {ErrorCode} from "../error-handler/error-code";
import {ErrorException} from "../error-handler/error-exception";
import {STATUS_CODES} from "../enum/statusCodes";


const DEFAULT_PAGE_LIMIT = 5;

export const getUsers = async (
    req: Request<{}, {}, AuthMiddlewareBodyType, GetAllUsersRequestQueryType>,
    res: Response<GetAllUsersResponseBodyType>,
    next: NextFunction,
) => {
    try {

        let {page = 1, limit = DEFAULT_PAGE_LIMIT} = req.query;

        page = Number(page);
        limit = Number(limit);

        const users = await UserModel.find()
            .limit(limit)
            .skip((page - 1) * limit)
            .exec();

        const count = await UserModel.countDocuments();

        const mappedUsers = users.map(({_id, name, email, status, access}) => ({
            id: _id.toString(),
            name,
            email,
            status,
            access,
        }));

        res.send({users: mappedUsers, count});
    } catch (error) {
        return next(new ErrorException(ErrorCode.UnknownError, { error}));
    }
}

export const updateUsers = async (
    req: Request<{}, {}, UpdateUsersRequestBodyType>,
    res: Response<UpdateUsersResponseBodyType>,
    next: NextFunction,
) => {
    try {
        const {userIds, update} = req.body;

        await UserModel.updateMany({_id: {$in: userIds}}, {$set: update});
        const changedUsers = await UserModel.find({_id: {$in: userIds}});

        const users = changedUsers.map(({_id, name, email, status, access}) => ({
            id: _id.toString(),
            name,
            email,
            status,
            access,
        }));

        res.send({users});
    } catch (error) {
        return next(new ErrorException(ErrorCode.UnknownError, {error}));
    }
}

export const deleteUsers = async (
    req: Request<{}, {}, DeleteUsersRequestBodyType>,
    res: Response,
    next: NextFunction,
) => {
    try {
        await UserModel.deleteMany({_id: {$in: req.body.userIds}});

        res.status(STATUS_CODES.OK).end();
    } catch (error) {
        return next(new ErrorException(ErrorCode.UnknownError, {error}));
    }
}

export const getUserName = async (
    req: Request<{ id: string }>,
    res: Response<{ name: string }>,
    next: NextFunction,
) => {
    try {
        const {id} = req.params;
        const userDb = await UserModel.findOne({_id: id});

        if (!userDb) return next(new ErrorException(ErrorCode.NotFound));
        res.send({name: userDb.name});
    } catch (error) {
        return next(new ErrorException(ErrorCode.UnknownError, {error}));
    }
}
