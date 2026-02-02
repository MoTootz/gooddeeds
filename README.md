# GoodDeeds - Community Help Network

A modern social web application where local communities can offer and request help (physical assistance, monetary support, goods, mentoring, etc.). Built with Next.js, TypeScript, Tailwind CSS, and PostgreSQL.

## Features

✅ **User Authentication** - Secure signup/login with JWT tokens
✅ **Create Posts** - Share offers or requests for help
✅ **Browse Posts** - Filter by type (offer/request) and category
✅ **Database Integration** - PostgreSQL with Prisma ORM
✅ **Type Safe** - Full TypeScript support
✅ **Responsive Design** - Mobile-friendly Tailwind CSS styling

## Help Categories

- **Physical Help** - Moving, repairs, yard work, construction
- **Monetary** - Financial assistance or fundraising
- **Goods/Items** - Offering or requesting items
- **Mentoring/Skills** - Teaching skills or learning from experts
- **Other** - Miscellaneous assistance

## Tech Stack

| Layer | Technology |
|-------|------------|
| **Frontend** | Next.js 14, React 18, TypeScript |
| **Styling** | Tailwind CSS |
| **Backend** | Next.js API Routes |
| **Database** | PostgreSQL 15 |
| **ORM** | Prisma |
| **Authentication** | JWT (JSON Web Tokens) |
| **Password Hashing** | bcrypt |

## Project Structure

```
gooddeeds/
├── src/
│   ├── app/                          # Next.js App Router
│   │   ├── api/
│   │   │   └── auth/                 # Authentication endpoints
│   │   │       ├── login/route.ts
│   │   │       └── signup/route.ts
│   │   │   └── posts/route.ts        # Posts CRUD endpoints
│   │   ├── create/page.tsx           # Create new post page
│   │   ├── login/page.tsx            # Login page
│   │   ├── posts/page.tsx            # Browse posts page
│   │   ├── signup/page.tsx           # Signup page
│   │   ├── layout.tsx                # Root layout
│   │   ├── page.tsx                  # Home page
│   │   └── globals.css               # Global styles
│   ├── components/                   # Reusable React components
│   ├── lib/
│   │   ├── prisma.ts                 # Prisma client
│   │   └── useAuth.ts                # Auth hook
│   └── types/index.ts                # TypeScript definitions
├── prisma/
│   ├── schema.prisma                 # Database schema
│   └── migrations/                   # Database migrations
├── public/                           # Static assets
├── docker-compose.yml                # Docker PostgreSQL setup
├── .env.local                        # Environment variables
├── package.json                      # Dependencies
├── tsconfig.json                     # TypeScript config
└── tailwind.config.ts                # Tailwind config
```

## Quick Start

### Prerequisites

- **Node.js 18+** - Download from https://nodejs.org/
- **Docker** - For PostgreSQL database (optional, can use local PostgreSQL)
- **Git** - For version control

### Installation (Windows)

1. **Install Node.js**
   - Download from https://nodejs.org/ (LTS version recommended)
   - Run the installer and follow prompts
   - Restart your computer

2. **Start Docker Container**
   ```powershell
   docker-compose -f docker-compose.yml up -d
   ```

3. **Install Dependencies**
   ```powershell
   cd C:\Users\muham\OneDrive\Documents\Projects\gooddeeds
   npm install
   ```

4. **Generate Prisma Client**
   ```powershell
   npx prisma generate
   ```

5. **Set Up Database**
   ```powershell
   npx prisma migrate deploy
   ```
   
   If that doesn't work, try:
   ```powershell
   npx prisma migrate reset --force
   ```

6. **Start Development Server**
   ```powershell
   npm run dev
   ```

7. **Open Application**
   - Visit http://localhost:3000 in your browser
   - You should see the GoodDeeds home page

### One-Command Setup (Windows)

Run the setup script:
```powershell
.\setup.bat
```

### One-Command Setup (macOS/Linux)

Make the script executable and run:
```bash
chmod +x setup.sh
./setup.sh
```

## Using the Application

### 1. Create an Account
- Click "Sign Up Now" or go to http://localhost:3000/signup
- Enter your name, email, and password
- Click "Sign Up"
- You'll be automatically logged in and redirected to posts page

### 2. Browse Posts
- Visit http://localhost:3000/posts
- See all community posts
- Filter by:
  - **All** - View everything
  - **Offers** - People offering help
  - **Requests** - People requesting help

### 3. Create a Post
- Go to http://localhost:3000/create
- Fill in:
  - **Title** - Brief summary (e.g., "Free math tutoring")
  - **Description** - Detailed information
  - **Type** - Offer or Request
  - **Category** - Physical, monetary, goods, mentoring, or other
- Click "Create Post"

### 4. View Your Profile
- User information is stored in your browser's localStorage
- Authentication token is valid for 7 days

