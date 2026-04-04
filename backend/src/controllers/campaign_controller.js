const { StatusCodes } = require("http-status-codes");
const { BadRequestError, CustomAPIError } = require("../errors");
<<<<<<< HEAD
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
=======

// create campaign
const { CampaignRepository } = require("../repositories/CampaignRepository");
const { sendEmail } = require("../services/email_service");

const campaignRepo = new CampaignRepository();

const createCampaign = async (req, res, next) => {
    try {
        const { name, status, scheduledAt, targets } = req.body;

        const userId = req.user?.id;
        if (!userId) {
            return res.status(401).json({ message: "User authentication is required." });
        }

        const parsedTargets = Array.isArray(targets)
            ? targets.map((email) => String(email).trim()).filter(Boolean)
            : [];

        const campaign = await campaignRepo.create({
            name,
            status,
            scheduledAt,
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
>>>>>>> origin/email-feature
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

<<<<<<< HEAD
// exporting individually feels clearer to me here
module.exports = {
createCampaign,
getAllCampaigns,
getCampaignById,
updateCampaign,
deleteCampaign,
};

=======
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
>>>>>>> origin/email-feature
// old idea:
// module.exports.createCampaign = createCampaign;
// left this here mentally, but object export is cleaner enough.