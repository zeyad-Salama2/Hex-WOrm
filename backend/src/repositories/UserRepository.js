const prisma = require("../../prisma/prisma.js");
const { CustomAPIError } = require("../errors")
const { StatusCodes } = require("http-status-codes")

// Using the repository design pattern
// Any issues with this design then please bring it up in the appropriate channel and we can discuss alternatives

class UserRepository {
    async getAll() {
        const allUsers = await prisma.user.findMany();
        return allUsers;
    }
    async getById(_id) {
        const foundUser = await prisma.user.findUnique({
            where: {id:_id},
        });
        return foundUser;
    }
    async getByEmail(_email) {
        const foundUser = await prisma.user.findUnique({
            where: {email:_email},
        });
        if(foundUser) return foundUser
        return null;
    }
    async create(_name,_email,_password) {
        try {
            // Let the database unique index enforce duplicate-email checks.
            const createdUser = await prisma.user.create({
                data: {
                    name: _name,
                    email:_email,
                    passwordHash: _password,
                }
            })
            return createdUser;
        } catch(err) {
            console.error("[UserRepository.create] prisma.user.create failed:", err);
            // Prisma unique constraint violation on User.email
            if (err?.code === "P2002") {
                throw new CustomAPIError("Email is already in use, please try again", StatusCodes.CONFLICT);
            }

            // Database connectivity issues (host unreachable / blocked / refused)
            if (
                err?.code === "P1001" ||
                err?.code === "EACCES" ||
                err?.code === "ECONNREFUSED" ||
                err?.code === "ETIMEDOUT"
            ) {
                throw new CustomAPIError("Database connection failed. Please verify DATABASE_URL and database network access.", StatusCodes.SERVICE_UNAVAILABLE);
            }

            throw err;
        }
    }
    async update(_id) {
        throw new CustomAPIError("Method not implemented", StatusCodes.INTERNAL_SERVER_ERROR);
    }
    async delete(_id) {
        throw new CustomAPIError("Method not implemented", StatusCodes.INTERNAL_SERVER_ERROR);
    }
}

class InMemoryUserRepository extends UserRepository {
    constructor() {
        super();
        this.Users = [];
    }

    addUser(User) {
        this.Users.push(User);
    }

    getById(_id) {
        for(const User of this.Users) {
            if(User.id === _id) {
                return User;
            }
        }
        return null;
    }

    updateUser(updatedUser) {
        console.log("Update User here");
    }

    deleteUser(_id) {
        console.log("Delete User here");
    }
}

module.exports = {UserRepository, InMemoryUserRepository};
