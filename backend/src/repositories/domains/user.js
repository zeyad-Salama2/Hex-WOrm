class User {
    id;
    name;
    email;
    passwordHash;
    role;
    createdAt;
    campaigns;

    constructor(_id, _name, _email, _passwordHash, _role, _createdAt, _campaigns) {
        this.id = _id;
        this.name = _name;
        this.email = _email;
        this.passwordHash = _passwordHash;
        this.role = _role;
        this.createdAt = _createdAt;
        this.campaigns = _campaigns;
    }

    getId() {
        return this.id;
    }
    getName() {
        return this.name;
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