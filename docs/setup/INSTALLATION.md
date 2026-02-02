# Installation Guide for GoodDeeds

## Quick Start with Docker & Node.js

### Step 1: Install Node.js
Visit https://nodejs.org/ and download the LTS version for your operating system.

### Step 2: Verify Installation
Open PowerShell and run:
```powershell
node --version
npm --version
```

You should see version numbers displayed.

### Step 3: Install Dependencies
Navigate to the project folder and run:
```powershell
cd C:\Users\muham\OneDrive\Documents\Projects\gooddeeds
npm install
```

### Step 4: Start PostgreSQL Database
The Docker container should already be running. If not, start it:
```powershell
docker-compose -f docker-compose.yml up -d
```

### Step 5: Set Up Database
Initialize the database with Prisma:
```powershell
npx prisma migrate dev --name init
```

This will:
- Create all database tables
- Generate Prisma client

### Step 6: Run Development Server
Start the Next.js dev server:
```powershell
npm run dev
```

### Step 7: Open Application
Visit http://localhost:3000 in your browser.

## Testing the Application

### 1. Create an Account
- Click "Sign Up Now" or navigate to http://localhost:3000/signup
- Fill in your details
- Submit to create account

### 2. Login
- Go to http://localhost:3000/login
- Use your email and password

### 3. Create a Post
- Click "Create Post"
- Fill in the form with:
  - Title: What you're offering or requesting
  - Description: More details
  - Type: Offer or Request
  - Category: Physical help, monetary, etc.
- Submit

### 4. View Posts
- Visit http://localhost:3000/posts
- Filter by type (All, Offers, Requests)

## Database Management

### View Database
To browse your database visually:
```powershell
npx prisma studio
```

### Reset Database
To clear and re-initialize:
```powershell
npx prisma migrate reset
```

## Troubleshooting

### Port Already in Use
If port 3000 is in use, Next.js will automatically use 3001, 3002, etc.

### Database Connection Failed
1. Verify Docker container is running: `docker ps`
2. Check .env.local has correct DATABASE_URL
3. Ensure PostgreSQL is accessible on localhost:5432

### Module Not Found Errors
Run `npm install` again to ensure all dependencies are installed.

### Prisma Client Not Generated
Run: `npx prisma generate`

## Next Development Steps

- [ ] Implement user profile pages
- [ ] Add messaging between users
- [ ] Create notification system
- [ ] Add image uploads for posts
- [ ] Implement rating/review system
- [ ] Deploy to production (Vercel)
