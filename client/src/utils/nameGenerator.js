const adjectives = [
  'Silent', 'Stealthy', 'Hidden', 'Secret', 'Ghost', 'Shadow',
  'Masked', 'Veiled', 'Quiet', 'Hushed', 'Mysterious', 'Phantom',
  'Cunning', 'Ninja', 'Crypto', 'Private', 'Incognito', 'Dark'
];

const animals = [
  'Fox', 'Owl', 'Badger', 'Panda', 'Koala', 'Falcon', 'Lynx',
  'Panther', 'Otter', 'Rabbit', 'Wolf', 'Eagle', 'Ferret', 'Raccoon',
  'Cheetah', 'Dolphin', 'Tiger', 'Bear', 'Jaguar', 'Hawk', 'Leopard'
];

export function generateAnonymousName() {
  const adj = adjectives[Math.floor(Math.random() * adjectives.length)];
  const animal = animals[Math.floor(Math.random() * animals.length)];
  const number = Math.floor(Math.random() * 90) + 10; // 10 to 99
  return `${adj}${animal}${number}`;
}
