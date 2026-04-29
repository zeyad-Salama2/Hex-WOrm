const { StatusCodes } = require("http-status-codes");
const { BadRequestError, CustomAPIError } = require("../errors");
const { CampaignRepository } = require("../repositories/CampaignRepository");
const { sendEmail, DEFAULT_EMAIL_TIMEOUT_MS } = require("../services/email_service");

const campaignRepo = new CampaignRepository();
const MAX_SCHEDULE_YEARS_AHEAD = 50;

const normalizeBaseUrl = (value) => {
  if (!value || typeof value !== "string") {
    return "";
  }

  const trimmed = value.trim();
  if (!trimmed) {
    return "";
  }

  if (/^https?:\/\//i.test(trimmed)) {
    return trimmed.replace(/\/$/, "");
  }

  return `https://${trimmed.replace(/\/$/, "")}`;
};

const getRailwayPublicUrl = () => normalizeBaseUrl(process.env.RAILWAY_PUBLIC_DOMAIN);

const getBackendBaseUrl = () =>
  normalizeBaseUrl(process.env.APP_URL) ||
  normalizeBaseUrl(process.env.BACKEND_URL) ||
  getRailwayPublicUrl() ||
  `http://localhost:${process.env.APP_PORT || process.env.PORT || 4000}`;

const getFrontendBaseUrl = () =>
  normalizeBaseUrl(process.env.FRONTEND_URL) ||
  normalizeBaseUrl(process.env.NEXT_PUBLIC_APP_URL) ||
  normalizeBaseUrl(process.env.PUBLIC_FRONTEND_URL) ||
  "http://localhost:3000";

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
    throw new BadRequestError(
      `Scheduled date and time must be within ${MAX_SCHEDULE_YEARS_AHEAD} years from now.`
    );
  }

  return parsedDate;
};

const parseTargets = (targets) => {
  if (!Array.isArray(targets)) {
    return [];
  }

  return Array.from(
    new Set(targets.map((email) => String(email).trim()).filter(Boolean))
  );
};

const buildCampaignEmailLinks = (target) => {
  const backendBaseUrl = getBackendBaseUrl();
  const frontendBaseUrl = getFrontendBaseUrl();

  return {
    openUrl: `${backendBaseUrl}/track/open?token=${target.token}`,
    clickUrl: `${backendBaseUrl}/track/click?token=${target.token}&redirect=${encodeURIComponent(
      `${frontendBaseUrl}/landing?token=${target.token}`
    )}`,
  };
};

const summarizeEmailDelivery = (results) => {
  const attempted = results.length;
  const sent = results.filter((result) => result.status === "sent").length;
  const timedOut = results.filter((result) => result.status === "timed_out").length;
  const failed = results.filter((result) => result.status === "failed").length;

  let status = "sent";

  if (attempted === 0) {
    status = "skipped";
  } else if (sent === attempted) {
    status = "sent";
  } else if (timedOut > 0 && sent === 0 && failed === 0) {
    status = "timed_out";
  } else if (sent > 0) {
    status = "partial";
  } else {
    status = "failed";
  }

  return {
    status,
    attempted,
    sent,
    failed,
    timedOut,
    details: results,
  };
};

const buildEmailDeliveryMessage = (context, emailDelivery) => {
  switch (emailDelivery.status) {
    case "sent":
      return `${context} and all emails sent successfully.`;
    case "timed_out":
      return `${context}, but email sending timed out.`;
    case "partial":
      return `${context}, but some emails failed or timed out.`;
    case "failed":
      return `${context}, but email sending failed.`;
    default:
      return `${context} successfully.`;
  }
};

const sendCampaignEmails = async (campaign) => {
  if (!campaign.targets?.length) {
    return summarizeEmailDelivery([]);
  }

  const results = await Promise.all(
    campaign.targets.map(async (target) => {
      const { openUrl, clickUrl } = buildCampaignEmailLinks(target);

      console.log(
        `[campaign-email] send started campaign=${campaign.id} target=${target.email} timeoutMs=${DEFAULT_EMAIL_TIMEOUT_MS}`
      );

      try {
        const result = await sendEmail(
          {
            to: target.email,
            subject: `Phishing Simulation: ${campaign.name}`,
            text: `Please review this message: ${clickUrl}`,
            html: `
              <h2>${campaign.name}</h2>
              <p>This is a phishing simulation email.</p>
              <p>
                <a href="${clickUrl}">Review account</a>
              </p>
              <img src="${openUrl}" width="1" height="1" alt="" style="display:block;" />
            `,
          },
          { timeoutMs: DEFAULT_EMAIL_TIMEOUT_MS }
        );

        console.log(
          `[campaign-email] send success campaign=${campaign.id} target=${target.email} messageId=${result.messageId}`
        );

        return {
          email: target.email,
          status: "sent",
          messageId: result.messageId,
          previewUrl: result.previewUrl || null,
        };
      } catch (error) {
        const timedOut = error?.code === "EMAIL_TIMEOUT";
        const status = timedOut ? "timed_out" : "failed";
        const message = timedOut
          ? "Email sending timed out."
          : error instanceof Error
            ? error.message
            : "Email sending failed.";

        console.error(
          `[campaign-email] send ${status} campaign=${campaign.id} target=${target.email}:`,
          error
        );

        return {
          email: target.email,
          status,
          message,
        };
      }
    })
  );

  return summarizeEmailDelivery(results);
};

