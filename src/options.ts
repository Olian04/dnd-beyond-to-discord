import { render } from 'brynja';
import * as browser from './browser';
import { useLogger } from './logger';

const logger = useLogger('optionsPage');

browser.storage.sync.get((data) => {
  logger.info('Rendering', data);
  render(_=>_
    .style({
      display: 'flex',
      flexDirection: 'column',
      width: '100vw',
      padding: '8px',
      margin: '0px',
    })
    .child('h3', _=>_
      .text('Webhook')
    )
    .child('p', _=>_
      .style({
        marginTop: '0px',
      })
      .text('Find out how to generate a webhook ')
      .child('a', _=>_
        .text('here!')
        .prop('href', 'https://support.discord.com/hc/en-us/articles/228383668-Intro-to-Webhooks')
      )
    )
    .child('label', _=>_
      .text('Webhook URL: ')
      .child('input', _=>_
        .prop('type', 'text')
        .value(data.hookURL || '')
        .prop('placeholder', 'Paste a webhook URL here...')
        .style({
          width: '100%',
        })
        .on('change', (ev) => {
          logger.info('Hook URL changed');
          const newURL = ev.target.value;
          browser.storage.sync.set({
            hookURL: newURL,
          });
        })
      )
    )
    .child('hr', _=>_)
    .child('h3', _=>_
        .text('Logs')
    )
    .child('div', _=>_
      .style({
        display: 'flex',
        gap: '8px',
      })
      .child('button', _=>_
        .text('Show Logs')
        .on('click', () => {
          logger.info('Opening viewLogs page');
          browser.tabs.create({
            url: browser.runtime.getURL('./viewLogs.html'),
            active: true,
          });
        })
      )
    )
  );
});
