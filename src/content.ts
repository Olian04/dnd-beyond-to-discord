import * as browser from './browser';
import { useLogger } from './logger';
import { Embed } from './type/Embed';
import { RollData } from './type/RollData';
import { RollType } from './type/RollType';

const logger = useLogger('contentScript');

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

let characterName: string;
let characterAvatarURL: string;

const sendHook = (embed: Embed) => {
  const headers = new Headers();
  headers.set('Content-Type', 'application/json');

  embed['timestamp'] =  new Date().toISOString();
  
  return new Promise((resolve) => {
    browser.storage.sync.get((data) => {
      if (data.disabled) {
        logger.info('Interrupting roll because extension is disabled.');
        return;
      }
      if (typeof data.hookURL !== 'string' || data.hookURL.trim().length === 0) {
        logger.info('Interrupting roll because no webhook was found.');
        return;
      }
      logger.info('Attempting to send roll', embed);
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
    .then((resp: Response) => {
      if (resp.ok) {
        logger.info(`Successfully sent roll (response code: ${resp.status})`);
      } else {
        logger.error(`Failed to send roll (response code: ${resp.status})`);
      }
    })
    .catch((err) => {
      logger.error('Failed to send roll', err);
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

const parseDiceResults = ($diceResult: HTMLDivElement): RollData => {
  try {
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
  } catch (err) {
    logger.error('Failed to parse dice results', err);
    throw err;
  }
}

const findLatestRoll = ($notifyLayout: HTMLDivElement): HTMLDivElement => {
  try {
    const $notifyBars = $notifyLayout.querySelectorAll('.noty_bar');
    const $notifyBody = $notifyBars
      .item($notifyBars.length-1)
      .querySelector('.noty_body');
    
    const $diceResult = $notifyBody.querySelector('.dice_result');
    return $diceResult as HTMLDivElement;
  } catch (err) {
    logger.error('Failed to find latest roll', err);
    throw err;
  }
};

const handlePotentialRoll = ($notifyLayout: HTMLDivElement) => {
  try {
    const $roll = findLatestRoll($notifyLayout);
    if ($roll.getAttribute('beyondDiscord_STATUS') === 'sent') return;
    $roll.setAttribute('beyondDiscord_STATUS', 'sent');
    const roll = parseDiceResults($roll);
    handleRoll(roll);
  } catch (err) {
    logger.error('Failed to handle potential roll', err);
    throw err;
  }
}

const extractCharacterInformation = () =>{
  try {
  const characterName = document.querySelector('.ddbc-character-name').innerHTML;
  const $characterAvatar = document.querySelector('.ddbc-character-avatar__portrait') as HTMLDivElement;
  const characterAvatarURL = $characterAvatar.style.backgroundImage
    .substring(5, $characterAvatar.style.backgroundImage.length - 2);
    
  return {
    characterName,
    characterAvatarURL,
  }
  } catch (err) {
    logger.error('Failed to extract character information');
    throw err;
  }
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
  const characterInfo = extractCharacterInformation();
  characterName = characterInfo.characterName;
  characterAvatarURL = characterInfo.characterAvatarURL;
  logger.info(`Found character "${characterName}"`);

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
