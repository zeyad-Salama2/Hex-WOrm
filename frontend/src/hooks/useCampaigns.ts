"use client";

import { useCallback, useEffect, useState } from "react";
import {
  createCampaign,
  deleteCampaign,
  getCampaignById,
  listCampaigns,
  sendTestEmail,
  updateCampaign,
  type Campaign,
  type CreateCampaignInput,
  type SendTestEmailInput,
  type UpdateCampaignInput,
} from "@/src/lib/api/campaigns";

export function useCampaigns() {
  const [data, setData] = useState<Campaign[] | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refetch = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const campaigns = await listCampaigns();
      setData(campaigns);
    } catch (caughtError) {
      const message = caughtError instanceof Error
        ? caughtError.message
        : "Unable to load campaigns.";
      setError(message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void refetch();
  }, [refetch]);

  return { data, isLoading, error, refetch, setData };
}

export function useCampaign(id: number | null) {
  const [data, setData] = useState<Campaign | null>(null);
  const [isLoading, setIsLoading] = useState(Boolean(id));
  const [error, setError] = useState<string | null>(null);

  const refetch = useCallback(async () => {
    if (id === null) {
      setData(null);
      setIsLoading(false);
      setError("Campaign id is invalid.");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const campaign = await getCampaignById(id);
      setData(campaign);
    } catch (caughtError) {
      const message = caughtError instanceof Error
        ? caughtError.message
        : "Unable to load the selected campaign.";
      setError(message);
    } finally {
      setIsLoading(false);
    }
  }, [id]);

  useEffect(() => {
    void refetch();
  }, [refetch]);

  return { data, isLoading, error, refetch, setData };
}

export function useCreateCampaign() {
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const create = useCallback(async (input: CreateCampaignInput) => {
    setIsCreating(true);
    setError(null);
    setSuccessMessage(null);

    try {
      const campaign = await createCampaign(input);
      setSuccessMessage("Campaign created successfully.");
      return campaign;
    } catch (caughtError) {
      const message = caughtError instanceof Error
        ? caughtError.message
        : "Unable to create campaign.";
      setError(message);
      throw new Error(message);
    } finally {
      setIsCreating(false);
    }
  }, []);

  return { create, isCreating, error, successMessage };
}

export function useUpdateCampaign() {
  const [isUpdating, setIsUpdating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const update = useCallback(async (id: number, input: UpdateCampaignInput) => {
    setIsUpdating(true);
    setError(null);
    setSuccessMessage(null);

    try {
      const campaign = await updateCampaign(id, input);
      setSuccessMessage("Campaign updated successfully.");
      return campaign;
    } catch (caughtError) {
      const message = caughtError instanceof Error
        ? caughtError.message
        : "Unable to update campaign.";
      setError(message);
      throw new Error(message);
    } finally {
      setIsUpdating(false);
    }
  }, []);

  return { update, isUpdating, error, successMessage };
}

export function useDeleteCampaign() {
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const remove = useCallback(async (id: number) => {
    setIsDeleting(true);
    setError(null);
    setSuccessMessage(null);

    try {
      const message = await deleteCampaign(id);
      setSuccessMessage(message || "Campaign deleted successfully.");
      return message;
    } catch (caughtError) {
      const message = caughtError instanceof Error
        ? caughtError.message
        : "Unable to delete campaign.";
      setError(message);
      throw new Error(message);
    } finally {
      setIsDeleting(false);
    }
  }, []);

  return { remove, isDeleting, error, successMessage };
}

export function useSendTestEmail() {
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const send = useCallback(async (input: SendTestEmailInput) => {
    setIsSending(true);
    setError(null);
    setSuccessMessage(null);
    setPreviewUrl(null);

    try {
      const result = await sendTestEmail(input);
      setSuccessMessage(result.message || "Email generated successfully.");
      setPreviewUrl(result.previewUrl || null);
      return result;
    } catch (caughtError) {
      const message = caughtError instanceof Error
        ? caughtError.message
        : "Unable to send test email.";
      setError(message);
      throw new Error(message);
    } finally {
      setIsSending(false);
    }
  }, []);

  return { send, isSending, error, successMessage, previewUrl };
}
