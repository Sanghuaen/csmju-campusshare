import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// username สมมติสำหรับ dev/test เท่านั้น (รูปแบบตรงตาม data-dictionary.md: รหัสนักศึกษา)
const USERS = {
  owner1: '65123456', // เจ้าของสาย HDMI + หนังสือ
  owner2: '65654321', // เจ้าของกล้อง
  borrower1: '66111222',
  borrower2: '66333444',
};

async function main() {
  console.log('เริ่ม seed ข้อมูลตัวอย่าง...');

  // ล้างข้อมูลเก่าก่อน (เรียงตาม foreign key)
  await prisma.report.deleteMany();
  await prisma.notification.deleteMany();
  await prisma.borrowRequest.deleteMany();
  await prisma.listing.deleteMany();

  const hdmiCable = await prisma.listing.create({
    data: {
      ownerUsername: USERS.owner1,
      title: 'สาย HDMI 2 เมตร',
      description: 'ใช้ต่อโปรเจกเตอร์ สภาพดี',
      category: 'cables_connectors',
      listingType: 'borrow',
      status: 'available',
    },
  });

  const dataStructureBook = await prisma.listing.create({
    data: {
      ownerUsername: USERS.owner1,
      title: 'หนังสือ Data Structures and Algorithms',
      description: 'ฉบับพิมพ์ล่าสุด มีรอยขีดเส้นใต้บ้าง',
      category: 'books_materials',
      listingType: 'borrow',
      status: 'available',
    },
  });

  const tripod = await prisma.listing.create({
    data: {
      ownerUsername: USERS.owner2,
      title: 'ขาตั้งกล้อง Tripod',
      category: 'camera_photography',
      listingType: 'borrow',
      status: 'available',
    },
  });

  const oldCalculator = await prisma.listing.create({
    data: {
      ownerUsername: USERS.owner2,
      title: 'เครื่องคิดเลข Casio fx-991',
      description: 'ไม่ใช้แล้ว ยกให้รุ่นน้องที่ต้องการ',
      category: 'calculators',
      listingType: 'giveaway',
      status: 'available',
    },
  });

  // คำขอยืมที่ pending อยู่ (ยังไม่อนุมัติ)
  const pendingRequest = await prisma.borrowRequest.create({
    data: {
      listingId: dataStructureBook.id,
      requesterUsername: USERS.borrower1,
      message: 'ขอยืมอ่านสอบกลางภาคครับ คืนภายในสัปดาห์หน้า',
      status: 'pending',
    },
  });
  await prisma.listing.update({
    where: { id: dataStructureBook.id },
    data: { status: 'pending' },
  });

  // คำขอที่ overdue แล้ว (จำลองว่าเลยกำหนดคืนมา 5 วัน) — ให้เห็นใน admin/overdue-requests ทันที
  const overdueDueDate = new Date();
  overdueDueDate.setDate(overdueDueDate.getDate() - 5);

  await prisma.borrowRequest.create({
    data: {
      listingId: tripod.id,
      requesterUsername: USERS.borrower2,
      message: 'ขอยืมถ่ายงานกิจกรรมสาขาครับ',
      status: 'overdue',
      dueDate: overdueDueDate,
      respondedAt: new Date(overdueDueDate.getTime() - 3 * 24 * 60 * 60 * 1000),
    },
  });
  await prisma.listing.update({
    where: { id: tripod.id },
    data: { status: 'borrowed' },
  });

  // รายงานปัญหา (report) ตัวอย่าง ให้เห็นใน admin/reports
  await prisma.report.create({
    data: {
      targetType: 'listing',
      targetId: hdmiCable.id,
      reporterUsername: USERS.borrower1,
      reason: 'รูปที่ลงกับของจริงไม่ตรงกัน สายสั้นกว่าที่บอกไว้มาก',
    },
  });

  // notification ตัวอย่าง
  await prisma.notification.create({
    data: {
      recipientUsername: USERS.owner1,
      type: 'new_request',
      title: `มีคนขอยืม "${dataStructureBook.title}"`,
      body: pendingRequest.message,
      refListingId: dataStructureBook.id,
      refRequestId: pendingRequest.id,
    },
  });

  console.log('Seed เสร็จแล้ว:');
  console.log(`  Listings: ${hdmiCable.id}, ${dataStructureBook.id}, ${tripod.id}, ${oldCalculator.id}`);
  console.log('  ลอง GET /api/v1/listings ดูได้เลย');
  console.log('  ลอง GET /api/v1/admin/reports และ /api/v1/admin/overdue-requests ด้วย header X-Layer1-Role: staff');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
