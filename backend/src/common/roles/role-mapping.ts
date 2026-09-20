import { GatewayUser } from '../middleware/gateway-auth.middleware';

export type Layer2Role = 'student' | 'admin';

/**
 * ⚠️ ต้องตรงกับ default_role_mapping ใน subsystem.yaml (root ของ repo) เสมอ
 * ถ้าแก้ที่นี่ ต้องไปแก้ subsystem.yaml ด้วย (และกลับกัน) — คนละไฟล์แต่ต้องซิงก์กันเอง
 * เพราะ subsystem.yaml เป็นแค่ "เอกสารประกาศ" ให้ PM รู้ ส่วนโค้ดนี้คือ "ของจริง" ที่ตัดสินสิทธิ์
 */
const DEFAULT_ROLE_MAPPING: Record<GatewayUser['layer1Role'], Layer2Role> = {
  student: 'student',
  staff: 'admin', // อาจารย์/เจ้าหน้าที่ = Admin สาขา โดยอัตโนมัติ (ผูกตำแหน่งไม่ผูกคน)
  alumni: 'student',
  admin: 'admin', // Layer1 admin (ระดับมหาวิทยาลัย) ได้สิทธิ์สูงสุดในทุก subsystem ด้วย
};

/**
 * ⚠️ ต้องตรงกับ requested_exceptions ใน subsystem.yaml เช่นกัน
 * รายชื่อนี้คือคนที่ได้สิทธิ์นอกเหนือ default (ต้องผ่าน PM อนุมัติแล้วเท่านั้น — ดู data-dictionary.md ข้อ 2)
 */
const ROLE_EXCEPTIONS: Record<string, Layer2Role> = {
  // '<username ของ AIE เจ้าของระบบ>': 'admin',  // TODO: ใส่ username จริงหลังขึ้นทะเบียน subsystem.yaml แล้ว
};

export function resolveLayer2Role(user: GatewayUser): Layer2Role {
  return ROLE_EXCEPTIONS[user.username] ?? DEFAULT_ROLE_MAPPING[user.layer1Role] ?? 'student';
}

export function isAdmin(user: GatewayUser): boolean {
  return resolveLayer2Role(user) === 'admin';
}
