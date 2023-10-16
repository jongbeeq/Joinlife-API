const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken')
const createError = require('../utils/create-error');
const prisma = require('../models/prisma')
const { registerSchema, loginSchema } = require('../validators/auth-user-validators')


exports.register = async (req, res, next) => {
    try {
        const { value, error } = registerSchema.validate(req.body)

        if (error) {
            return next(error)
        }
        value.password = await bcrypt.hash(value.password, 12);
        console.log(value.birthDate)
        if (value.birthDate) {
            value.birthDate = value.birthDate + "T00:00:00Z"
        }
        console.log(value.birthDate)
        const user = await prisma.user.create({
            data: value
        })
        const payload = { userId: user.id };
        const accessToken = jwt.sign(
            payload,
            process.env.JWT_SECRET_KEY || '1q2w3e4r5t6y7u8i9o0p',
            {
                expiresIn: process.env.JWT_EXPIRE
            }
        );

        delete user.password
        res.status(201).json({ accessToken, user })
    } catch (err) {
        next(err)
    }
}

exports.login = async (req, res, next) => {
    try {
        const { value, error } = loginSchema.validate(req.body);
        if (error) {
            const messageError = error.details.reduce((acc, el) => {
                const { message, path } = el
                acc[path[0]] = message
                return acc
            }, {})

            return next(createError(messageError, 400));
        }
        const user = await prisma.user.findFirst({
            where: {
                username: value.username
            }
        });
        const messageError = {
            username: "",
            password: ""
        }
        if (!user) {
            messageError.username = 'Username is not found in system'
            console.log(messageError)
            return next(createError(messageError, 400));
        }

        const isMatch = await bcrypt.compare(value.password, user.password);
        if (!isMatch) {
            messageError.password = 'Password is invalid'
            // console.log(messageError)
            return next(createError(messageError, 400));
        }

        const payload = { userId: user.id };
        const accessToken = jwt.sign(
            payload,
            process.env.JWT_SECRET_KEY || 'sadasdwjongbeeqdqwdscwqq',
            {
                expiresIn: process.env.JWT_EXPIRE
            }
        );
        delete user.password;
        res.status(200).json({ accessToken, user });
    } catch (err) {
        next(err);
    }
};

exports.getMe = async (req, res, next) => {
    res.status(200).json({ user: req.user });
};