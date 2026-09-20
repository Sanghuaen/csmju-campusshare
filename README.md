# CampusShare

ระบบแบ่งปัน/ยืม-คืนอุปกรณ์ สาขาวิทยาการคอมพิวเตอร์ มหาวิทยาลัยแม่โจ้
เป็น 1 subsystem ใน **CSMJU2030** (org: `csmju2030`)

> เอกสารนี้เขียนไว้ตั้งแต่ต้น (ไม่ใช่เขียนย้อนหลังตอนใกล้จบ) เพื่อให้ใครก็ตามที่รับช่วงดูแลต่อ
> เข้าใจระบบได้เร็วที่สุด — ดูหลักการ "handover พร้อมใช้ตั้งแต่วันแรก"

## Tech Stack

- Backend: NestJS + TypeScript
- Database: PostgreSQL + Prisma ORM
- Frontend: **ยังไม่เริ่ม** — รอ `@csmju2030/design-system` (npm package) จาก PM ก่อน (ดู DECISIONS.md ข้อ 4)

## โครงสร้าง repo

```
csmju-campusshare/       ← ชื่อต้องตรงกับ repo/subsystem_name เป๊ะ (data-dictionary.md ข้อ 4)
├── subsystem.yaml        ← เมตาดาต้าของทั้ง subsystem อยู่ root เสมอ
├── README.md / DECISIONS.md
├── backend/               ← NestJS API (ดูรายละเอียดด้านล่าง)
└── frontend/              ← ยังไม่เริ่ม รอ design-system package (ดู frontend/README.md)
```

## เริ่มต้นใช้งาน (dev) — backend

```bash
cd backend
npm install
cp .env.example .env   # แล้วแก้ DATABASE_URL ให้ตรงเครื่อง
npm run prisma:generate
npm run prisma:migrate  # สร้างตารางใน DB จาก prisma/schema.prisma
npm run start:dev
```

- Health check: `GET http://localhost:3000/health`
- ทุก endpoint อื่นอยู่ใต้ `/api/v1/...`

## โครงสร้างของ backend/src

```
backend/src/
  common/          # envelope interceptor, exception filter, auth guard/decorator ที่ใช้ร่วมกันทุก module
  prisma/          # PrismaService — จุดเดียวที่ถือ DB connection (ตามกฎ tech stack)
  health/          # GET /health (บังคับตาม api-conventions.md)
  listings/        # ลงของ, ค้นหา, เปิด/ปิดรายการ
  borrow-requests/ # ขอยืม, อนุมัติ/ปฏิเสธ, แจ้งคืน
  reports/         # ผู้ใช้ทั่วไปรายงานปัญหา (self-service) — Admin ดูเฉพาะที่ถูก flag
  admin/           # Admin สาขา: ดูสถิติ, ดูรายการมีปัญหา, ปิดเรื่อง report, ดู overdue
  notifications/   # แจ้งเตือนในระบบ (in-app) — layer หลักที่ไม่พึ่งพา service ภายนอก
  tasks/           # cron job อัตโนมัติ (auto-expire, auto-flag overdue, auto-archive)
```

## ทดสอบ API ด้วย Postman

Import `backend/postman-collection.json` เข้า Postman — มีครบทั้ง flow (ลงของ → ขอยืม → อนุมัติ →
รายงานปัญหา → ดู stats/reports ฝั่ง Admin) พร้อม header จำลอง Gateway (`X-User-Id`, `X-Layer1-Role`,
`X-Faculty`) เพราะ dev environment ไม่มี Gateway จริงคั่นกลาง — **โปรดักชันจริง client จะแนบ header
พวกนี้เองไม่ได้ Gateway เท่านั้นที่แนบให้**

หรือรัน `npm run prisma:seed` เพื่อสร้างข้อมูลตัวอย่าง (listing, คำขอที่ pending/overdue, report ค้าง)
ให้มีอะไรให้ดูตั้งแต่แรก ไม่ต้องสร้างเองทีละอันผ่าน Postman

## หลักการออกแบบที่ต้องรักษาไว้ (อย่าลืมตอนแก้โค้ดทีหลัง)

1. **Envelope มาตรฐาน** — ทุก response ต้องผ่าน `EnvelopeInterceptor`/`AllExceptionsFilter` ห้าม return response แบบไม่ห่อเอง
2. **error.code มีแค่ 6 ค่า** (`UNAUTHORIZED, FORBIDDEN, NOT_FOUND, VALIDATION_ERROR, CONFLICT, INTERNAL_ERROR`) — ห้ามสร้างค่าใหม่เอง ถ้าจำเป็นต้องเสนอ PM3 ก่อน (ดู `backend/src/common/exceptions/app.exception.ts`)
3. **ห้ามมี verb ใน URL path** — เปลี่ยนสถานะทุกอย่างผ่าน `PATCH` + field `status` ใน body เท่านั้น
4. **Backend เป็นจุดเดียวที่ถือ DB connection** — ห้าม frontend/service อื่นต่อ DB ตรง ต้องผ่าน REST API เท่านั้น (กฎจาก Tech Stack มาตรฐาน)
5. **Fail-safe by default** — ทุก state ที่รอ action จากคน ต้องมีทางออกอัตโนมัติกำกับไว้เสมอ (ดู `backend/src/tasks/tasks.service.ts`) ระบบต้องอยู่รอดได้แม้ไม่มีใครเฝ้า
6. **Role ผูกกับตำแหน่งไม่ใช่ตัวบุคคล** — `default_role_mapping: staff → admin` ใน `subsystem.yaml` ทำให้อาจารย์ที่ปรึกษาคนไหนก็ได้สิทธิ์ Admin อัตโนมัติ ไม่ผูกกับชื่อคนเดิม
7. **External integration (เช่น LINE ของเพื่อน) เป็นแค่ส่วนเสริม** — ต้อง fail เงียบๆ ถ้าเรียกไม่สำเร็จ ห้ามกระทบ flow หลัก (ดู `NotificationsService.tryExternalPush`)
8. **Layer 2 role mapping ต้องซิงก์กัน 2 ที่เสมอ** — `backend/src/common/roles/role-mapping.ts` (โค้ดจริงที่ตัดสินสิทธิ์) กับ `subsystem.yaml` (เอกสารประกาศให้ PM รู้) แก้ที่หนึ่งต้องแก้อีกที่ด้วย ไม่งั้นสิทธิ์จริงกับที่ประกาศไว้จะไม่ตรงกัน

## สิ่งที่ยังค้างอยู่ / รอคำตอบจากภายนอก

ดูรายละเอียดทั้งหมดใน [`DECISIONS.md`](./DECISIONS.md) — อย่าลืมอัปเดตโค้ดตามเมื่อได้คำตอบแล้ว

## การส่งต่อ (Handover)

ถ้าคุณกำลังรับช่วงดูแลระบบนี้ต่อ:

1. อ่านไฟล์นี้ + `DECISIONS.md` ทั้งหมดก่อน
2. เช็คสิทธิ์ Admin ของคุณ — ควรได้อัตโนมัติถ้า `layer1_role = staff` (อาจารย์/เจ้าหน้าที่) หรือขอ exception ผ่าน PL ถ้าเป็นนักศึกษารุ่นต่อไป
3. เช็คว่า `.env` (โดยเฉพาะ `DATABASE_URL`, `CORE_CLIENT_ID/SECRET`) ถูกตั้งค่าใหม่ให้ตรงกับ environment ปัจจุบัน
