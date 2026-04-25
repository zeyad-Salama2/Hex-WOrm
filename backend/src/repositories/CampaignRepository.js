const prisma = require("../../prisma/prisma");
const crypto = require("crypto");

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
    const targets = Array.isArray(data.targets) ? data.targets : [];

    const result = await prisma.campaign.create({
      data: {
        name: data.name,
        status: data.status,
        scheduledAt: data.scheduledAt ?? null,
        createdBy: {
          connect: { id: data.createdById },
        },
        targets: {
          create: targets.map((email) => ({
            email,
            token: crypto.randomBytes(24).toString("hex"),
          })),
        },
      },
      include: detailInclude,
    });

    return result;
  }

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

  async getByIdForUser(id, userId) {
    return prisma.campaign.findFirst({
      where: {
        id,
        createdById: userId,
      },
      include: detailInclude,
    });
  }

  async update(id, data) {
    const updated = await prisma.campaign.update({
      where: { id },
      data,
      include: baseInclude,
    });

    return updated;
  }

  async delete(id) {
    return prisma.campaign.delete({
      where: { id },
    });
  }

  async getTargetByToken(token) {
    return prisma.target.findUnique({
      where: { token },
      include: {
        campaign: true,
      },
    });
  }

  async createEvent({ type, campaignId, targetId }) {
    return prisma.event.create({
      data: {
        type,
        campaignId,
        targetId,
      },
    });
  }

  async getDashboardStatsForUser(userId) {
    const campaigns = await prisma.campaign.findMany({
      where: {
        createdById: userId,
      },
      include: {
        targets: true,
        events: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    const totalCampaigns = campaigns.length;
    const totalEmailsSent = campaigns.reduce((sum, c) => sum + c.targets.length, 0);
    const totalOpens = campaigns.reduce(
      (sum, c) => sum + c.events.filter((e) => e.type === "OPEN").length,
      0
    );
    const totalClicks = campaigns.reduce(
      (sum, c) => sum + c.events.filter((e) => e.type === "CLICK").length,
      0
    );
    const totalSubmits = campaigns.reduce(
      (sum, c) => sum + c.events.filter((e) => e.type === "SUBMIT").length,
      0
    );

    return {
      totalCampaigns,
      totalEmailsSent,
      totalOpens,
      totalClicks,
      totalSubmits,
      openRate: totalEmailsSent ? ((totalOpens / totalEmailsSent) * 100).toFixed(1) : "0.0",
      clickRate: totalEmailsSent ? ((totalClicks / totalEmailsSent) * 100).toFixed(1) : "0.0",
      submitRate: totalEmailsSent ? ((totalSubmits / totalEmailsSent) * 100).toFixed(1) : "0.0",
      recentCampaigns: campaigns.slice(0, 5),
    };
  }
}

module.exports = { CampaignRepository };
