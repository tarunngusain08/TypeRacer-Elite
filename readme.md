# TypeRacer Elite

TypeRacer Elite is an engaging and competitive typing game where players can challenge themselves and compete with others worldwide. The game offers real-time racing, progress tracking, and global rankings to enhance the typing experience.

## Features

- **Real-time Racing**: Compete with players worldwide in real-time typing races.
- **Track Progress**: Monitor your Words Per Minute (WPM) and accuracy with detailed statistics.
- **Global Rankings**: Climb the leaderboard and become the typing champion.
- **Animated Backgrounds**: Enjoy visually appealing animated backgrounds while playing.
- **Responsive Design**: Optimized for both desktop and mobile devices.

## Pages

### Landing Page

The landing page introduces the game and provides options to log in or sign up.

```tsx
// filepath: /Users/radhakrishna/GolandProjects/TypeRacer-Elite/frontend/src/pages/Landing.tsx
// ...existing code...
<motion.h1 
  className="text-6xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400"
  whileHover={{ scale: 1.02 }}
>
  TypeRacer Elite
</motion.h1>
// ...existing code...
<motion.p 
  className="text-xl text-gray-300 mb-12 max-w-2xl mx-auto"
  initial={{ opacity: 0 }}
  animate={{ opacity: 1 }}
  transition={{ delay: 0.3 }}
>
  Challenge yourself and compete with players worldwide in the ultimate typing race experience
</motion.p>
// ...existing code...
```

### Home Page

The home page welcomes authenticated users and provides access to game features and statistics.

```tsx
// filepath: /Users/radhakrishna/GolandProjects/TypeRacer-Elite/frontend/src/pages/Home.tsx
// ...existing code...
<motion.h1 
  className="text-5xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400"
  whileHover={{ scale: 1.02 }}
>
  TypeRacer Elite
</motion.h1>
// ...existing code...
<motion.p 
  className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto"
  initial={{ opacity: 0 }}
  animate={{ opacity: 1 }}
  transition={{ delay: 0.3 }}
>
  Challenge yourself and compete with players worldwide in the ultimate typing race experience
</motion.p>
// ...existing code...
```

## Installation

1. Clone the repository:
   ```sh
   git clone https://github.com/yourusername/TypeRacer-Elite.git
   ```
2. Navigate to the project directory:
   ```sh
   cd TypeRacer-Elite
   ```
3. Install dependencies for the frontend:
   ```sh
   cd frontend
   npm install
   ```
4. Install dependencies for the backend:
   ```sh
   cd ../backend
   npm install
   ```

## Usage

1. Start the backend server:
   ```sh
   cd backend
   npm start
   ```
2. Start the frontend development server:
   ```sh
   cd ../frontend
   npm start
   ```
3. Open your browser and navigate to `http://localhost:3001`.

## Contributing

Contributions are welcome! Please fork the repository and create a pull request with your changes.

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.

