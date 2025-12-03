import React from 'react';
import type { ReactNode } from 'react';
import { ArrowUp, Asterisk, Checkmark, FlashOff, Help, Play, Queued, Renew, Stop, WarningAlt, WarningOther, WatsonHealthCdArchive, WatsonHealthThreshold } from '@carbon/icons-react';

export interface FooterItem {
  icon?: string | ReactNode;
  text: string;
  tooltip?: string;
  key?: string;
}

export const footerData: Record<string, FooterItem[]> = {
  '': [
    { icon: <WatsonHealthThreshold />, text: "0", tooltip: "Active Threads", key: "activeThreads" },
    { icon: <Queued />, text: "0/0 bytes", tooltip: "Total queued data", key: "queuedBytes" },
    { icon: <WatsonHealthCdArchive />, text: "0", tooltip: "Transmitting Remote Process Groups", key: "queuedItems1" },
    { icon: "icons/Name=cd--archive--disabled.svg", text: "0", tooltip: "Not Transmitting Remote Process Groups", key: "queuedItems2" },
    { icon: <Play />, text: "0", tooltip: "Running Components", key: "startCount" },
    { icon: <Stop />, text: "0", tooltip: "Stopped Components", key: "stopCount" },
    { icon: <WarningAlt />, text: "0", tooltip: "Invalid Components", key: "queuedItems3" },
    { icon: <FlashOff />, text: "0", tooltip: "Disabled Components", key: "queuedItems4" },
    { icon: <Checkmark />, text: "0", tooltip: "Up to date Versioned Process Groups", key: "queuedItems5" },
    { icon: <Asterisk />, text: "0", tooltip: "Locally modified Versioned Process Groups", key: "queuedItems6" },
    { icon: <ArrowUp />, text: "0", tooltip: "Stale Versioned Process Groups", key: "queuedItems7" },
    { icon: <WarningOther />, text: "0", tooltip: "Locally modified and stale Versioned Process Groups", key: "queuedItems8" },
    { icon: <Help />, text: "0", tooltip: "Sync failure Versioned Groups", key: "queuedItems9" },
    { icon: <Renew />, text: "00:00 IST", tooltip: "Last Refresh", key: "lastUpdated" },
  ],
  reporting: [
    { text: "Listed services are available to all Reporting Tasks, Registry Clients, Parameter Providers...", key: "info" },
    { icon: <Renew />, text: "00:00 IST", tooltip: "Last Refresh", key: "lastUpdated" },
  ],
  services: [
    { icon: <Renew />, text: "00:00 IST", key: "lastUpdated" },
  ],
};
