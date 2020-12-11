import { render } from 'brynja';

const kButtonColors = ['#3aa757', '#e8453c', '#f9bb2d', '#4688f1'];

render(_=>_
  .children('button', kButtonColors.length, (_,i)=>_
    .style({
      backgroundColor: kButtonColors[i],
    })
    .on('click', () => {
      chrome.storage.sync.set({color: kButtonColors[i]}, function() {
        console.log('color is ' + kButtonColors[i]);
      })
    })
  )  
)