const createCampaign = async (req, res, next) => {
  try {
    const { name, status, scheduledAt, targets } = req.body;
    const userId = requireAuthenticatedUserId(req);
    const parsedScheduledAt = parseScheduledAt(scheduledAt, {
      required: status === "SCHEDULED",
    });
    const parsedTargets = parseTargets(targets);

    const campaign = await campaignRepo.create({
      name,
      status,
      scheduledAt: parsedScheduledAt ?? null,
      createdById: userId,
      targets: parsedTargets,
    });

    console.log(
      `[createCampaign] campaign created id=${campaign.id} status=${campaign.status} targetCount=${campaign.targets.length}`
    );

    const emailDelivery =
      status === "SENT" && campaign.targets.length > 0
        ? await sendCampaignEmails(campaign)
        : summarizeEmailDelivery([]);

    return res.status(StatusCodes.CREATED).json({
      campaign,
      message: buildEmailDeliveryMessage("Campaign created", emailDelivery),
      emailDelivery,
    });
  } catch (err) {
    console.error("[createCampaign] failed:", err);
    next(err);
  }
};

const getAllCampaigns = async (req, res, next) => {
  try {
    const userId = requireAuthenticatedUserId(req);
    const campaigns = await campaignRepo.getAllByUserId(userId);

    return res.status(StatusCodes.OK).json({
      campaigns,
    });
  } catch (error) {
    return next(error);
  }
};

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

    return res.status(StatusCodes.OK).json({ campaign });
  } catch (error) {
    return next(error);
  }
};

const updateCampaign = async (req, res, next) => {
  const campaignId = Number(req.params.id);
  const { name, status, scheduledAt, targets } = req.body;

  if (Number.isNaN(campaignId)) {
    return next(new BadRequestError("Campaign id must be a number."));
  }

  if (!name && !status && scheduledAt === undefined && targets === undefined) {
    return next(
      new BadRequestError("Provide at least one field to update: name, status, scheduledAt, or targets.")
    );
  }

  const updateData = {};
  const parsedTargets = targets === undefined ? undefined : parseTargets(targets);

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

    if (foundCampaign.status === "SENT" && status && status !== "SENT") {
      return next(
        new BadRequestError("Sent campaigns cannot be moved back to draft or scheduled.")
      );
    }

    if (foundCampaign.status === "SENT" && parsedTargets !== undefined) {
      return next(
        new BadRequestError("Targets cannot be edited after a campaign has been sent.")
      );
    }

    if (status === "SCHEDULED" && scheduledAt === undefined && !foundCampaign.scheduledAt) {
      return next(new BadRequestError("A scheduled campaign needs a scheduled date and time."));
    }

    if (scheduledAt !== undefined) {
      updateData.scheduledAt = parseScheduledAt(scheduledAt, {
        required: status === "SCHEDULED",
      });
    }

    if (parsedTargets !== undefined) {
      updateData.targets = parsedTargets;
    }

    const updatedCampaign = await campaignRepo.update(campaignId, updateData);
    console.log(
      `[updateCampaign] campaign saved id=${updatedCampaign.id} status=${updatedCampaign.status} targetCount=${updatedCampaign.targets?.length ?? 0}`
    );

    const transitionedToSent =
      foundCampaign.status !== "SENT" && updatedCampaign.status === "SENT";

    const emailDelivery =
      transitionedToSent && updatedCampaign.targets.length > 0
        ? await sendCampaignEmails(updatedCampaign)
        : summarizeEmailDelivery([]);

    return res.status(StatusCodes.OK).json({
      campaign: updatedCampaign,
      message: buildEmailDeliveryMessage("Campaign updated", emailDelivery),
      emailDelivery,
    });
  } catch (err) {
    return next(err);
  }
};

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
    console.log(`[deleteCampaign] campaign deleted id=${campaignId} targetCount=${campaign.targets.length}`);

    return res.status(StatusCodes.OK).json({
      msg: "Campaign deleted successfully.",
    });
  } catch (error) {
    return next(error);
  }
};

const sendTestEmail = async (req, res, next) => {
  try {
    const { to } = req.body || {};

    if (!to) {
      return res.status(400).json({
        message: "Recipient email is required.",
      });
    }

    const emailPayload = {
      to,
      subject: "Phishing Simulation Test",
      text: "This is a test phishing simulation email.",
      html: "<h2>This is a test phishing simulation email</h2>",
    };

    console.log(`[sendTestEmail] send started recipient=${to} timeoutMs=${DEFAULT_EMAIL_TIMEOUT_MS}`);

    try {
      const result = await sendEmail(emailPayload, { timeoutMs: DEFAULT_EMAIL_TIMEOUT_MS });
      console.log(`[sendTestEmail] send success recipient=${to} messageId=${result.messageId}`);

      return res.status(StatusCodes.OK).json({
        message: "Email sent successfully.",
        messageId: result.messageId,
        previewUrl: result.previewUrl,
        emailDelivery: {
          status: "sent",
        },
      });
    } catch (error) {
      const timedOut = error?.code === "EMAIL_TIMEOUT";
      console.error(
        `[sendTestEmail] send ${timedOut ? "timed_out" : "failed"} recipient=${to}:`,
        error
      );

      return res.status(StatusCodes.OK).json({
        message: timedOut ? "Email send timed out." : "Email sending failed.",
        previewUrl: null,
        emailDelivery: {
          status: timedOut ? "timed_out" : "failed",
        },
      });
    }
  } catch (err) {
    console.error("[sendTestEmail] failed:", err);
    next(err);
  }
};

module.exports = {
  createCampaign,
  getAllCampaigns,
  getCampaignById,
  updateCampaign,
  deleteCampaign,
  sendTestEmail,
};
