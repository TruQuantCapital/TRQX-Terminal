import React, { useMemo, useState } from "react";
import "./PatternAcademy.css";

const GOLD = "#d4af37";
const GREEN = "#22c55e";
const RED = "#ef4444";
const BLUE = "#38bdf8";
const PURPLE = "#a855f7";

const C = (x, o, h, l, c) => ({ x, o, h, l, c, bull: c >= o });

const CARDS = [
  {
    id: "head-shoulders", title: "Head & Shoulders Pattern", level: "Intermediate", trend: "Bullish → Bearish", range: { min: 95, max: 165 },
    candles: [C(6,102,108,100,106),C(10,106,116,104,114),C(14,114,128,112,125),C(18,125,137,123,133),C(22,133,139,126,128),C(26,128,132,119,122),C(30,122,132,120,130),C(34,130,146,128,143),C(38,143,158,141,154),C(42,154,160,145,148),C(46,148,151,132,136),C(50,136,144,134,142),C(54,142,150,140,146),C(58,146,149,132,135),C(62,135,138,121,124),C(66,124,127,112,116),C(70,116,119,104,108)],
    lines: [{label:"Neckline",x1:22,y1:66,x2:68,y2:66,color:GOLD},{label:"Breakdown",x1:60,y1:66,x2:72,y2:80,color:RED}],
    zones: [{id:"ls",label:"Left Shoulder",help:"First peak before the head",x:18,y:38},{id:"head",label:"Head",help:"Highest peak",x:39,y:20},{id:"rs",label:"Right Shoulder",help:"Lower peak after the head",x:55,y:39},{id:"neck",label:"Neckline",help:"Support connecting reaction lows",x:43,y:66},{id:"break",label:"Breakdown",help:"Price breaks below neckline",x:69,y:77},{id:"target",label:"Measured Target",help:"Distance from head to neckline projected down",x:78,y:87}],
    explanation: ["Three peaks form after an uptrend: left shoulder, higher head, lower right shoulder.","The neckline connects the reaction lows.","The pattern confirms only after price breaks below the neckline.","Target is commonly measured from head to neckline and projected downward."]
  },
  {
    id: "inverse-head-shoulders", title: "Inverse Head & Shoulders Pattern", level: "Intermediate", trend: "Bearish → Bullish", range: { min: 95, max: 165 },
    candles: [C(6,158,150,160,148),C(10,150,138,152,136),C(14,138,126,140,124),C(18,126,118,128,116),C(22,118,130,116,128),C(26,128,134,126,132),C(30,132,119,134,116),C(34,119,108,121,104),C(38,108,115,106,113),C(42,113,128,111,126),C(46,126,136,124,134),C(50,134,124,136,122),C(54,124,129,122,127),C(58,127,138,125,136),C(62,136,150,134,148),C(66,148,158,146,156),C(70,156,164,154,162)],
    lines: [{label:"Neckline",x1:22,y1:36,x2:68,y2:36,color:GOLD},{label:"Breakout",x1:60,y1:36,x2:72,y2:22,color:GREEN}],
    zones: [{id:"ls",label:"Left Shoulder",help:"First low before head",x:19,y:62},{id:"head",label:"Head",help:"Deepest low",x:38,y:82},{id:"rs",label:"Right Shoulder",help:"Higher low after head",x:55,y:62},{id:"neck",label:"Neckline",help:"Resistance connecting reaction highs",x:43,y:36},{id:"break",label:"Breakout",help:"Price breaks above neckline",x:69,y:23},{id:"retest",label:"Retest",help:"Neckline may become support",x:63,y:37}],
    explanation: ["Three lows form after a downtrend: left shoulder, deeper head, higher right shoulder.","The neckline connects reaction highs.","Confirmation occurs when price breaks above the neckline.","A retest of the neckline as support can improve entry quality."]
  },
  {
    id: "double-top", title: "Double Top Pattern", level: "Beginner", trend: "Bullish → Bearish", range: { min: 95, max: 145 },
    candles: [C(8,102,110,100,108),C(12,108,118,106,116),C(16,116,130,114,128),C(20,128,137,126,134),C(24,134,130,138,128),C(28,130,121,132,119),C(32,121,128,119,126),C(36,126,134,124,132),C(40,132,137,130,133),C(44,133,124,135,122),C(48,124,115,126,113),C(52,115,104,117,102)],
    lines: [{label:"Resistance",x1:17,y1:22,x2:43,y2:22,color:RED},{label:"Neckline",x1:24,y1:58,x2:49,y2:58,color:GOLD}],
    zones: [{id:"t1",label:"First Top",help:"First rejection at resistance",x:20,y:22},{id:"t2",label:"Second Top",help:"Second rejection at same level",x:39,y:22},{id:"neck",label:"Neckline",help:"Support between the two tops",x:34,y:58},{id:"break",label:"Breakdown",help:"Price breaks below neckline",x:50,y:72},{id:"res",label:"Resistance",help:"Level sellers defended twice",x:30,y:14}],
    explanation: ["Double top = two failed attempts to break resistance.","The valley between the tops creates the neckline.","Confirmation happens below the neckline, not simply at the second top."]
  },
  {
    id: "double-bottom", title: "Double Bottom Pattern", level: "Beginner", trend: "Bearish → Bullish", range: { min: 95, max: 145 },
    candles: [C(8,138,128,140,126),C(12,128,119,130,117),C(16,119,107,121,103),C(20,107,112,114,102),C(24,112,120,122,110),C(28,120,127,129,118),C(32,127,118,129,116),C(36,118,108,120,103),C(40,108,114,116,102),C(44,114,126,112,124),C(48,124,136,122,134),C(52,134,142,132,140)],
    lines: [{label:"Support",x1:17,y1:78,x2:42,y2:78,color:GREEN},{label:"Neckline",x1:27,y1:42,x2:50,y2:42,color:GOLD}],
    zones: [{id:"b1",label:"First Bottom",help:"First defense at support",x:20,y:78},{id:"b2",label:"Second Bottom",help:"Second defense at support",x:39,y:78},{id:"neck",label:"Neckline",help:"Resistance between lows",x:34,y:42},{id:"break",label:"Breakout",help:"Price breaks above neckline",x:50,y:28},{id:"support",label:"Support",help:"Buyer defended level",x:29,y:86}],
    explanation: ["Double bottom = two failed attempts to break support.","The neckline is the resistance between the two lows.","The bullish confirmation is a break above the neckline."]
  },
  {
    id:"triple-top", title:"Triple Top Pattern", level:"Intermediate", trend:"Bullish → Bearish", range:{min:95,max:150},
    candles:[C(6,104,112,102,110),C(10,110,124,108,122),C(14,122,137,120,134),C(18,134,129,140,127),C(22,129,120,131,118),C(26,120,130,118,128),C(30,128,138,126,135),C(34,135,129,140,127),C(38,129,119,131,117),C(42,119,130,117,128),C(46,128,137,126,134),C(50,134,126,139,124),C(54,126,114,128,112),C(58,114,102,116,100)],
    lines:[{label:"Resistance",x1:13,y1:20,x2:49,y2:20,color:RED},{label:"Support",x1:22,y1:61,x2:55,y2:61,color:GOLD}],
    zones:[{id:"top1",label:"Top 1",help:"First rejection",x:17,y:20},{id:"top2",label:"Top 2",help:"Second rejection",x:32,y:20},{id:"top3",label:"Top 3",help:"Third failed breakout",x:47,y:20},{id:"neck",label:"Support / Neckline",help:"Break confirms pattern",x:39,y:61},{id:"break",label:"Breakdown",help:"Price loses support",x:57,y:76}],
    explanation:["Triple tops show repeated failure at the same resistance.","The more times resistance holds, the more obvious the level becomes.","Confirmation requires support/neckline failure."]
  },
  {
    id:"triple-bottom", title:"Triple Bottom Pattern", level:"Intermediate", trend:"Bearish → Bullish", range:{min:95,max:150},
    candles:[C(6,144,132,146,130),C(10,132,119,134,116),C(14,119,106,121,102),C(18,106,114,116,101),C(22,114,124,126,112),C(26,124,112,126,106),C(30,112,105,114,101),C(34,105,116,118,102),C(38,116,126,128,114),C(42,126,113,128,106),C(46,113,105,115,101),C(50,105,120,103,118),C(54,118,134,116,132),C(58,132,146,130,144)],
    lines:[{label:"Support",x1:13,y1:80,x2:50,y2:80,color:GREEN},{label:"Resistance",x1:22,y1:43,x2:57,y2:43,color:GOLD}],
    zones:[{id:"b1",label:"Bottom 1",help:"First support defense",x:17,y:80},{id:"b2",label:"Bottom 2",help:"Second support defense",x:31,y:80},{id:"b3",label:"Bottom 3",help:"Third support defense",x:46,y:80},{id:"neck",label:"Resistance / Neckline",help:"Break confirms reversal",x:40,y:43},{id:"break",label:"Breakout",help:"Price breaks resistance",x:58,y:25}],
    explanation:["Triple bottoms show repeated buyer defense at the same support.","The reversal confirms when resistance breaks.","Entering before breakout is early and higher risk."]
  },
  {
    id:"bull-flag", title:"Bull Flag Pattern", level:"Intermediate", trend:"Bullish Continuation", range:{min:95,max:165},
    candles:[C(8,100,110,98,108),C(12,108,122,106,120),C(16,120,137,118,135),C(20,135,151,132,148),C(24,148,154,142,144),C(28,144,148,137,140),C(32,140,146,136,142),C(36,142,144,134,136),C(40,136,141,133,139),C(44,139,156,138,154),C(48,154,163,152,160)],
    lines:[{label:"Flagpole",x1:8,y1:82,x2:20,y2:20,color:GREEN},{label:"Upper Flag",x1:23,y1:28,x2:42,y2:44,color:GOLD},{label:"Lower Flag",x1:23,y1:45,x2:42,y2:60,color:GOLD}],
    zones:[{id:"pole",label:"Flagpole",help:"Strong impulse move",x:15,y:38},{id:"flag",label:"Flag",help:"Controlled pullback",x:32,y:48},{id:"upper",label:"Upper Trendline",help:"Breakout trigger",x:36,y:38},{id:"break",label:"Breakout",help:"Price breaks above flag",x:46,y:25},{id:"target",label:"Target",help:"Measured move from flagpole",x:55,y:16}],
    explanation:["Bull flag is a continuation pattern after a strong bullish impulse.","The flag should be controlled and lower volume, not a full reversal.","Confirmation occurs above the upper flag trendline."]
  },
  {
    id:"bear-flag", title:"Bear Flag Pattern", level:"Intermediate", trend:"Bearish Continuation", range:{min:95,max:165},
    candles:[C(8,158,146,161,144),C(12,146,132,148,130),C(16,132,117,135,115),C(20,117,103,119,100),C(24,103,110,112,101),C(28,110,116,118,108),C(32,116,112,119,110),C(36,112,118,120,111),C(40,118,114,121,112),C(44,114,100,116,98),C(48,100,92,102,90)],
    lines:[{label:"Flagpole",x1:8,y1:18,x2:20,y2:78,color:RED},{label:"Upper Flag",x1:23,y1:58,x2:42,y2:43,color:GOLD},{label:"Lower Flag",x1:23,y1:74,x2:42,y2:59,color:GOLD}],
    zones:[{id:"pole",label:"Flagpole",help:"Strong bearish impulse",x:15,y:47},{id:"flag",label:"Flag",help:"Weak bounce after selloff",x:32,y:58},{id:"lower",label:"Lower Trendline",help:"Breakdown trigger",x:35,y:70},{id:"break",label:"Breakdown",help:"Price breaks below flag",x:45,y:82},{id:"target",label:"Target",help:"Measured move from flagpole",x:55,y:90}],
    explanation:["Bear flag is a continuation pattern after a strong bearish impulse.","The flag is a weak bounce, not true bullish reversal.","Confirmation occurs below the lower flag trendline."]
  },
  {
    id:"bull-pennant", title:"Bull Pennant Pattern", level:"Intermediate", trend:"Bullish Continuation", range:{min:95,max:165},
    candles:[C(8,100,112,98,110),C(12,110,126,108,124),C(16,124,142,122,140),C(20,140,154,138,152),C(24,152,146,154,144),C(28,146,150,151,145),C(32,150,147,152,146),C(36,147,149,150,146),C(40,149,148,150,147),C(44,148,160,147,158),C(48,158,166,156,164)],
    lines:[{label:"Flagpole",x1:8,y1:82,x2:20,y2:18,color:GREEN},{label:"Upper Pennant",x1:23,y1:28,x2:40,y2:42,color:GOLD},{label:"Lower Pennant",x1:23,y1:58,x2:40,y2:45,color:GOLD}],
    zones:[{id:"pole",label:"Flagpole",help:"Impulse before compression",x:15,y:37},{id:"pennant",label:"Pennant",help:"Tight converging consolidation",x:33,y:44},{id:"upper",label:"Upper Trendline",help:"Breakout trigger",x:36,y:38},{id:"break",label:"Breakout",help:"Price escapes upward",x:45,y:24},{id:"target",label:"Target",help:"Flagpole projection",x:54,y:16}],
    explanation:["Bull pennant follows a strong upward impulse.","Price compresses into a small triangle.","Breakout confirms continuation."]
  },
  {
    id:"bear-pennant", title:"Bear Pennant Pattern", level:"Intermediate", trend:"Bearish Continuation", range:{min:95,max:165},
    candles:[C(8,160,148,162,146),C(12,148,132,150,130),C(16,132,116,134,114),C(20,116,102,118,100),C(24,102,108,110,101),C(28,108,104,109,103),C(32,104,107,108,103),C(36,107,105,108,104),C(40,105,106,107,104),C(44,106,94,108,92),C(48,94,86,96,84)],
    lines:[{label:"Flagpole",x1:8,y1:18,x2:20,y2:82,color:RED},{label:"Upper Pennant",x1:23,y1:60,x2:40,y2:47,color:GOLD},{label:"Lower Pennant",x1:23,y1:30,x2:40,y2:45,color:GOLD}],
    zones:[{id:"pole",label:"Flagpole",help:"Sharp bearish impulse",x:15,y:47},{id:"pennant",label:"Pennant",help:"Tight compression after selloff",x:33,y:46},{id:"lower",label:"Lower Trendline",help:"Breakdown trigger",x:36,y:58},{id:"break",label:"Breakdown",help:"Price escapes lower",x:45,y:82},{id:"target",label:"Target",help:"Flagpole projection",x:54,y:90}],
    explanation:["Bear pennant follows a strong bearish impulse.","The pennant compresses before continuation.","Breakdown below the lower line confirms."]
  },
  {
    id:"ascending-triangle", title:"Ascending Triangle Pattern", level:"Intermediate", trend:"Bullish Continuation", range:{min:95,max:145},
    candles:[C(8,102,110,100,108),C(12,108,118,106,116),C(16,116,128,114,126),C(20,126,132,122,124),C(24,124,118,126,116),C(28,118,126,117,124),C(32,124,131,122,129),C(36,129,124,132,123),C(40,124,121,126,120),C(44,121,129,120,128),C(48,128,136,127,134),C(52,134,142,132,140)],
    lines:[{label:"Flat Resistance",x1:16,y1:28,x2:48,y2:28,color:RED},{label:"Rising Support",x1:24,y1:72,x2:44,y2:48,color:GREEN}],
    zones:[{id:"res",label:"Flat Resistance",help:"Sellers defend the same upper level",x:31,y:28},{id:"hl1",label:"Higher Low",help:"Buyers step in higher",x:25,y:70},{id:"hl2",label:"Higher Low",help:"Pressure builds",x:40,y:50},{id:"support",label:"Rising Support",help:"Trendline formed by higher lows",x:34,y:60},{id:"break",label:"Breakout",help:"Price breaks above resistance",x:50,y:18}],
    explanation:["Ascending triangle = flat resistance plus rising lows.","Rising lows show buyers are becoming more aggressive.","Breakout above resistance confirms."]
  },
  {
    id:"descending-triangle", title:"Descending Triangle Pattern", level:"Intermediate", trend:"Bearish Continuation", range:{min:95,max:145},
    candles:[C(8,140,132,142,130),C(12,132,124,134,122),C(16,124,116,126,114),C(20,116,111,118,108),C(24,111,120,122,110),C(28,120,128,130,118),C(32,128,119,130,117),C(36,119,112,121,110),C(40,112,119,121,111),C(44,119,124,126,117),C(48,124,113,126,111),C(52,113,103,115,100)],
    lines:[{label:"Flat Support",x1:16,y1:72,x2:50,y2:72,color:GREEN},{label:"Falling Resistance",x1:26,y1:32,x2:48,y2:58,color:RED}],
    zones:[{id:"support",label:"Flat Support",help:"Buyers defend the same lower level",x:33,y:72},{id:"lh1",label:"Lower High",help:"Sellers step in lower",x:29,y:35},{id:"lh2",label:"Lower High",help:"Bearish pressure increases",x:43,y:55},{id:"res",label:"Falling Resistance",help:"Trendline formed by lower highs",x:37,y:45},{id:"break",label:"Breakdown",help:"Price breaks below support",x:53,y:82}],
    explanation:["Descending triangle = flat support plus falling highs.","Lower highs show sellers getting more aggressive.","Break below support confirms."]
  },
  {
    id:"symmetrical-triangle", title:"Symmetrical Triangle Pattern", level:"Intermediate", trend:"Compression → Breakout", range:{min:95,max:145},
    candles:[C(8,105,118,103,116),C(12,116,132,114,130),C(16,130,120,134,118),C(20,120,110,122,108),C(24,110,124,108,122),C(28,122,128,120,126),C(32,126,116,128,114),C(36,116,121,114,119),C(40,119,117,121,115),C(44,117,127,116,125),C(48,125,136,123,134)],
    lines:[{label:"Lower Highs",x1:14,y1:25,x2:42,y2:50,color:RED},{label:"Higher Lows",x1:20,y1:75,x2:42,y2:54,color:GREEN}],
    zones:[{id:"lh",label:"Lower Highs",help:"Sellers step in lower each time",x:29,y:38},{id:"hl",label:"Higher Lows",help:"Buyers step in higher each time",x:31,y:64},{id:"apex",label:"Compression",help:"Range gets tighter",x:42,y:52},{id:"break",label:"Breakout",help:"Price leaves triangle",x:49,y:30},{id:"target",label:"Target",help:"Measured from triangle height",x:57,y:20}],
    explanation:["Symmetrical triangles show compression between lower highs and higher lows.","They can break either direction, so wait for confirmation.","The first strong close outside the triangle matters most."]
  },
  {
    id:"rising-wedge", title:"Rising Wedge Pattern", level:"Advanced", trend:"Bullish Weakening → Bearish", range:{min:95,max:145},
    candles:[C(8,100,108,98,106),C(12,106,117,104,115),C(16,115,111,118,109),C(20,111,121,110,119),C(24,119,116,123,114),C(28,116,126,115,124),C(32,124,121,128,119),C(36,121,130,120,128),C(40,128,124,132,122),C(44,124,116,126,114),C(48,116,106,118,104)],
    lines:[{label:"Rising Resistance",x1:14,y1:45,x2:40,y2:22,color:RED},{label:"Rising Support",x1:14,y1:78,x2:40,y2:55,color:GREEN}],
    zones:[{id:"res",label:"Rising Resistance",help:"Upper trendline climbs",x:29,y:33},{id:"sup",label:"Rising Support",help:"Lower trendline climbs",x:29,y:66},{id:"compression",label:"Compression",help:"Wedge narrows",x:40,y:46},{id:"break",label:"Breakdown",help:"Support line fails",x:45,y:72},{id:"target",label:"Target",help:"Move often retraces wedge base",x:54,y:84}],
    explanation:["Rising wedge shows price rising with weakening structure.","The wedge narrows as momentum fades.","Break below rising support confirms bearish reversal or continuation."]
  },
  {
    id:"falling-wedge", title:"Falling Wedge Pattern", level:"Advanced", trend:"Bearish Weakening → Bullish", range:{min:95,max:145},
    candles:[C(8,140,132,142,130),C(12,132,120,134,118),C(16,120,124,126,116),C(20,124,113,126,111),C(24,113,116,118,108),C(28,116,106,118,104),C(32,106,110,112,101),C(36,110,103,112,100),C(40,103,108,110,98),C(44,108,120,106,118),C(48,118,132,116,130)],
    lines:[{label:"Falling Resistance",x1:14,y1:25,x2:40,y2:52,color:RED},{label:"Falling Support",x1:14,y1:58,x2:40,y2:80,color:GREEN}],
    zones:[{id:"res",label:"Falling Resistance",help:"Upper trendline declines",x:28,y:39},{id:"sup",label:"Falling Support",help:"Lower trendline declines",x:29,y:70},{id:"compression",label:"Compression",help:"Range tightens",x:39,y:61},{id:"break",label:"Breakout",help:"Resistance line breaks",x:46,y:40},{id:"target",label:"Target",help:"Move often returns to wedge origin",x:55,y:25}],
    explanation:["Falling wedge shows selling pressure weakening.","The wedge narrows as the downtrend loses momentum.","Break above falling resistance confirms bullish reversal or continuation."]
  },
  {
    id:"cup-handle", title:"Cup and Handle Pattern", level:"Intermediate", trend:"Bullish Continuation", range:{min:95,max:150},
    candles:[C(6,138,130,140,128),C(10,130,122,132,120),C(14,122,116,124,114),C(18,116,112,118,110),C(22,112,110,114,108),C(26,110,114,116,109),C(30,114,120,122,112),C(34,120,128,130,118),C(38,128,136,138,126),C(42,136,132,138,130),C(46,132,128,134,126),C(50,128,134,136,127),C(54,134,144,132,142)],
    lines:[{label:"Rim Resistance",x1:6,y1:22,x2:54,y2:22,color:GOLD},{label:"Handle",x1:40,y1:30,x2:50,y2:42,color:RED}],
    zones:[{id:"left",label:"Left Rim",help:"Start of the cup",x:7,y:22},{id:"bottom",label:"Cup Bottom",help:"Rounded accumulation area",x:24,y:78},{id:"right",label:"Right Rim",help:"Return to resistance",x:38,y:22},{id:"handle",label:"Handle",help:"Small pullback before breakout",x:46,y:38},{id:"break",label:"Breakout",help:"Price breaks rim resistance",x:55,y:14}],
    explanation:["Cup and handle is a rounded accumulation pattern.","The handle is a small shakeout after price returns to the rim.","Break above rim resistance confirms continuation."]
  },
  {
    id:"inverse-cup-handle", title:"Inverse Cup and Handle Pattern", level:"Advanced", trend:"Bearish Continuation", range:{min:95,max:150},
    candles:[C(6,105,114,103,112),C(10,112,122,110,120),C(14,120,130,118,128),C(18,128,136,126,134),C(22,134,138,132,136),C(26,136,132,138,130),C(30,132,126,134,124),C(34,126,118,128,116),C(38,118,110,120,108),C(42,110,115,117,108),C(46,115,119,121,113),C(50,119,112,121,110),C(54,112,100,114,98)],
    lines:[{label:"Rim Support",x1:6,y1:78,x2:54,y2:78,color:GOLD},{label:"Handle",x1:40,y1:70,x2:50,y2:58,color:GREEN}],
    zones:[{id:"left",label:"Left Rim",help:"Start of rounded top",x:7,y:78},{id:"top",label:"Cup Top",help:"Rounded distribution area",x:24,y:22},{id:"right",label:"Right Rim",help:"Return to support",x:38,y:78},{id:"handle",label:"Handle",help:"Small bounce before breakdown",x:46,y:62},{id:"break",label:"Breakdown",help:"Price breaks rim support",x:55,y:88}],
    explanation:["Inverse cup and handle is a bearish distribution structure.","The handle is a weak bounce after price returns to support.","Break below rim support confirms continuation lower."]
  },
  {
    id:"rectangle-breakout", title:"Rectangle Breakout Pattern", level:"Beginner", trend:"Range → Bullish", range:{min:95,max:145},
    candles:[C(6,108,118,106,116),C(10,116,128,114,126),C(14,126,118,130,116),C(18,118,126,116,124),C(22,124,117,128,115),C(26,117,126,115,124),C(30,124,118,128,116),C(34,118,126,116,124),C(38,124,132,122,130),C(42,130,140,128,138)],
    lines:[{label:"Resistance",x1:10,y1:28,x2:38,y2:28,color:RED},{label:"Support",x1:10,y1:70,x2:38,y2:70,color:GREEN}],
    zones:[{id:"res",label:"Resistance",help:"Top of range",x:24,y:28},{id:"support",label:"Support",help:"Bottom of range",x:24,y:70},{id:"range",label:"Range",help:"Price trapped between levels",x:25,y:50},{id:"break",label:"Breakout",help:"Price closes above resistance",x:41,y:18},{id:"target",label:"Target",help:"Range height projected up",x:50,y:10}],
    explanation:["Rectangle breakout forms after sideways consolidation.","Support and resistance define the box.","Bullish confirmation occurs above resistance."]
  },
  {
    id:"rectangle-breakdown", title:"Rectangle Breakdown Pattern", level:"Beginner", trend:"Range → Bearish", range:{min:95,max:145},
    candles:[C(6,136,126,138,124),C(10,126,116,128,114),C(14,116,124,126,114),C(18,124,117,126,115),C(22,117,126,128,115),C(26,126,118,128,116),C(30,118,125,127,116),C(34,125,117,127,115),C(38,117,108,119,106),C(42,108,98,110,96)],
    lines:[{label:"Resistance",x1:10,y1:30,x2:36,y2:30,color:RED},{label:"Support",x1:10,y1:70,x2:36,y2:70,color:GREEN}],
    zones:[{id:"res",label:"Resistance",help:"Top of range",x:23,y:30},{id:"support",label:"Support",help:"Bottom of range",x:23,y:70},{id:"range",label:"Range",help:"Sideways balance area",x:24,y:50},{id:"break",label:"Breakdown",help:"Price closes below support",x:39,y:82},{id:"target",label:"Target",help:"Range height projected down",x:48,y:90}],
    explanation:["Rectangle breakdown forms after sideways consolidation.","The break of support shows sellers won the range.","Target often uses the height of the rectangle."]
  },
  {
    id:"order-block-bos-choch", title:"Institutional Order Block + BOS / CHoCH", level:"Advanced", trend:"Structure → Confirmation", range:{min:95,max:165},
    candles:[C(8,100,112,98,110),C(12,110,126,108,124),C(16,124,118,128,116),C(20,118,112,120,110),C(24,112,121,111,119),C(28,119,116,122,114),C(32,116,127,115,125),C(36,125,139,123,137),C(40,137,132,141,130),C(44,132,126,134,124),C(48,126,116,128,114),C(52,116,108,118,105),C(56,108,118,106,116),C(60,116,130,114,128),C(64,128,146,126,144),C(68,144,158,142,156)],
    lines:[{label:"BOS",x1:12,y1:35,x2:36,y2:35,color:GOLD},{label:"Liquidity Grab",x1:25,y1:78,x2:55,y2:78,color:PURPLE},{label:"Order Block",x1:42,y1:74,x2:62,y2:74,color:BLUE,soft:true}],
    zones:[{id:"bos",label:"BOS",help:"Break of previous structure high",x:30,y:35},{id:"liq",label:"Liquidity Grab",help:"Sweep below prior lows before reversal",x:50,y:78},{id:"ob",label:"Order Block",help:"Last bearish area before bullish displacement",x:52,y:74},{id:"choch",label:"CHoCH",help:"First shift back to bullish control",x:62,y:48},{id:"breakout",label:"Breakout",help:"Price expands away from OB",x:69,y:28}],
    explanation:["Smart money setups start with structure, not a random candle.","Liquidity is often swept before displacement.","The order block is useful only if price reacts and structure confirms."]
  }
];

