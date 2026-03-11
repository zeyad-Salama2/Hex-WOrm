const { StatusCodes } = require("http-status-codes");
const { BadRequestError, CustomAPIError } = require("../errors");
const { CampaignRepository } = require("../repositories/CampaignRepository");

const campaignRepo = new CampaignRepository();

// create campaign
const createCampaign = async (req, res, next) => {
const { name, status, scheduledAt } = req.body;

// keeping this simple for now
if (!name) {
    return next(new BadRequestError("Campaign name is required."));
}

try {
    const payload = {
        name: name,
        status: status || "DRAFT",
        scheduledAt: scheduledAt ? new Date(scheduledAt) : null,
        createdById: req.user.id,
    };

    const campaign = await campaignRepo.create(payload);

    return res.status(StatusCodes.CREATED).json({
        campaign,
    });
} catch (err) {
    // might want better logging here later
    return next(err);
}
};

// list all campaigns
const getAllCampaigns = async (req, res, next) => {
try {
const campaigns = await campaignRepo.getAll();

    return res.status(StatusCodes.OK).json({
        campaigns: campaigns,
    });
} catch (error) {
    return next(error);
}

};

// get one campaign
const getCampaignById = async (req, res, next) => {
const campaignId = Number(req.params.id);

if (Number.isNaN(campaignId)) {
    return next(new BadRequestError("Campaign id must be a number."));
}

try {
    const campaign = await campaignRepo.getById(campaignId);

    if (!campaign) {
        return next(new CustomAPIError("Campaign not found.", StatusCodes.NOT_FOUND));
    }

    return res.status(StatusCodes.OK).json({ campaign: campaign });
} catch (error) {
    return next(error);
}

};

// update campaign
const updateCampaign = async (req, res, next) => {
const campaignId = Number(req.params.id);
const { name, status, scheduledAt } = req.body;

if (Number.isNaN(campaignId)) {
    return next(new BadRequestError("Campaign id must be a number."));
}

if (!name && !status && scheduledAt === undefined) {
    return next(
        new BadRequestError("Provide at least one field to update: name, status, or scheduledAt.")
    );
}

const updateData = {};

if (name) {
    updateData.name = name;
}

if (status) {
    updateData.status = status;
}

if (scheduledAt !== undefined) {
    // empty-ish value clears the schedule, otherwise convert it
    updateData.scheduledAt = scheduledAt ? new Date(scheduledAt) : null;
}

try {
    const foundCampaign = await campaignRepo.getById(campaignId);

    if (!foundCampaign) {
        return next(new CustomAPIError("Campaign not found.", StatusCodes.NOT_FOUND));
    }

    const updatedCampaign = await campaignRepo.update(campaignId, updateData);

    return res.status(StatusCodes.OK).json({
        campaign: updatedCampaign,
    });
} catch (err) {
    return next(err);
}

};

// delete campaign
const deleteCampaign = async (req, res, next) => {
const campaignId = Number(req.params.id);

if (Number.isNaN(campaignId)) {
    return next(new BadRequestError("Campaign id must be a number."));
}

try {
    const campaign = await campaignRepo.getById(campaignId);

    if (!campaign) {
        return next(new CustomAPIError("Campaign not found.", StatusCodes.NOT_FOUND));
    }

    await campaignRepo.delete(campaignId);

    return res.status(StatusCodes.OK).json({
        msg: "Campaign deleted successfully.",
    });
} catch (error) {
    return next(error);
}

};

// exporting individually feels clearer to me here
module.exports = {
createCampaign,
getAllCampaigns,
getCampaignById,
updateCampaign,
deleteCampaign,
};

// old idea:
// module.exports.createCampaign = createCampaign;
// left this here mentally, but object export is cleaner enough.