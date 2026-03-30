# CopyAudit.ai

AI-powered landing page copy auditor for B2B SaaS. Paste your URL, get scored feedback on contrast, specificity, anxiety defusal, JTBD alignment, and CTA clarity.

## Features

- **5 Dimension Scoring**: Contrast, Specificity, Anxiety Defusal, JTBD Alignment, CTA Clarity
- **AI Analysis**: Powered by GPT-4o with prompts based on 6 master copywriting frameworks
- **Line-by-Line Feedback**: Specific examples from your copy
- **Top 3 Recommendations**: Prioritized improvements
- **Copy Gold**: Your best performing section identified

## Tech Stack

- **Frontend**: Next.js 14, React, Tailwind CSS, shadcn/ui
- **Backend**: Next.js API Routes
- **Database**: Neon PostgreSQL (Prisma ORM)
- **Auth**: NextAuth.js
- **AI**: OpenAI GPT-4o

## Getting Started

1. Clone the repository
2. Install dependencies: `npm install`
3. Set up environment variables (see `.env.local.example`)
4. Push database schema: `npx prisma db push`
5. Run development server: `npm run dev`

## Environment Variables

```env
DATABASE_URL="postgresql://..."
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret"
OPENAI_API_KEY="sk-..."
```

## Deploy

Deployed on Vercel with Neon PostgreSQL.

## License

MIT