## API Endpoints

### Authentication

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/auth/signup` | Create new account |
| `POST` | `/api/auth/login` | Login and get JWT token |

### Posts

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/posts` | Fetch all posts |
| `POST` | `/api/posts` | Create new post (requires auth) |

### Request Headers

For authenticated endpoints, include:
```
Authorization: Bearer YOUR_JWT_TOKEN
Content-Type: application/json
```

## Database Schema

### User Table
```sql
User {
  id: String (primary key)
  email: String (unique)
  password: String (hashed)
  name: String
  bio: String (optional)
  avatar: String (optional)
  location: String (optional)
  createdAt: DateTime
  updatedAt: DateTime
  posts: Post[]
  comments: Comment[]
  messages: Message[]
}
```

### Post Table
```sql
Post {
  id: String (primary key)
  title: String
  description: String
  type: String ('offer' or 'request')
  category: String
  status: String ('active', 'completed', 'closed')
  authorId: String (foreign key)
  author: User
  comments: Comment[]
  createdAt: DateTime
  updatedAt: DateTime
}
```

## Useful Commands

```powershell
# Run development server
npm run dev

# Build for production
npm build

# Start production server
npm start

# Check for linting errors
npm run lint

# Open Prisma Studio (database UI)
npx prisma studio

# Reset database (WARNING: deletes all data)
npx prisma migrate reset

# Generate Prisma client
npx prisma generate
```

## Environment Variables

The `.env.local` file contains:

```env
DATABASE_URL="postgresql://gooddeeds_user:gooddeeds_password@localhost:5432/gooddeeds"
JWT_SECRET="your_jwt_secret_key_here_please_change_in_production"
NEXT_PUBLIC_API_URL="http://localhost:3000/api"
NODE_ENV="development"
```

## Troubleshooting

### "Cannot find module '@/lib/prisma'"
```powershell
npx prisma generate
```

### "ECONNREFUSED - Connection refused"
PostgreSQL is not running. Start Docker:
```powershell
docker-compose up -d
```

### "Port 3000 already in use"
Next.js will automatically try ports 3001, 3002, etc.

### "Database error during migration"
Reset the database:
```powershell
npx prisma migrate reset --force
```

### Login/Signup not working
1. Check browser console for errors (F12)
2. Verify `.env.local` has correct DATABASE_URL
3. Ensure PostgreSQL container is running
4. Clear browser cache and localStorage

## Development Tips

### Using Prisma Studio
View and manage your database visually:
```powershell
npx prisma studio
```

### Hot Reload
Changes to your code automatically reload in the browser - no manual refresh needed!

### Browser DevTools
- Open F12 to access developer tools
- Check Network tab to see API calls
- Check Console for errors

### Adding New Features

1. **Update Prisma Schema** - Edit `prisma/schema.prisma`
2. **Create Migration** - Run `npx prisma migrate dev --name feature_name`
3. **Create API Route** - Add file in `src/app/api/`
4. **Create UI Component** - Add file in `src/app/` or `src/components/`

## Future Enhancements

- [ ] User profiles with bio and avatar
- [ ] Messaging system between users
- [ ] Rating/review system
- [ ] Post comments and replies
- [ ] Image uploads for posts
- [ ] Notification system
- [ ] Search and advanced filtering
- [ ] Location-based filtering
- [ ] Post status updates (active, completed, closed)
- [ ] Email notifications
- [ ] Social media sharing

## Deployment

### Deploy to Vercel (Recommended)

1. Push to GitHub
2. Go to https://vercel.com/
3. Connect your GitHub repository
4. Set environment variables in Vercel dashboard
5. Deploy!

### Deploy to Other Platforms

- Railway
- Render
- AWS
- Digital Ocean
- Heroku

## Learning Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [React Documentation](https://react.dev)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [Prisma Documentation](https://www.prisma.io/docs/)
- [PostgreSQL Tutorial](https://www.postgresql.org/docs/manuals/)
- [JWT Authentication](https://jwt.io/introduction)

## Security Notes

⚠️ **Important for Production:**

1. Change `JWT_SECRET` in `.env.local`
2. Use environment variables for sensitive data
3. Implement CORS properly
4. Add rate limiting
5. Validate all user inputs
6. Use HTTPS in production
7. Hash passwords (already implemented with bcrypt)
8. Implement refresh tokens for JWT
9. Add request validation
10. Consider 2FA for sensitive operations

## License

MIT License - Feel free to use this project for personal or commercial purposes.

## Support

For questions or issues:
1. Check the [Troubleshooting](#troubleshooting) section
2. Review [Learning Resources](#learning-resources)
3. Check application logs in browser console (F12)

---

**Happy Coding! 🚀**

Remember: Building community through helping each other! 💚

