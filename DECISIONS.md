# Decisions & Open Questions Log

บันทึกทุกจุดที่ตัดสินใจไปแล้ว และจุดที่ยังรอคำตอบจากภายนอก (PL/PM/เพื่อนทีมอื่น)
เพื่อไม่ให้หลุดลืมตอนแก้โค้ดทีหลัง หรือตอนส่งต่อให้คนอื่นดูแล

## 🔴 รอคำตอบจาก PL/PM

### 1. field `department` ไม่มีใน JWT/Header จริง
- **ปัญหา:** `data-dictionary.md` นิยาม `department` ไว้ แต่ `auth-contract.md` (JWT payload + Gateway header) ไม่มีจริง มีแค่ `faculty` (ระดับคณะ)
- **ผลกระทบ:** ตอนนี้กรองผู้ใช้ได้แค่ระดับ "คณะวิทยาศาสตร์" ไม่ใช่ระดับ "สาขา CS" — คนคณะวิทย์สาขาอื่นก็เข้าระบบได้
- **สถานะปัจจุบันในโค้ด:** hardcode `department = "computer-science"` ไว้ที่ `ListingsService` จุดเดียว (`CURRENT_DEPARTMENT`) เตรียม field ไว้ใน schema แล้ว รอแค่เปลี่ยนค่าที่มาเมื่อได้คำตอบ
- **เมื่อได้คำตอบแล้ว:** แก้แค่จุดเดียวใน `backend/src/listings/listings.service.ts` (และเพิ่ม field เดียวกันใน `GatewayUser` ถ้า Core ส่งมาจริง)

### 2. เกณฑ์ผู้ดูแลระยะยาว (sustainability) ของทั้งโปรเจกต์
- **ปัญหา:** AIE เจ้าของระบบทุกคนจะเรียนจบไปในที่สุด ยังไม่มีนโยบายกลางว่าใครรับช่วงดูแล ~50 ระบบย่อยต่อ
- **สถานะปัจจุบันในโค้ด:** ออกแบบ role ให้ผูกกับตำแหน่ง (`staff → admin`) ไม่ผูกกับชื่อคน ลดผลกระทบเบื้องต้น แต่ยังไม่ใช่ทางออกเชิงนโยบายเต็มรูปแบบ

### 3. มาตรฐานการเรียก API ข้าม subsystem (inter-subsystem call)
- **ปัญหา:** เอกสารมาตรฐาน 3 ไฟล์ที่มี ไม่ได้พูดถึงว่า subsystem เรียกกันเองได้ไหม/ต้องผ่าน gateway ยังไง/ใช้ auth แบบไหน
- **บริบท:** อยากเรียกระบบแจ้งเตือน LINE ของเพื่อน (อีก subsystem หนึ่ง) เป็นส่วนเสริม
- **สถานะปัจจุบันในโค้ด:** `NotificationsService.tryExternalPush()` เป็น placeholder เปล่าไว้ก่อน ยังไม่ implement จนกว่าจะรู้มาตรฐานที่ชัดเจน

## 🟡 รอข้อมูลจากเพื่อน/ทีมอื่น (ไม่ block เรา)

### 4. เพื่อนใช้ LINE Notify หรือ LINE Messaging API (LINE OA)?
- LINE Notify **ปิดให้บริการไปแล้วตั้งแต่ 31 มี.ค. 2025** ถ้าเพื่อนบอกว่าใช้ LINE Notify ต้องถามใหม่ให้ชัดว่าจริงๆ ใช้ Messaging API + LINE OA (ต้องมี userId ของผู้รับ + ผู้ใช้ต้องแอดเพื่อนก่อน) — วิธีเชื่อมต่อต่างจากเดิมมาก

### 5. Design System package (`@csmju2030/design-system`) จาก PM
- ยังไม่ได้รับ — Frontend ยังเริ่มไม่ได้จนกว่าจะได้ package จริง
- Tech stack ที่กำหนดไว้แล้ว (จากภาพ "Tech Stack มาตรฐาน"): Next.js (App Router) + TypeScript + Tailwind CSS

## 🟢 ตัดสินใจไปแล้ว (ทีมเราเองตัดสินใจได้ ไม่ต้องรอใคร)

- **ไม่มี** ระบบแชทในตัวเว็บ, ระบบ Rating, ระบบรายงานของหาย/เสียหาย ใน MVP
- Listing 2 ประเภท: `borrow` (ต้องคืน) / `giveaway` (ให้ฟรี)
- หมวดหมู่ของแบบ fix ตายตัว 7 หมวด (ดู `ListingCategory` enum ใน `prisma/schema.prisma`)
- คำขอ pending ที่เจ้าของไม่ตอบภายใน 3 วัน → auto-expire
- Listing ที่ไม่มีความเคลื่อนไหวนานเกิน 6 เดือน → auto-archive
- Role "Admin สาขา" ผูกกับตำแหน่ง (`staff`) เป็นค่า default + เปิด exception ให้ผู้ดูแลปฏิบัติการเฉพาะกิจได้
  (⚠️ ยังไม่ได้ใส่ username จริงใน `ROLE_EXCEPTIONS` เพราะยังไม่ได้ขึ้นทะเบียน subsystem.yaml — ใส่ทีหลังตอนได้อนุมัติจาก PM)
- Notification ต้องมี in-app layer เป็นหลักเสมอ external service (เช่น LINE) เป็นแค่ส่วนเสริมที่ fail เงียบๆ ได้
- **Report/flag ระบบตรวจสอบปัญหาเป็นแบบ self-service** — ผู้ใช้ทั่วไป (`POST /reports`) รายงาน, Admin เห็นเฉพาะที่เปิดอยู่ (`GET /admin/reports`) ไม่ต้องไล่ตรวจทุกรายการเอง
- Admin endpoints ทั้งหมดอยู่ใต้ `/api/v1/admin/*` คุมด้วย `AdminGuard` (เช็ค Layer 2 role = admin ผ่าน `role-mapping.ts`)