function priceToY(price, range) {
  return 8 + ((range.max - price) / Math.max(range.max - range.min, 0.0001)) * 82;
}

function Candle({ candle, range }) {
  const openY = priceToY(candle.o, range);
  const closeY = priceToY(candle.c, range);
  const highY = priceToY(candle.h, range);
  const lowY = priceToY(candle.l, range);
  const bodyTop = Math.min(openY, closeY);
  const bodyHeight = Math.max(2.2, Math.abs(closeY - openY));
  const color = candle.bull ? "green" : "red";
  return (
    <div className={`pa-candle ${color}`} style={{ left: `${candle.x}%` }}>
      <div className="pa-wick" style={{ top: `${highY}%`, height: `${Math.max(lowY - highY, 1)}%` }} />
      <div className="pa-body" style={{ top: `${bodyTop}%`, height: `${bodyHeight}%` }} />
    </div>
  );
}

function Line({ line }) {
  const dx = line.x2 - line.x1;
  const dy = line.y2 - line.y1;
  const length = Math.sqrt(dx * dx + dy * dy);
  const angle = Math.atan2(dy, dx) * 180 / Math.PI;
  return (
    <div
      className={`pa-line ${line.soft ? "soft" : ""} ${line.dashed ? "dashed" : ""}`}
      style={{
        left: `${line.x1}%`,
        top: `${line.y1}%`,
        width: `${length}%`,
        transform: `rotate(${angle}deg)`,
        borderColor: line.color || GOLD
      }}
    >
      <span>{line.label}</span>
    </div>
  );
}

