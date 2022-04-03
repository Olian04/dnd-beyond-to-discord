import { render, createComponent, createStyles } from 'brynja';
import * as browser from './browser';
import { LogMessage } from './type/LogMessage';
import { copyTextToClipboard } from './util/copyToClipboard';

const sourceColorMap: { [k in LogMessage['source']]: string } = {
  contentScript: 'orangered',
  optionsPage: 'blue',
  popupPage: 'hotpink',
  viewLogsPage: 'red',
};

const typeColorMap: { [k in LogMessage['type']]: string } = {
  info: 'grey',
  warning: 'magenta',
  error: 'red',
};

const wrapWithBrackets = createStyles({
  ':before': {
    content: '"["',
  },
  ':after': {
    content: '"]"',
  }
});

const displayLogLine = createComponent((log: LogMessage) => _=>_
  .child('div', _=>_
    .style({
      display: 'flex',
      gap: '5px',
    })
    .child('span', _=>_
      .style(wrapWithBrackets)
      .style({
        color: 'grey',
      })
      .text(log.timestamp)
    )
    .child('span', _=>_
      .style(wrapWithBrackets)
      .style({
        color: sourceColorMap[log.source],
      })
      .text(log.source)
    )
    .child('span', _=>_
      .style(wrapWithBrackets)
      .style({
        color: typeColorMap[log.type],
      })
      .text(log.type)
    )
    .child('span', _=>_
      .text(log.content)
    )
  )
);

const displayLogs = createComponent((logs: LogMessage[], isLoading: boolean) => _=>_
  .child('pre', _=>_
    .style({
      display: 'flex',
      flexDirection: 'column',
      background: 'rgba(0,0,0,0.05)',
      overflowY: 'scroll',
      height: 'calc(100% - 16px)',
      padding: '8px',
    })
    .when(isLoading, _=>_
      .child('span', _=>_
        .text('Loading...')
      ),
      _=>_
      .when(logs.length === 0, _=>_
        .child('span', _=>_
          .text('No logs found.')
        )
      )
    )
    .while(i => i < logs.length, (_,i)=>_
      .do(displayLogLine(logs[i]))
    )
  )
);

const renderPage = (allLogs: LogMessage[], isLoading: boolean) => {
  render(_=>_
    .style({
      display: 'flex',
      flexDirection: 'column',
    })
    .child('div', _=>_
      .style({
        position: 'relative',
        height: '40px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        padding: '8px',
        boxSizing: 'border-box',
      })
      .child('button', _=>_
        .text('Copy logs to clipboards')
        .on('click', async () => {
          await copyTextToClipboard(JSON.stringify(allLogs));
          alert(`${allLogs.length} logs copied to clipboard`);
        })
      )
    )
    .child('div', _=>_
      .style({
        position: 'relative',
        height: 'calc(100vh - 40px)'
      })
      .do(displayLogs(allLogs, isLoading))
    )  
  );
}
renderPage([], true);

const loadLogs = async () => {
  const { logs } = (await browser.storage.local.get('logs')) as { logs: LogMessage[] };
  renderPage(logs, false);
}

// Update viewLogs page live when new logs are added
browser.storage.onChanged.addListener((changes, areaName) => {
  if (areaName !== 'local') { /* Change was not made in local storage */  return; }
  if (!('logs' in changes)) { /* Change was not a log */ return; }
  if (changes['logs'].newValue === undefined) { /* Log was deleted */return; }
  loadLogs();
});

loadLogs();
