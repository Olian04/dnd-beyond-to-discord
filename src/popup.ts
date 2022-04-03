import { render } from 'brynja';
import * as browser from './browser';
import { useLogger } from './logger';

const logger = useLogger('popupPage');

const openOptionsPage = () => {
  logger.info('Opening options page');
  // Clicking the extension icon should open the options page
  browser.runtime.openOptionsPage(() => {
    window.close();
  });
}

const update = () => {
  browser.storage.sync.get((data) => {
    logger.info('Rendering', data);
    render(_=>_
      .child('center', _=>_
        .child('button', _=>_
          .text('Enable')
          .style({
            width: '200px',
          })
          .when(!data.disabled, _=>_
            .prop('disabled', 'true')
          )
          .on('click', () => {
            logger.info('Extension enabled');
            browser.storage.sync.set({
              ...data,
              disabled: false,
            });
            update();
          })
        )
        .child('button', _=>_
          .text('Disable')
          .style({
            width: '200px',
          })
          .when(data.disabled, _=>_
            .prop('disabled', 'true')
          )
          .on('click', () => {
            logger.info('Extension disabled');
            browser.storage.sync.set({
              ...data,
              disabled: true,
            });
            update();
          })
        )
        .child('hr', _=>_)
        .child('button', _=>_
          .text('Configure')
          .style({
            width: '200px'
          })
          .on('click', () => {
            openOptionsPage();
          })
        )
      )
    )
  });
}

update();