export default function PatternAcademy() {
  const [cardIndex, setCardIndex] = useState(0);
  const [placed, setPlaced] = useState({});
  const [results, setResults] = useState({});
  const [showHint, setShowHint] = useState(false);
  const [xp, setXp] = useState(2950);
  const [streak, setStreak] = useState(0);
  const [attempts, setAttempts] = useState(48);
  const [correctTotal, setCorrectTotal] = useState(38);

  const card = CARDS[cardIndex];
  const checked = Object.keys(results).length > 0;
  const correctCount = Object.values(results).filter(Boolean).length;
  const accuracy = Math.round((correctTotal / Math.max(attempts, 1)) * 100);
  const used = Object.values(placed);

  const labels = useMemo(() => card.zones.map((z) => ({ id: z.id, label: z.label, help: z.help })), [card]);

  function dragStart(e, id) {
    e.dataTransfer.setData("labelId", id);
  }

  function drop(e, zoneId) {
    e.preventDefault();
    const labelId = e.dataTransfer.getData("labelId");
    if (!labelId) return;
    setPlaced((prev) => {
      const next = { ...prev };
      Object.keys(next).forEach((key) => {
        if (next[key] === labelId) delete next[key];
      });
      next[zoneId] = labelId;
      return next;
    });
    setResults({});
  }

  function checkAnswer() {
    const next = {};
    card.zones.forEach((z) => { next[z.id] = placed[z.id] === z.id; });
    const count = Object.values(next).filter(Boolean).length;
    setResults(next);
    setAttempts((v) => v + card.zones.length);
    setCorrectTotal((v) => v + count);
    setStreak((v) => count === card.zones.length ? v + 1 : 0);
    setXp((v) => v + count * 25 + (count === card.zones.length ? 100 : 0));
  }

  function reset() {
    setPlaced({});
    setResults({});
    setShowHint(false);
  }

  function nextCard() {
    setCardIndex((i) => (i + 1) % CARDS.length);
    reset();
  }

  const feedback = checked ? card.zones.map((z) => {
    const picked = labels.find((l) => l.id === placed[z.id]);
    if (results[z.id]) return { ok: true, text: `Correct: ${z.label}. ${z.help}` };
    if (!picked) return { ok: false, text: `Missing: ${z.label}. ${z.help}` };
    return { ok: false, text: `Almost. You placed ${picked.label}, but this location is ${z.label}. ${z.help}` };
  }) : [];

  const priceTicks = Array.from({ length: 6 }, (_, i) => {
    const p = card.range.max - ((card.range.max - card.range.min) / 5) * i;
    return card.range.max < 10 ? p.toFixed(5) : p.toFixed(2);
  });

  return (
    <section className="pattern-academy-shell">
      <div className="pa-topbar">
        <div>
          <div className="pa-brandline">TRQX Pattern Academy</div>
          <div className="pa-title-row">
            <h2>{card.title}</h2>
            <span className="pa-level-pill">{card.level}</span>
          </div>
          <div className="pa-subtext">Drag each label to the correct area. These cards are hand-built for teaching, not auto-generated.</div>
        </div>
        <div className="pa-stats-strip">
          <div className="pa-stat gold"><span>XP</span><strong>{xp.toLocaleString()}</strong></div>
          <div className="pa-stat"><span>Streak</span><strong>🔥 {streak}</strong></div>
          <div className="pa-stat green"><span>Accuracy</span><strong>{accuracy}%</strong></div>
          <div className="pa-stat blue"><span>Cards</span><strong>{CARDS.length}</strong></div>
        </div>
      </div>

      <div className="pa-main-grid">
        <div className="pa-board">
          <div className="pa-board-head">
            <div>
              <span className="pa-day-pill">D1</span>
              <span className="pa-trend-pill">TREND: <b>{card.trend}</b></span>
            </div>
            <div className="pa-progress-wrap">
              <div className="pa-progress-label"><span>Progress</span><span>{cardIndex + 1}/{CARDS.length}</span></div>
              <div className="pa-progress-track"><div className="pa-progress-fill" style={{ width: `${((cardIndex + 1) / CARDS.length) * 100}%` }} /></div>
            </div>
          </div>

          <div className="pa-chart">
            <div className="pa-price-axis">{priceTicks.map((t) => <span key={t}>{t}</span>)}</div>
            <div className="pa-time-axis"><span>Setup</span><span>Context</span><span>Pattern</span><span>Confirm</span><span>Entry</span></div>

            {card.lines.map((line, i) => <Line key={`${line.label}-${i}`} line={line} />)}
            {card.candles.map((c, i) => <Candle key={`${card.id}-${i}`} candle={c} range={card.range} />)}

            {card.zones.map((zone, i) => {
              const picked = labels.find((l) => l.id === placed[zone.id]);
              const state = checked ? (results[zone.id] ? "correct" : "wrong") : "";
              return (
                <div
                  key={zone.id}
                  className={`pa-zone ${state} ${!picked ? "empty" : ""}`}
                  style={{ left: `${zone.x}%`, top: `${zone.y}%` }}
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={(e) => drop(e, zone.id)}
                  title={zone.help}
                >
                  <span className="pa-zone-number">{i + 1}</span>
                  <span className="pa-zone-text">{picked?.label || "DROP"}</span>
                </div>
              );
            })}
          </div>
        </div>

        <aside className="pa-side-panel">
          <div className="pa-side-title">🏆 Drag these labels</div>
          {labels.map((label) => (
            <div
              key={label.id}
              draggable
              onDragStart={(e) => dragStart(e, label.id)}
              className={`pa-drag-label ${used.includes(label.id) ? "used" : ""}`}
            >
              <strong>{label.label}</strong>
              <span>{label.help}</span>
            </div>
          ))}
          <div className="pa-control-card">
            <button className="pa-button ghost" onClick={() => setShowHint((v) => !v)}>💡 Hint</button>
            {showHint && <p className="pa-hint-text">Start with the biggest structure first: neckline/support/resistance, then label the peaks/lows, then confirmation.</p>}
            <button className="pa-button" onClick={checkAnswer}>Check Answer</button>
            <button className="pa-button secondary" onClick={reset}>Reset</button>
            <button className="pa-button next" onClick={nextCard}>Next Pattern →</button>
          </div>
        </aside>
      </div>

      <div className="pa-bottom-grid">
        <div className="pa-info-panel">
          <h3>🤖 AI Tutor Feedback</h3>
          {!checked && <p>Drag the labels to the correct locations, then click <b>Check Answer</b>. The tutor will explain what each structure means.</p>}
          {feedback.map((f, i) => <div key={i} className={`pa-feedback-line ${f.ok ? "good" : "bad"}`}>{f.ok ? "✅" : "❌"} {f.text}</div>)}
        </div>
        <div className="pa-info-panel">
          <h3>📖 Pattern Explanation</h3>
          <ul>{card.explanation.map((line, i) => <li key={i}>{line}</li>)}</ul>
        </div>
        <div className="pa-info-panel">
          <h3>📈 Your Stats</h3>
          <div className="pa-accuracy-ring" style={{ "--deg": `${accuracy * 3.6}deg` }}><strong>{accuracy}%</strong><span>Accuracy</span></div>
          <div className="pa-mini-stats">
            <div><span>Correct</span><strong>{correctTotal}</strong></div>
            <div><span>Attempts</span><strong>{attempts}</strong></div>
            <div><span>Current Card</span><strong>{cardIndex + 1}/{CARDS.length}</strong></div>
            <div><span>Current Score</span><strong>{checked ? `${correctCount}/${card.zones.length}` : "--"}</strong></div>
          </div>
        </div>
      </div>
    </section>
  );
}
