import {
  AICoachWidget,
  AcademyProgressWidget,
  EconomicEventsWidget,
  MarketBriefWidget,
} from "./index";

export const widgetRegistry = {
  "market-brief": {
    id: "market-brief",
    title: "Market Brief",
    description: "Market conditions, bias, levels, and major catalysts.",
    category: "Market",
    component: MarketBriefWidget,
    defaultLayout: {
      w: 12,
      h: 5,
      minW: 6,
      minH: 3,
    },
  },

  "economic-events": {
    id: "economic-events",
    title: "Economic Events",
    description: "Upcoming economic reports and market-moving events.",
    category: "Market",
    component: EconomicEventsWidget,
    defaultLayout: {
      w: 6,
      h: 5,
      minW: 4,
      minH: 3,
    },
  },

  "academy-progress": {
    id: "academy-progress",
    title: "Academy Progress",
    description: "Current course progress and learning activity.",
    category: "Education",
    component: AcademyProgressWidget,
    defaultLayout: {
      w: 6,
      h: 5,
      minW: 4,
      minH: 3,
    },
  },

  "ai-coach": {
    id: "ai-coach",
    title: "TRQX AI Coach",
    description: "Trading preparation, coaching, and market guidance.",
    category: "Intelligence",
    component: AICoachWidget,
    defaultLayout: {
      w: 12,
      h: 6,
      minW: 6,
      minH: 4,
    },
  },
};

export const availableWidgets = Object.values(widgetRegistry);

export const defaultWidgetIds = [
  "market-brief",
  "economic-events",
  "academy-progress",
  "ai-coach",
];