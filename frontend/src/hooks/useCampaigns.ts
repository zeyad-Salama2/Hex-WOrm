"use client";

import { useCallback, useEffect, useState } from "react";
import {
  createCampaign,
  listCampaigns,
  type Campaign,
  type CreateCampaignInput,
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
    } catch {
      setError("Unable to load campaigns.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void refetch();
  }, [refetch]);

  return { data, isLoading, error, refetch };
}

export function useCreateCampaign() {
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const create = useCallback(async (input: CreateCampaignInput) => {
    setIsCreating(true);
    setError(null);

    try {
      return await createCampaign(input);
    } catch {
      const message = "Unable to create campaign.";
      setError(message);
      throw new Error(message);
    } finally {
      setIsCreating(false);
    }
  }, []);

  return { create, isCreating, error };
}
