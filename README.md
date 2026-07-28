This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Тулгарсан асуудал, бэрхшээл

Gemini API-г төсөлтэй холбох, хиймэл оюун ухааны үүсгэсэн мэдээллийг зөв бүтэцтэй авах, хэрэглэгчийн нэвтрэлтийг хэрэгжүүлэх, PostgreSQL өгөгдлийн сантай холбох зэрэг бэрхшээл тулгарсан.

## Асуудлыг хэрхэн шийдвэрлэсэн бэ?

Gemini API-аас JSON хэлбэрийн хариулт авч, Zod ашиглан өгөгдлийг шалгасан. Асуулт бүр дөрвөн сонголттой, нэг зөв хариулттай эсэхийг баталгаажуулсан. Clerk ашиглан нэвтрэлтийн систем хийж, database transaction ашиглан мэдээллийг найдвартай хадгалсан.

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

## Hiisen ajluudiin daraalal

### 1. Next.js tusliin suuriig uusgesen

Next.js 16, React 19, TypeScript ashiglasan. Tailwind CSS, ESLint-iin tohirgoog hiisen. Anhnii layout, page, global style bolon public asset-uudiig uusgesen.

### 2. Shaardlagatai sanguudiig suulgasan

- `@clerk/nextjs` — hereglegchiin nevtrelt
- `@google/genai` — Gemini AI
- `pg` — PostgreSQL holbolt
- `zod` — ugugdul shalgah
- `shadcn`, `lucide-react` — UI component bolon icon

### 3. Database buttsiig hiisen

PostgreSQL deer:

- `users` — hereglegchid
- `articles` — oruulsan niitlel bolon AI summary
- `quizzes` — asuult, songolt, zuv hariult
- `quiz_attempts` — hereglegchiin ugsun hariult bolon onoo

gesen husnegtuudiig uusgesen. Mun hailtiig hurdan bailgah index bolon holbootoi ugugdliig avtomataar ustgah `ON DELETE CASCADE` tohirgoo nemsen.

### 4. Clerk authentication holboson

Nevtreh, burtguuleh tovch hiisen. Nevtreagui hereglegchiig API ashiglah bolomjgui bolgoson. Clerk hereglegchiig PostgreSQL-iin `users` husnegttei avtomataar holboson. Mun route hamgaalah proxy tohiruulsan.

### 5. PostgreSQL holbolt hiisen

`DATABASE_URL` ashiglan connection pool uusgesen. Database ajillaj baigaa esehiig shalgah health API nemsen.

### 6. Gemini AI integrats hiisen

Hereglegchiin oruulsan niitleliig Gemini ruu yavuulj:

- Tovch huraangui gargah
- Yag 5 asuult uusgeh
- Asuult burd 4 songolt gargah
- Zuv hariultiig todorhoiloh
- Niitleltei ijil heleer ur dun gargah

logik hiisen. AI-iin butsaasan JSON zuv butetstei esehiig Zod-oor shalgadag bolgoson.

### 7. Article API hiisen

- `GET /api/articles` — hereglegchiin niitleliin tuuh avah
- `POST /api/articles` — niitlel oruulj summary bolon quiz uusgeh
- `GET /api/articles/[id]` — neg niitleliin delgerengui medeelel avah

AI-iin ur dung database-d transaction ashiglan hadgaldag. Aldaa garval buh uurchlultiig rollback hiideg bolgoson.

### 8. Quiz hariu shalgah API hiisen

Hereglegchiin songoson hariultuudiig zuv hariulttai haritsuuldag. Niit onoog tootsoolj, asuult buriin zuv buruu ur dung butsaadag. Mun oroldlogiig `quiz_attempts` husnegted hadgaldag bolgoson.

### 9. Undsen UI hiisen

- Niitleliin garchig oruulah talbar
- Niitleliin aguulga oruulah textarea
- Generate tovch
- Loading bolon error tuluv
- AI summary haruulah heseg
- Quiz asuult bolon songoltuud
- Quiz submit bolon onoo
- Zuv, buruu hariultiin temdeglee

### 10. History sidebar hiisen

Umnuh niitleluudiig jagsaaj haruuldag. Niitlel buriin ognoo bolon asuultiin toog haruuldag. Umnuh ur dung dahin neej boldog. Shine niitlel ehluuleh tovchtoi. Gar utas deer Sheet helbereer neegddeg bolgoson.

### 11. Responsive design bolon UI zasvar hiisen

Desktop bolon mobile delgetsend tohiroh layout hiisen. Shadcn UI component-uud nemsen. Light bolon dark theme-d tohiroh CSS variable ashiglasan. Mun sidebar-iin Tailwind animation class-iin aldaag zassan.
