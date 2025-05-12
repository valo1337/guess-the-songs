# 🎵 Guess the Songs - Music Trivia Game 🎮

## 🌟 Project Overview

**Guess the Songs** is an interactive web-based music trivia game that challenges your musical knowledge and tests your ability to recognize songs quickly!

## 🚀 Features

- 🎧 Guess songs from various genres
- 🏆 Leaderboard to track your progress
- 👤 User authentication
- 📊 Personal statistics tracking

## 🛠 Tech Stack

![Next.js](https://img.shields.io/badge/Next.js-black?style=for-the-badge&logo=next.js&logoColor=white)
![React](https://img.shields.io/badge/React-61DAFB?style=for-the-badge&logo=react&logoColor=black)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white)
![Prisma](https://img.shields.io/badge/Prisma-2D3748?style=for-the-badge&logo=prisma&logoColor=white)
![TailwindCSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)

## 🔧 Project Setup: Step-by-Step Guide

### 1. Prerequisites 🖥️

Before you begin, ensure you have the following installed:
- **Node.js** (v18 or later) 
  - ✅ Check with `node --version`
  - 📥 Download from [Node.js Official Website](https://nodejs.org/)
- **npm** (comes with Node.js)
  - ✅ Check with `npm --version`

### 2. Clone the Repository 📂

```bash
# 🌐 Clone using HTTPS
git clone https://github.com/valo1337/guess-the-songs.git

# 📁 Navigate to project directory
cd guess-the-songs
```

### 3. Install Dependencies 📦

```bash
# 🚀 Install all project dependencies
npm install

# 💡 Tip: This might take a few minutes. Grab a ☕ while you wait!
```

### 4. Set Up Environment 🌍

```bash
# 🗄️ Initialize the database
npx prisma migrate dev

# 🔑 Optional: If you want to seed initial data
npx prisma db seed
```

### 5. Configure Environment Variables 🔐

1. Create a `.env` file in the project root
2. Add the following variables:
```env
# 🔐 Database URL (Prisma)
DATABASE_URL="file:./dev.db"

# 🔑 NextAuth Secret (generate a random string)
NEXTAUTH_SECRET="your_super_secret_key_here"

# 🌐 Your application's URL
NEXTAUTH_URL="http://localhost:3000"
```

### 6. Run the Development Server 🚀

```bash
# 🎮 Start the development server
npm run dev

# 🌐 Open http://localhost:3000 in your browser
```

### 7. Admin Setup (Optional) 👑

```bash
# 🛡️ Install ts-node globally
npm install -g ts-node

# 🔓 Create an admin user
ts-node scripts/set-admin.ts admin@example.com true
```

## 🎮 How to Play

1. 🔐 Sign up or log in
2. 🎵 Start a new game
3. 👂 Listen to song snippets
4. 🤔 Guess the song title and artist
5. 🏆 Earn points and climb the leaderboard!

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 🛠 Troubleshooting

- 🔍 **Dependency Issues**: 
  - Run `npm cache clean --force`
  - Delete `node_modules` folder
  - Run `npm install` again

- 🗄️ **Database Problems**:
  - Delete `prisma/dev.db`
  - Run `npx prisma migrate dev`

## 📊 Game Statistics

![Total Players](https://img.shields.io/badge/Total%20Players-Growing-brightgreen)
![Songs in Database](https://img.shields.io/badge/Songs-100+-blue)

## 📜 License

Distributed under the MIT License. See `LICENSE` for more information.

## 🎵 Enjoy the Music, Enjoy the Game! 🎉
