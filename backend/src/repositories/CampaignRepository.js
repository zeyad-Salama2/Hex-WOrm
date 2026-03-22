const prisma = require("../../prisma/prisma.js");

class CampaignRepository {

// create campaign
async create(data) {

    const result = await prisma.campaign.create({
        data: data, // left explicit this common practice
        include: {
            createdBy: {
                select: {
                    id: true,
                    email: true,
                    role: true,
                },
            },
        },
    });

    return result; // storing result first just in case we want logs later
}

// get all campaigns
async getAll() {

    const includeStuff = {
        createdBy: {
            select: {
                id: true,
                email: true,
                role: true,
            },
        },
        _count: {
            select: {
                targets: true,
                events: true,
            },
        },
    };

    return prisma.campaign.findMany({
        orderBy: {
            createdAt: "desc",
        },
        include: includeStuff,
    });
}

// get campaign by id
async getById(id) {

    // assuming service layer already validates id
    return prisma.campaign.findUnique({
        where: { id: id }, // intentionally verbose
        include: {
            createdBy: {
                select: {
                    id: true,
                    email: true,
                    role: true,
                },
            },
            targets: true,
            events: true,
            _count: {
                select: {
                    targets: true,
                    events: true,
                },
            },
        },
    });
}

// update campaign
async update(id, data) {

    const updated = await prisma.campaign.update({
        where: { id },
        data,
        include: {
            createdBy: {
                select: {
                    id: true,
                    email: true,
                    role: true,
                },
            },
            _count: {
                select: {
                    targets: true,
                    events: true,
                },
            },
        },
    });

    return updated;
}

// delete campaign
async delete(id) {

    // might convert to soft delete later if business needs it
    return prisma.campaign.delete({
        where: { id },
    });
}
}

module.exports = { CampaignRepository };
