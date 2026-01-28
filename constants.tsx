
import { HistoricalEra } from './types';

export const ERAS: HistoricalEra[] = [
  {
    id: 'egypt',
    name: 'Ancient Egypt',
    description: 'Walk like a Pharaoh in the shadow of the Great Pyramids.',
    prompt: 'Place this person in Ancient Egypt, standing in front of the Great Sphinx and Pyramids of Giza. They should be wearing ornate royal Egyptian attire, linen robes, and gold jewelry. 4k resolution, cinematic lighting.',
    image: 'https://images.unsplash.com/photo-1503177119275-0aa32b3a9368?auto=format&fit=crop&q=80&w=400',
    // Using standard royalty-free placeholders or well-hosted direct links
    musicUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3'
  },
  {
    id: 'renaissance',
    name: 'The Renaissance',
    description: 'Become a masterpiece in Da Vinci’s Florence studio.',
    prompt: 'A classic oil painting portrait of the person in the photo as a 16th-century Italian noble. Background is a Renaissance studio with marble sculptures. High detail brush strokes, Caravaggio lighting.',
    image: 'https://images.unsplash.com/photo-1549490349-8643362247b5?auto=format&fit=crop&q=80&w=400',
    musicUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3'
  },
  {
    id: 'roaring20s',
    name: 'The Roaring 20s',
    description: 'Jazz, glitz, and glamour in a secret speakeasy.',
    prompt: 'The person in the photo at a 1920s Gatsby-style party. Wearing a vintage tuxedo or flapper dress with feathers. Black and white photo with slight film grain, glamorous art deco club background.',
    image: 'https://images.unsplash.com/photo-1514525253344-f814d0c9e48d?auto=format&fit=crop&q=80&w=400',
    musicUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3'
  },
  {
    id: 'space-race',
    name: 'The Space Race',
    description: 'One small step onto the moon’s lunar surface.',
    prompt: 'The person in the photo as an Apollo 11 astronaut on the moon. Wearing a NASA spacesuit with the visor open to see their face. The Earth is visible in the dark starry sky behind them.',
    image: 'https://images.unsplash.com/photo-1446776811953-b23d57bd21aa?auto=format&fit=crop&q=80&w=400',
    musicUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3'
  },
  {
    id: 'cyberpunk',
    name: 'Neon Future',
    description: 'Venture into the high-tech, low-life year 2099.',
    prompt: 'A cyberpunk portrait of the person. Neon lights reflecting off high-tech cybernetic enhancements. Background is a rainy Tokyo-inspired mega-city with flying cars. Vibrant pink and blue palette.',
    image: 'https://images.unsplash.com/photo-1605810230434-7631ac76ec81?auto=format&fit=crop&q=80&w=400',
    musicUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-8.mp3'
  },
  {
    id: 'vikings',
    name: 'Age of Vikings',
    description: 'Sail the fjords in a dragon-headed longship.',
    prompt: 'The person in the photo as a legendary Viking warrior. Wearing fur-lined leather armor, holding a circular shield. Dramatic fjord landscape in Norway, mist and morning light.',
    image: 'https://images.unsplash.com/photo-1547447134-cd3f5c716030?auto=format&fit=crop&q=80&w=400',
    musicUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-15.mp3'
  }
];