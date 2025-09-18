// backend/services/mood_service.js

/**
 * Mood-based destination recommender
 * Uses static curated Indian destinations per mood,
 * but can later be extended with ML/NLP if needed.
 */

const moodDestinations = {
  relaxed: [
    { name: "Goa", state: "Goa", highlights: ["Beaches", "Resorts", "Sunsets"] },
    { name: "Kerala Backwaters", state: "Kerala", highlights: ["Houseboats", "Ayurveda", "Nature"] },
    { name: "Pondicherry", state: "Tamil Nadu", highlights: ["French Colony", "Beach cafes"] },
  ],
  adventure: [
    { name: "Manali", state: "Himachal Pradesh", highlights: ["Trekking", "Paragliding"] },
    { name: "Rishikesh", state: "Uttarakhand", highlights: ["River Rafting", "Camping"] },
    { name: "Leh-Ladakh", state: "Jammu & Kashmir", highlights: ["Bike Trip", "Mountains"] },
  ],
  romantic: [
    { name: "Udaipur", state: "Rajasthan", highlights: ["Lake Pichola", "Palaces"] },
    { name: "Munnar", state: "Kerala", highlights: ["Tea Estates", "Hillscapes"] },
    { name: "Shimla", state: "Himachal Pradesh", highlights: ["Snowy Hills", "Mall Road"] },
  ],
  "cultural-heritage": [
    { name: "Varanasi", state: "Uttar Pradesh", highlights: ["Ghats", "Temples", "Ganga Aarti"] },
    { name: "Hampi", state: "Karnataka", highlights: ["UNESCO Ruins", "Temples"] },
    { name: "Jaipur", state: "Rajasthan", highlights: ["Forts", "Palaces", "Culture"] },
  ],
  party: [
    { name: "Goa", state: "Goa", highlights: ["Beach Parties", "Nightlife"] },
    { name: "Mumbai", state: "Maharashtra", highlights: ["Pubs", "Bollywood"] },
    { name: "Bangalore", state: "Karnataka", highlights: ["Clubs", "Live Music"] },
  ],
  "flower-and-valleys": [
    { name: "Valley of Flowers", state: "Uttarakhand", highlights: ["National Park", "Trekking"] },
    { name: "Tulip Garden", state: "Srinagar", highlights: ["Tulips", "Dal Lake"] },
    { name: "Kaas Plateau", state: "Maharashtra", highlights: ["UNESCO Site", "Seasonal Flowers"] },
  ],
};

/**
 * Recommend destinations based on mood and optional travel type.
 */
exports.recommendDestinations = async (mood, travelType) => {
  const list = moodDestinations[mood.toLowerCase()] || [];
  if (travelType) {
    // simple filter if needed
    return list.filter((d) => d.highlights.join(" ").toLowerCase().includes(travelType.toLowerCase()));
  }
  return list;
};
