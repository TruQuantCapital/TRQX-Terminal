export const API_BASE_URL =
  import.meta.env.VITE_TRQX_OPERATIONS_API_URL || "http://127.0.0.1:8000";

export const DRAFT_STORAGE_KEY =
  "trqx-publishing-center-draft-v1";

export const CONTENT_TYPES = [
  ["trade_ticket", "Trade Ticket"],
  ["trade_update", "Trade Update"],
  ["daily_prep", "Daily Prep"],
  ["market_news", "Market News"],
  ["economic_event", "Economic Event"],
  ["education", "Education"],
  ["announcement", "Announcement"],
  ["weekly_recap", "Weekly Recap"],
];

export const DESTINATIONS = [
  ["discord", "Discord", true],
  ["website", "Website", false],
  ["facebook", "Facebook", false],
  ["x", "X", false],
  ["linkedin", "LinkedIn", false],
  ["instagram", "Instagram", false],
  ["threads", "Threads", false],
  ["tiktok", "TikTok", false],
  ["youtube", "YouTube", false],
  ["email", "Email", false],
  ["push", "Push", false],
];