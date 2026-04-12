const { StatusCodes } = require("http-status-codes");
const { BadRequestError, CustomAPIError } = require("../errors");

// create campaign
const { CampaignRepository } = require("../repositories/CampaignRepository");
const { sendEmail } = require("../services/email_service");

const campaignRepo = new CampaignRepository();
const MAX_SCHEDULE_YEARS_AHEAD = 50;

const requireAuthenticatedUserId = (req) => {
    const userId = req.user?.id;

    if (!userId) {
        throw new CustomAPIError("User authentication is required.", StatusCodes.UNAUTHORIZED);
    }

    return userId;
};

const getScheduleUpperBound = (now = new Date()) => {
    const upperBound = new Date(now);
    upperBound.setFullYear(upperBound.getFullYear() + MAX_SCHEDULE_YEARS_AHEAD);
    return upperBound;
};

const parseScheduledAt = (scheduledAt, { allowNull = true, required = false } = {}) => {
    if (scheduledAt === undefined) {
        if (required) {
            throw new BadRequestError("A scheduled campaign needs a scheduled date and time.");
        }

        return undefined;
    }

    if (scheduledAt === null || scheduledAt === "") {
        if (required) {
            throw new BadRequestError("A scheduled campaign needs a scheduled date and time.");
        }

        return allowNull ? null : undefined;
    }

    const parsedDate = new Date(scheduledAt);
    if (Number.isNaN(parsedDate.getTime())) {
        throw new BadRequestError("Please enter a valid scheduled date and time.");
    }

    const now = new Date();
    if (parsedDate < now) {
        throw new BadRequestError("Scheduled date and time cannot be in the past.");
    }

    if (parsedDate > getScheduleUpperBound(now)) {
        throw new BadRequestError(`Scheduled date and time must be within ${MAX_SCHEDULE_YEARS_AHEAD} years from now.`);
    }

    return parsedDate;
};

const createCampaign = async (req, res, next) => {
    try {
        const { name, status, scheduledAt, targets } = req.body;
        const userId = requireAuthenticatedUserId(req);
        const parsedScheduledAt = parseScheduledAt(scheduledAt, {
            required: status === "SCHEDULED",
        });

        const parsedTargets = Array.isArray(targets)
            ? targets.map((email) => String(email).trim()).filter(Boolean)
            : [];

        const campaign = await campaignRepo.create({
            name,
            status,
            scheduledAt: parsedScheduledAt ?? null,
            createdById: userId,
        });

        if (status === "SENT" && parsedTargets.length > 0) {
            for (const email of parsedTargets) {
                const result = await sendEmail({
                    to: email,
                    subject: `Phishing Simulation: ${name}`,
                    text: "This is a phishing simulation email.",
                    html: `<h2>${name}</h2><p>This is a phishing simulation email.</p>`,
                });

                console.log(`Sent to ${email}:`, result.previewUrl);
            }
        }

        res.status(201).json({ campaign });
    } catch (err) {
        console.error("[createCampaign] failed:", err);
        next(err);
    }
};

// list all campaigns
const getAllCampaigns = async (req, res, next) => {
try {
const userId = requireAuthenticatedUserId(req);
const campaigns = await campaignRepo.getAllByUserId(userId);

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
    const userId = requireAuthenticatedUserId(req);
    const campaign = await campaignRepo.getByIdForUser(campaignId, userId);

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

try {
    const userId = requireAuthenticatedUserId(req);
    const foundCampaign = await campaignRepo.getByIdForUser(campaignId, userId);

    if (!foundCampaign) {
        return next(new CustomAPIError("Campaign not found.", StatusCodes.NOT_FOUND));
    }

    if (status === "SCHEDULED" && scheduledAt === undefined && !foundCampaign.scheduledAt) {
        return next(new BadRequestError("A scheduled campaign needs a scheduled date and time."));
    }

    if (scheduledAt !== undefined) {
        updateData.scheduledAt = parseScheduledAt(scheduledAt, {
            required: status === "SCHEDULED",
        });
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
    const userId = requireAuthenticatedUserId(req);
    const campaign = await campaignRepo.getByIdForUser(campaignId, userId);

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

// handler for sending a quick test email — its purpose is for debugging stuff
const sendTestEmail = async (req, res, next) => {
try {
    // grabbing 'to' from request body
    const { to } = req.body || {}; // added fallback just in case body is undefined

        // basic validation (probably should be more strict but this works for now)
        if (!to) {
            return res.status(400).json({
                message: "Recipient email is required."
            });
        }

        // could add more fields here later (cc, bcc, etc.), leaving it simple for now since its only for debugging
        const emailPayload = {
            to: to,
            subject: "Phishing Simulation Test",
            text: "This is a test phishing simulation email.",
            html: "<h2>This is a test phishing simulation email</h2>"
        };

        // actually sending email
        const result = await sendEmail(emailPayload);

        // slight redundancy here but makes response clearer imo
        const responseData = {
            message: "Email generated successfully",
            messageId: result.messageId,
            previewUrl: result.previewUrl
        };

        return res.status(200).json(responseData);

    } catch (err) {
        // logging with a tag so I can find it easier in logs later
        console.error("[sendTestEmail] failed:", err);

        // might want custom error handling middleware later
        next(err);
    }

    };

// exporting individually feels clearer to me here
module.exports = {
    createCampaign,
    getAllCampaigns,
    getCampaignById,
    updateCampaign,
    deleteCampaign,
    sendTestEmail,
};
// old idea:
// module.exports.createCampaign = createCampaign;
// left this here mentally, but object export is cleaner enough.
