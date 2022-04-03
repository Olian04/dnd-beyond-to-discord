export type LogMessage = {
  type: 'info' | 'error' | 'warning';
  source: 'contentScript' | 'optionsPage' | 'popupPage' | 'viewLogsPage';
  timestamp: number,
  content: string;
}
