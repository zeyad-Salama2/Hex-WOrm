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
            // Checking if a user with the same email exists
            const existingUser = await prisma.user.findFirst({
                where:
                {email:_email,}
            })
            // If a user doesn't exist with the given email address, then create new user
            if(existingUser === null) {
                const createdUser = await prisma.user.create({
                    data: {
                        name: _name,
                        email:_email,
                        passwordHash: _password,
                    }
                })
                return createdUser;
            } else {
                // If a user does exist with the given email, then throws an error
                throw new CustomAPIError("Email is already in use, please try again", 401);
            }
        } catch(err) {
            console.log(err);
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