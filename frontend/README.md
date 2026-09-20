# CampusShare — Frontend

**สถานะ: ยังไม่เริ่ม** — บล็อกอยู่ที่การรอ `@csmju2030/design-system` (npm package) จาก PM

ตาม "Tech Stack มาตรฐาน" ที่ PM กำหนด เมื่อเริ่มได้แล้วให้ใช้:

- Next.js (App Router)
- TypeScript
- Tailwind CSS
- import `@csmju2030/design-system` สำหรับ UI components/tokens กลาง (ห้ามออกแบบ UI เอง)

**กฎสำคัญจากภาพ Tech Stack มาตรฐาน:** Frontend ห้ามต่อ Database โดยตรงเด็ดขาด ต้องเรียกผ่าน REST API ของ `../backend` เท่านั้น (ดู `backend/README.md`) และต้องอ้างอิง `openapi.json` ที่ generate จาก backend เป็น contract เสมอ ห้ามเขียน API call แบบเดาเอง

ดูสถานะที่รอทั้งหมดใน [`../DECISIONS.md`](../DECISIONS.md) ข้อ 5
