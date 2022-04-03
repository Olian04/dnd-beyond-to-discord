import * as browser from './browser';
import { omitSensitiveData } from './util/omitSensitiveData';
import { LogMessage } from './type/LogMessage';

const limitStoredLogs = async (numberOfLogsToKeep: number) => {
  const { logs } = (await browser.storage.local.get('logs')) as { logs: LogMessage[] };
  const logsToKeep = logs.slice(Math.max(0, logs.length - numberOfLogsToKeep));
  return browser.storage.local.set({
    logs: logsToKeep,
  });
}

const processMessageParts = (parts: any[]): string => parts.map((v) => {
  if (typeof v === 'object') {
    v = omitSensitiveData(v);
    try {
      return JSON.stringify(v);
    } catch {}
  }
  return String(v);
}).join(' ');

const storeLog = async (log: LogMessage): Promise<void> => {
  const { logs } = (await browser.storage.local.get('logs')) as { logs: LogMessage[] };
  await browser.storage.local.set({
    logs: [...(logs ?? []), log]
  });
  limitStoredLogs(100);
}

export const useLogger = (source: LogMessage['source']) => ({
  info:(...messageParts: any[]) => storeLog({
    type: 'info',
    source,
    timestamp: Date.now(),
    content: processMessageParts(messageParts),
  }),
  error: (...messageParts: any[]) => storeLog({
    type: 'error',
    source,
    timestamp: Date.now(),
    content: processMessageParts(messageParts),
  }),
  warn: (...messageParts: any[]) => storeLog({
    type: 'warning',
    source,
    timestamp: Date.now(),
    content: processMessageParts(messageParts),
  }),
});