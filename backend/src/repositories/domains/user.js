class User {
    id;
    email;
    passwordHash;
    role;
    createdAt;
    campaigns;

    constructor(_id, _email, _passwordHash, _role, _createdAt, _campaigns) {
        this.id = _id;
        this.email = _email;
        this.passwordHash = _passwordHash;
        this.role = _role;
        this.createdAt = _createdAt;
        this.campaigns = _campaigns;
    }

    getId() {
        return this.id;
    }
    getEmail() {
        return this.email;
    }
    getPasswordHash() {
        return this.passwordHash;
    }
    getRole() {
        return this.role;
    }
    getCreatedAt() {
        return this.createdAt;
    }
    getCampaigns() {
        return this.campaigns;
    }
}

module.export = User;
