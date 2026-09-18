// Seed accounts for the pitch demo, so nobody has to sign up live on stage.
// AuthContext seeds these into localStorage (key: 'dae_accounts') once, only
// if no accounts exist yet — it never overwrites real accounts someone
// actually signed up with.
//
// Same shape AuthContext already expects: { name, email, password, role, points }.
// `farmId` is additive — AuthContext doesn't read it, but it's what lets a
// seller account be matched back to its farm in data/farms.js.

const accounts = [
  {
    name: 'Juan Dela Cruz',
    email: 'buyer@demo.com',
    password: 'demo1234',
    role: 'buyer',
    points: 600,
  },
  {
    name: 'The Weekend Farmers',
    email: 'seller@demo.com',
    password: 'demo1234',
    role: 'seller',
    farmId: 'weekend-farmers',
  },
  {
    name: "Yamie's Hydroponic Farm",
    email: 'beta@demo.com',
    password: 'demo1234',
    role: 'seller',
    farmId: 'yamies-hydroponic',
  },
];

export default accounts;