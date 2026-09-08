// Registered farms. Each product in data/products.js points at one of these by id.
const farms = [
  {
    id: 'santos-organics',
    name: 'Santos Organics',
    farmerName: 'Mang Ricardo Santos',
    location: 'Silang, Cavite',
    rating: 4.9,
    categories: ['Vegetable', 'Fruit'],
    prepMinutes: 45,
    deliveryFee: 60,
    description:
      'Third-generation organic farm growing leafy greens and highland fruit without synthetic pesticides.',
    pickupAddress: 'Sitio Balubad, Barangay Munting Ilog, Silang, Cavite',
    pickupHours: 'Mon–Sat, 6:00 AM – 4:00 PM',
  },
  {
    id: 'dela-cruz',
    name: 'Dela Cruz Fruit Grove',
    farmerName: 'Aling Marites Dela Cruz',
    location: 'Guimaras',
    rating: 4.8,
    categories: ['Fruit'],
    prepMinutes: 70,
    deliveryFee: 80,
    description: 'Famous mango grove shipping sun-ripened fruit within 24 hours of harvest.',
    pickupAddress: 'Barangay Salvacion, Jordan, Guimaras',
    pickupHours: 'Daily, 7:00 AM – 5:00 PM',
  },
  {
    id: 'highland-greens',
    name: 'Highland Greens Co-op',
    farmerName: 'Kuya Ben Alonzo',
    location: 'La Trinidad, Benguet',
    rating: 4.7,
    categories: ['Vegetable'],
    prepMinutes: 120,
    deliveryFee: 120,
    description:
      'A 26-family cooperative harvesting cool-climate vegetables in the Cordillera highlands.',
    pickupAddress: 'Km. 5 Trading Post, Betag, La Trinidad, Benguet',
    pickupHours: 'Mon–Sat, 5:00 AM – 2:00 PM',
  },
  {
    id: 'villamor',
    name: 'Villamor Livestock Farm',
    farmerName: 'Ka Dodong Villamor',
    location: 'San Jose, Batangas',
    rating: 4.6,
    categories: ['Livestock'],
    prepMinutes: 180,
    deliveryFee: 150,
    description: 'Free-range poultry and pasture-raised hogs, humanely raised and inspected.',
    pickupAddress: 'Barangay Palanca, San Jose, Batangas',
    pickupHours: 'Tue–Sun, 6:00 AM – 3:00 PM',
  },
  {
    id: 'reyes',
    name: 'Reyes Family Farm',
    farmerName: 'Nanay Puring Reyes',
    location: 'Tarlac City, Tarlac',
    rating: 4.5,
    categories: ['Vegetable', 'Livestock'],
    prepMinutes: 150,
    deliveryFee: 100,
    description: 'Mixed smallholding pairing rice-field vegetables with backyard goat and poultry stock.',
    pickupAddress: 'Barangay Matatalaib, Tarlac City, Tarlac',
    pickupHours: 'Mon–Sat, 6:00 AM – 5:00 PM',
  },
  {
    id: 'bukid-tropikal',
    name: 'Bukid Tropikal',
    farmerName: 'Sir Elmer Pascual',
    location: 'Davao del Sur',
    rating: 4.8,
    categories: ['Fruit', 'Vegetable'],
    prepMinutes: 200,
    deliveryFee: 130,
    description: 'Tropical orchard and vegetable plots at the foot of Mt. Apo.',
    pickupAddress: 'Purok 4, Barangay Darong, Santa Cruz, Davao del Sur',
    pickupHours: 'Daily, 6:00 AM – 6:00 PM',
  },
];

export function getFarmById(id) {
  return farms.find((f) => f.id === id);
}

export default farms;
