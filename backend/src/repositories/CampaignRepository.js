const prisma = require("../../prisma/prisma");

const baseInclude = {
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

const detailInclude = {
    ...baseInclude,
    targets: true,
    events: true,
};

class CampaignRepository {
    async create(data) {
        const result = await prisma.campaign.create({
            data: {
                name: data.name,
                status: data.status,
                scheduledAt: data.scheduledAt ?? null,
                createdBy: {
                    connect: { id: data.createdById },
                },
            },
            include: baseInclude,
        });

        return result;
    }


// get all campaigns
async getAllByUserId(userId) {
    return prisma.campaign.findMany({
        where: {
            createdById: userId,
        },
        orderBy: {
            createdAt: "desc",
        },
        include: baseInclude,
    });
}

// get campaign by id
async getByIdForUser(id, userId) {
    return prisma.campaign.findFirst({
        where: {
            id,
            createdById: userId,
        },
        include: detailInclude,
    });
}

// update campaign
async update(id, data) {

        const updated = await prisma.campaign.update({
            where: { id },
            data,
            include: baseInclude,
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
