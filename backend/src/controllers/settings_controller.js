const bcrypt = require("bcrypt");
const { StatusCodes } = require("http-status-codes");
const { BadRequestError, CustomAPIError } = require("../errors");
const { UserRepository } = require("../repositories/UserRepository");

const userRepo = new UserRepository();
const MIN_PASSWORD_LENGTH = 6;

const validatePasswordChangeInput = ({ currentPassword, newPassword, confirmNewPassword }) => {
    if (!currentPassword || !newPassword || !confirmNewPassword) {
        throw new BadRequestError("Current password, new password, and confirm new password are required.");
    }

    if (newPassword.length < MIN_PASSWORD_LENGTH) {
        throw new BadRequestError(`New password must be at least ${MIN_PASSWORD_LENGTH} characters.`);
    }

    if (newPassword !== confirmNewPassword) {
        throw new BadRequestError("New password and confirm new password must match.");
    }

    if (newPassword === currentPassword) {
        throw new BadRequestError("New password must be different from your current password.");
    }
};

const changePassword = async (req, res, next) => {
    const userId = req.user?.id;
    const { currentPassword, newPassword, confirmNewPassword } = req.body || {};

    if (!userId) {
        return next(new CustomAPIError("User authentication is required.", StatusCodes.UNAUTHORIZED));
    }

    try {
        validatePasswordChangeInput({ currentPassword, newPassword, confirmNewPassword });

        const foundUser = await userRepo.getById(userId);
        if (!foundUser) {
            return next(new CustomAPIError("User not found.", StatusCodes.NOT_FOUND));
        }

        const passwordMatches = await bcrypt.compare(currentPassword, foundUser.passwordHash);
        if (!passwordMatches) {
            return next(new CustomAPIError("Current password is incorrect.", StatusCodes.UNAUTHORIZED));
        }

        const nextPasswordHash = await bcrypt.hash(newPassword, 10);
        await userRepo.updatePasswordHash(userId, nextPasswordHash);

        return res.status(StatusCodes.OK).json({
            message: "Password updated successfully.",
        });
    } catch (error) {
        return next(error);
    }
};

module.exports = {
    changePassword,
};
