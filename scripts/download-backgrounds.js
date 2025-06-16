const https = require('https');
const fs = require('fs');
const path = require('path');

const backgroundsDir = path.join(__dirname, '..', 'public', 'backgrounds');

// Create backgrounds directory if it doesn't exist
if (!fs.existsSync(backgroundsDir)) {
  fs.mkdirSync(backgroundsDir, { recursive: true });
}

const backgrounds = [
  {
    name: 'forest.jpg',
    url: 'https://images.pexels.com/photos/240040/pexels-photo-240040.jpeg'
  },
  {
    name: 'ocean.jpg',
    url: 'https://images.pexels.com/photos/1295138/pexels-photo-1295138.jpeg'
  },
  {
    name: 'mountain.jpg',
    url: 'https://images.pexels.com/photos/361104/pexels-photo-361104.jpeg'
  },
  {
    name: 'space.jpg',
    url: 'https://images.pexels.com/photos/1169754/pexels-photo-1169754.jpeg'
  }
];

backgrounds.forEach(bg => {
  const filePath = path.join(backgroundsDir, bg.name);
  const file = fs.createWriteStream(filePath);

  https.get(bg.url, response => {
    response.pipe(file);
    file.on('finish', () => {
      file.close();
      console.log(`Downloaded ${bg.name}`);
    });
  }).on('error', err => {
    fs.unlink(filePath);
    console.error(`Error downloading ${bg.name}:`, err.message);
  });
});