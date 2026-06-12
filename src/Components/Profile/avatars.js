// Avatars gaming — style illustré via DiceBear adventurer (personnages colorés et distincts)
const BASE = "https://api.dicebear.com/9.x";

// Avatar exclusif admin — non disponible dans la liste normale
export const ADMIN_AVATAR = {
  id: "admin_exclusive",
  name: "Admin ◈",
  url: "https://api.dicebear.com/9.x/adventurer/svg?seed=NextGenAdmin&backgroundColor=dd163b&eyebrows=variant01&eyes=variant01&hair=long07&skinColor=f2d3b1",
};

export const GAMING_AVATARS = [
  // Adventurer style — personnages RPG colorés
  { id: "knight",      name: "Chevalier",     url: `${BASE}/adventurer/svg?seed=Knight&backgroundColor=b91c1c` },
  { id: "ranger",      name: "Rôdeuse",       url: `${BASE}/adventurer/svg?seed=Ranger&backgroundColor=15803d` },
  { id: "wizard",      name: "Sorcier",       url: `${BASE}/adventurer/svg?seed=Wizard&backgroundColor=1d4ed8` },
  { id: "rogue",       name: "Voleuse",       url: `${BASE}/adventurer/svg?seed=Rogue&backgroundColor=7e22ce` },
  { id: "paladin",     name: "Paladin",       url: `${BASE}/adventurer/svg?seed=Paladin&backgroundColor=a16207` },
  { id: "assassin",    name: "Assassin",      url: `${BASE}/adventurer/svg?seed=Assassin&backgroundColor=111827` },
  { id: "necromancer", name: "Nécromancien",  url: `${BASE}/adventurer/svg?seed=Necromancer&backgroundColor=3b0764` },
  { id: "berserker",   name: "Berserker",     url: `${BASE}/adventurer/svg?seed=Berserker&backgroundColor=7f1d1d` },
  { id: "druid",       name: "Druide",        url: `${BASE}/adventurer/svg?seed=Druid&backgroundColor=14532d` },
  { id: "bard",        name: "Barde",         url: `${BASE}/adventurer/svg?seed=Bard&backgroundColor=0c4a6e` },
  { id: "hunter",      name: "Chasseuse",     url: `${BASE}/adventurer/svg?seed=Hunter&backgroundColor=064e3b` },
  { id: "monk",        name: "Moine",         url: `${BASE}/adventurer/svg?seed=Monk&backgroundColor=713f12` },
  { id: "warlock",     name: "Ensorceleur",   url: `${BASE}/adventurer/svg?seed=Warlock&backgroundColor=1e1b4b` },
  { id: "shaman",      name: "Chamane",       url: `${BASE}/adventurer/svg?seed=Shaman&backgroundColor=4a1942` },
  { id: "warrior",     name: "Guerrière",     url: `${BASE}/adventurer/svg?seed=Warrior&backgroundColor=881337` },
  { id: "alchemist",   name: "Alchimiste",    url: `${BASE}/adventurer/svg?seed=Alchemist&backgroundColor=365314` },
  { id: "pirate",      name: "Pirate",        url: `${BASE}/adventurer/svg?seed=Pirate&backgroundColor=7c2d12` },
  { id: "vampire",     name: "Vampire",       url: `${BASE}/adventurer/svg?seed=Vampire&backgroundColor=500724` },
  { id: "cyborg",      name: "Cyborg",        url: `${BASE}/adventurer/svg?seed=Cyborg2077&backgroundColor=0f172a` },
  { id: "samurai",     name: "Samouraï",      url: `${BASE}/adventurer/svg?seed=Samurai&backgroundColor=450a0a` },
];