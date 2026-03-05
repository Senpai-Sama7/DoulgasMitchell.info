# Douglas Mitchell - Personal Website

Modern personal blog and portfolio built with Next.js 16, featuring sophisticated animations, database-backed content management, and a secure admin portal.

## Quick Start

```bash
# Install dependencies
npm install

# Set up database
npm run db:push
npm run db:seed

# Run development server
npm run dev
```

Visit `http://localhost:3000`

## Admin Portal

Access the admin portal at `/admin` with password: `senpai2024` (change in `.env`)

## Environment Variables

Create a `.env` file with:
```
ADMIN_PASSWORD=your-secure-password
JWT_SECRET=your-jwt-secret
DATABASE_URL="file:./db/custom.db"
```

## Deployment

### Vercel (Recommended)
1. Push to GitHub
2. Import project in Vercel
3. Add environment variables
4. Deploy

### Build for Production
```bash
npm run build
npm start
```

## Features

- 🎨 Sophisticated animations and interactions
- 📸 Gallery with masonry layout and lightbox
- 📝 Journal with markdown support
- 📧 Contact form with validation
- 🔐 Secure admin portal
- 🗄️ Database-backed content (Prisma + SQLite)
- 🌙 Dark/light mode
- 📱 Fully responsive

## Tech Stack

- Next.js 16 (App Router)
- React 19
- TypeScript
- Tailwind CSS 4
- Prisma ORM
- Framer Motion
- shadcn/ui

---

Built with ❤️ by Douglas Mitchell
