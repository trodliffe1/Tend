export interface DateIdea {
  id: string;
  title: string;
  description: string;
  category: 'home' | 'going-out' | 'adventure' | 'quick';
}

export const dateIdeas: DateIdea[] = [
  // Home dates
  { id: '1', title: 'Cook Together', description: 'Pick a new recipe and make it together from scratch', category: 'home' },
  { id: '2', title: 'Movie Marathon', description: 'Watch a trilogy or themed movies with snacks', category: 'home' },
  { id: '3', title: 'Game Night', description: 'Board games, card games, or video games together', category: 'home' },
  { id: '4', title: 'Spa Night', description: 'Face masks, massages, and relaxation at home', category: 'home' },
  { id: '5', title: 'Stargazing', description: 'Set up blankets in the backyard and watch the stars', category: 'home' },
  { id: '6', title: 'Indoor Picnic', description: 'Spread a blanket indoors with fancy finger foods', category: 'home' },
  { id: '7', title: 'Photo Album Night', description: 'Go through old photos together and share memories', category: 'home' },
  { id: '8', title: 'Learn Something New', description: 'Watch a tutorial and try a new skill together', category: 'home' },
  { id: '9', title: 'Puzzle Night', description: 'Work on a jigsaw puzzle together with music', category: 'home' },
  { id: '10', title: 'Wine & Paint', description: 'Set up canvases and paint while enjoying drinks', category: 'home' },

  // Going out dates
  { id: '11', title: 'Fancy Dinner', description: 'Dress up and try a nice restaurant', category: 'going-out' },
  { id: '12', title: 'Live Music', description: 'Find a local concert, jazz bar, or open mic', category: 'going-out' },
  { id: '13', title: 'Museum Visit', description: 'Explore an art, history, or science museum', category: 'going-out' },
  { id: '14', title: 'Comedy Show', description: 'Catch a stand-up comedy performance', category: 'going-out' },
  { id: '15', title: 'Farmers Market', description: 'Browse the market and pick ingredients for dinner', category: 'going-out' },
  { id: '16', title: 'Bookstore Date', description: 'Pick out books for each other to read', category: 'going-out' },
  { id: '17', title: 'Dancing', description: 'Go dancing or take a dance class together', category: 'going-out' },
  { id: '18', title: 'Escape Room', description: 'Work together to solve puzzles and escape', category: 'going-out' },
  { id: '19', title: 'Food Tour', description: 'Try multiple restaurants in a neighborhood', category: 'going-out' },
  { id: '20', title: 'Bowling Night', description: 'Old school fun with friendly competition', category: 'going-out' },

  // Adventure dates
  { id: '21', title: 'Hiking Trip', description: 'Explore a new trail with a packed lunch', category: 'adventure' },
  { id: '22', title: 'Road Trip', description: 'Pick a direction and drive somewhere new', category: 'adventure' },
  { id: '23', title: 'Camping', description: 'Set up a tent and enjoy nature together', category: 'adventure' },
  { id: '24', title: 'Kayaking', description: 'Rent kayaks and paddle on a lake or river', category: 'adventure' },
  { id: '25', title: 'Zip Lining', description: 'Get your adrenaline pumping together', category: 'adventure' },
  { id: '26', title: 'Hot Air Balloon', description: 'Soar above the landscape for a unique view', category: 'adventure' },
  { id: '27', title: 'Bike Ride', description: 'Explore a scenic bike path together', category: 'adventure' },
  { id: '28', title: 'Beach Day', description: 'Sun, sand, and waves for a relaxing adventure', category: 'adventure' },
  { id: '29', title: 'Rock Climbing', description: 'Try indoor climbing and support each other', category: 'adventure' },
  { id: '30', title: 'Sunrise Hike', description: 'Wake up early and catch the sunrise together', category: 'adventure' },

  // Quick dates
  { id: '31', title: 'Coffee Date', description: 'Meet at a cozy cafe for conversation', category: 'quick' },
  { id: '32', title: 'Ice Cream Walk', description: 'Get ice cream and take a walk together', category: 'quick' },
  { id: '33', title: 'Sunset Watch', description: 'Find a nice spot and watch the sunset', category: 'quick' },
  { id: '34', title: 'Lunch Date', description: 'Break from work for lunch together', category: 'quick' },
  { id: '35', title: 'Morning Walk', description: 'Start the day with a walk and chat', category: 'quick' },
  { id: '36', title: 'Dessert Date', description: 'Split a fancy dessert at a bakery', category: 'quick' },
  { id: '37', title: 'Window Shopping', description: 'Browse stores together without pressure to buy', category: 'quick' },
  { id: '38', title: 'Park Hangout', description: 'Bring a blanket and relax in the park', category: 'quick' },
  { id: '39', title: 'Drive-Thru Adventure', description: 'Get food and park somewhere scenic to eat', category: 'quick' },
  { id: '40', title: 'Photo Walk', description: 'Take pictures of each other around the neighborhood', category: 'quick' },
];

export const categoryLabels = {
  home: 'Home',
  'going-out': 'Going Out',
  adventure: 'Adventure',
  quick: 'Quick',
};

export function getRandomDateIdea(category?: DateIdea['category']): DateIdea {
  const filtered = category
    ? dateIdeas.filter(idea => idea.category === category)
    : dateIdeas;
  return filtered[Math.floor(Math.random() * filtered.length)];
}
