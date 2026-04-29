const { CampaignRepository } = require("../repositories/CampaignRepository");

const campaignRepo = new CampaignRepository();

const transparentGifBuffer = Buffer.from(
  "47494638396101000100800000ffffff00000021f90401000000002c00000000010001000002024401003b",
  "hex"
);

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

const getFrontendBaseUrl = () =>
  normalizeBaseUrl(process.env.FRONTEND_URL) ||
  normalizeBaseUrl(process.env.NEXT_PUBLIC_APP_URL) ||
  normalizeBaseUrl(process.env.PUBLIC_FRONTEND_URL) ||
  "http://localhost:3000";

const trackOpen = async (req, res, next) => {
  try {
    const { token } = req.query;

    if (!token) {
      return res.status(400).end();
    }

    const target = await campaignRepo.getTargetByToken(String(token));

    if (!target) {
      return res.status(404).end();
    }

    await campaignRepo.createEvent({
      type: "OPEN",
      campaignId: target.campaignId,
      targetId: target.id,
    });

    res.set("Content-Type", "image/gif");
    return res.status(200).send(transparentGifBuffer);
  } catch (error) {
    next(error);
  }
};

const trackClick = async (req, res, next) => {
  try {
    const { token, redirect } = req.query;

    if (!token) {
      return res.status(400).json({ message: "Missing token." });
    }

    const target = await campaignRepo.getTargetByToken(String(token));

    if (!target) {
      return res.status(404).json({ message: "Target not found." });
    }

    await campaignRepo.createEvent({
      type: "CLICK",
      campaignId: target.campaignId,
      targetId: target.id,
    });

    const safeRedirect =
      typeof redirect === "string" && redirect.trim()
        ? redirect
        : `${getFrontendBaseUrl()}/landing?token=${token}`;

    return res.redirect(safeRedirect);
  } catch (error) {
    next(error);
  }
};

const trackSubmit = async (req, res, next) => {
  try {
    const { token } = req.body || {};

    if (!token) {
      return res.status(400).json({ message: "Missing token." });
    }

    const target = await campaignRepo.getTargetByToken(String(token));

    if (!target) {
      return res.status(404).json({ message: "Target not found." });
    }

    await campaignRepo.createEvent({
      type: "SUBMIT",
      campaignId: target.campaignId,
      targetId: target.id,
    });

    return res.status(200).json({ message: "Submit tracked." });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  trackOpen,
  trackClick,
  trackSubmit,
};
