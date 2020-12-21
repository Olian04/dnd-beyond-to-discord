import * as browser from './browser';

console.log(browser);

type RollType = 'check' | 'save' | 'roll' | 'to hit' | 'damage' | 'heal';
interface RollData {
  type: RollType;
  ability: string;
  rollString: string;
  rollResults: string;
  rollSum: string;
  rollMod: string;
}

const Color = {
  check: parseInt('0x8359EE'),
  save: parseInt('0x6CBF5B'),
  roll: parseInt('0xF5A623'),
  'to hit': parseInt('0x1B9AF0'),
  damage: parseInt('0xD54F4F'),
  heal: parseInt('0x6CBF5B'),
}

const Abilities = {
  str: 'Strength',
  dex: 'Dexterity',
  con: 'Constitution',
  int: 'Intelligence',
  wis: 'Wisdom',
  cha: 'Charisma',
}

interface Embed {
  title: string;
  color: number;
  description: string;
  fields: {
    name: string;
    value: string;
    inline: boolean;
  }[];
}

let characterName: string;
let characterAvatarURL: string;

const sendHook = (embed: Embed) => {
  const headers = new Headers();
  headers.set('Content-Type', 'application/json');

  embed['timestamp'] =  new Date().toISOString();

  console.info('BeyondDiscord: Attempting to send roll', embed);

  return new Promise((resolve) => {
    browser.storage.sync.get((data) => {
      if (data.hookURL === undefined) {
        console.info('BeyondDiscord: No webhook found. Interrupting.');
        return;
      }
      resolve(fetch(data.hookURL + '?wait=true', {
        method: 'POST',
        mode: 'cors',
        cache: 'no-cache',
        headers,
        body: JSON.stringify({
          embeds: [
            embed
          ],
          username: characterName,
          avatar_url: characterAvatarURL
        }),
      })
      );
    })
  })
    .then((res) => {
      console.info('BeyondDiscord: Successfully sent roll', res);
    })
    .catch((err) => {
      console.warn('BeyondDiscord: Failed to send roll', err);
    });
}

const handleRoll = (roll: RollData) => {
  sendHook({
    color: Color[roll.type] || 0,
    title: `${Abilities[roll.ability] || roll.ability} *${roll.type}*`,
    description: `**${roll.rollString}** `+
    (roll.rollMod ? `*${roll.rollMod}*` : '')+
    '\n```haskell\n'+
    `${roll.rollResults} = ${roll.rollSum}\n`+
    '```',
    fields: [],
  });
}

const parseRoll = ($diceResult: HTMLDivElement): RollData => {
  const type = $diceResult
    .querySelector('.dice_result__rolltype')
    .innerHTML as RollType;

  let ability = $diceResult
    .querySelector('.dice_result__info__rolldetail')
    .innerHTML;
  ability = ability.substring(0, ability.length - 2); // Remove trailing :

  const rollResults = $diceResult
    .querySelector('.dice_result__info__breakdown')
    .innerHTML;
  
  const rollString = $diceResult
    .querySelector('.dice_result__info__dicenotation')
    .innerHTML
    .replace(/kh1|kl1/img, ''); // Removing garbage added by advantage or disadvantage rolls

  const rollSum = $diceResult
    .querySelector('.dice_result__total-result')
    .innerHTML;

  const rollMod = ($diceResult
    .querySelector('.dice_result__total-header')
    ?.innerHTML) || null;
  
  return {
    type,
    ability,
    rollString,
    rollResults,
    rollSum,
    rollMod,
  }
}

const findLatestRoll = ($notifyLayout: HTMLDivElement): HTMLDivElement => {
  const $notifyBars = $notifyLayout.querySelectorAll('.noty_bar');
  const $notifyBody = $notifyBars
    .item($notifyBars.length-1)
    .querySelector('.noty_body');
  
  const $diceResult = $notifyBody.querySelector('.dice_result');
  return $diceResult as HTMLDivElement;
};

const handlePotentialRoll = ($notifyLayout: HTMLDivElement) => {
    const $roll = findLatestRoll($notifyLayout);
    if ($roll.getAttribute('beyondDiscord_STATUS') === 'sent') return;
    $roll.setAttribute('beyondDiscord_STATUS', 'sent');
    const roll = parseRoll($roll);
    handleRoll(roll);
}

// Step 1: Create a new MutationObserver object
const observer = new MutationObserver((muts) => {
  const mut = muts[0];
  handlePotentialRoll(mut.target as HTMLDivElement);
});

const notifyLayoutObserver = new MutationObserver((muts) => {
  const notifyField = (muts[0].target as HTMLDivElement)
    .querySelector('.noty_layout') as HTMLDivElement;

  if (notifyField === null) return;

  // Get character information
  characterName = document.querySelector('.ddbc-character-name')
    .innerHTML;

  const $characterAvatar = document.querySelector('.ddbc-character-avatar__portrait') as HTMLDivElement;
  characterAvatarURL = $characterAvatar.style.backgroundImage
    .substring(5, $characterAvatar.style.backgroundImage.length - 2);

  // Handle initial roll
  handlePotentialRoll(notifyField);

  // Step 2: Observe a DOM node with the observer as callback
  try {
    // Disconnect observer if there is one
    observer.disconnect();
  } catch {};
  observer.observe(notifyField, {
    childList: true
  }); 
});

notifyLayoutObserver.observe(document.querySelector('body'), {
  childList: true,
});