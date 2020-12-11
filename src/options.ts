import { render } from 'brynja';

chrome.storage.sync.get((data) => {
  render(_=>_
    .child('center', _=>_
      .child('p', _=>_
        .text('Find out how to generate a webhook ')
        .child('a', _=>_
          .text('here!')
          .prop('href', 'https://support.discord.com/hc/en-us/articles/228383668-Intro-to-Webhooks')
        )
      )
      .child('input', _=>_
        .prop('type', 'text')
        .value(data.hookURL || '')
        .prop('placeholder', 'Paste a webhook URL here...')
        .style({
          width: '100vw',
        })
        .on('change', (ev) => {
          const newURL = ev.target.value;
          chrome.storage.sync.set({
            hookURL: newURL,
          });
        })
      )
    )
  );
});