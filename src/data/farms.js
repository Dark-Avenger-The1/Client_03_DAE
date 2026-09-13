// Registered farms, all based in Davao del Norte. Each product in
// data/products.js points at one of these by id. `ownerEmail` links a farm
// to the seller account (in data/accounts.js) that manages it.
const farms = [
  {
    id: 'tagum-greens',
    name: 'Tagum Greens Farm',
    farmerName: 'Mang Julio Ramos',
    ownerEmail: 'seller@demo.com',
    location: 'Tagum City, Davao del Norte',
    rating: 4.8,
    categories: ['Vegetable'],
    prepMinutes: 40,
    deliveryFee: 60,
    description: "Family-run vegetable plots just outside the city center, supplying Tagum's public market for three generations.",
    pickupAddress: 'Purok 5, Barangay Magugpo East, Tagum City, Davao del Norte',
    pickupHours: 'Mon-Sat, 6:00 AM - 4:00 PM',
  },
  {
    id: 'panabo-banana',
    name: 'Panabo Banana Growers',
    farmerName: 'Aling Rosario Mendoza',
    ownerEmail: 'beta@demo.com',
    location: 'Panabo City, Davao del Norte',
    rating: 4.9,
    categories: ['Fruit'],
    prepMinutes: 50,
    deliveryFee: 70,
    description: "Smallholder cooperative in the country's banana capital, growing Cavendish and saba for local buyers, not just export.",
    pickupAddress: 'Barangay J.P. Laurel, Panabo City, Davao del Norte',
    pickupHours: 'Mon-Sat, 6:00 AM - 5:00 PM',
  },
  {
    id: 'samal-orchard',
    name: 'Samal Island Orchard',
    farmerName: 'Kuya Ronnie Dagohoy',
    ownerEmail: null,
    location: 'Island Garden City of Samal, Davao del Norte',
    rating: 4.7,
    categories: ['Fruit'],
    prepMinutes: 90,
    deliveryFee: 100,
    description: 'Orchard plots across Samal growing durian, pomelo, and rambutan, ferried to the mainland each delivery day.',
    pickupAddress: 'Purok 2, Barangay Penaplata, IGACOS, Davao del Norte',
    pickupHours: 'Tue-Sun, 7:00 AM - 4:00 PM',
  },
  {
    id: 'carmen-harvest',
    name: 'Carmen Harvest Farm',
    farmerName: 'Nanay Corazon Villaflor',
    ownerEmail: null,
    location: 'Carmen, Davao del Norte',
    rating: 4.6,
    categories: ['Vegetable', 'Livestock'],
    prepMinutes: 120,
    deliveryFee: 90,
    description: 'Mixed smallholding pairing root-crop and vegetable plots with backyard poultry and goat raising.',
    pickupAddress: 'Sitio Kahayag, Barangay Poblacion, Carmen, Davao del Norte',
    pickupHours: 'Mon-Sat, 6:00 AM - 5:00 PM',
  },
  {
    id: 'kapalong-livestock',
    name: 'Kapalong Livestock Farm',
    farmerName: 'Ka Efren Bantilan',
    ownerEmail: null,
    location: 'Kapalong, Davao del Norte',
    rating: 4.5,
    categories: ['Livestock'],
    prepMinutes: 150,
    deliveryFee: 110,
    description: 'Free-range poultry and pasture-raised hogs on the foothills outside Kapalong town proper.',
    pickupAddress: 'Barangay Mabantao, Kapalong, Davao del Norte',
    pickupHours: 'Tue-Sun, 6:00 AM - 3:00 PM',
  },
];

export function getFarmById(id) {
  return farms.find((f) => f.id === id);
}

export default farms;