import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

async function main() {
  // Account 더미 생성
  const account1 = await prisma.account.create({
    data: {
      provider: "kakao",
      oauthId: "user1_oauth_id",
    },
  });

  const account2 = await prisma.account.create({
    data: {
      provider: "kakao",
      oauthId: "user2_oauth_id",
    },
  });

  const artistAccount = await prisma.account.create({
    data: {
      provider: "kakao",
      oauthId: "artist_oauth_id",
    },
  });

  // User 1 생성
  const user1 = await prisma.user.create({
    data: {
      accountId: account1.id,
      nickname: "user_one",
      description: "첫 번째 사용자입니다.",
      profileImage: "https://example.com/user1.png",
    },
  });

  // User 2 생성
  const user2 = await prisma.user.create({
    data: {
      accountId: account2.id,
      nickname: "user_two",
      description: "두 번째 사용자입니다.",
      profileImage: "https://example.com/user2.png",
    },
  });

  // Artist 생성
  const artist = await prisma.artist.create({
    data: {
      accountId: artistAccount.id,
      nickname: "artist_one",
      description: "테스트용 작가입니다.",
      profileImage: "https://example.com/artist1.png",
    },
  });

  // Category 생성
  const category = await prisma.category.create({
    data: {
      name: "캐릭터 일러스트",
    },
  });

  // Commission 생성 (Artist가 작성)
  const commission = await prisma.commission.create({
    data: {
      artistId: artist.id,
      categoryId: category.id,
      title: "테스트 커미션 글",
      summary: "이것은 테스트용 커미션 글입니다.",
      price: 50000,
      formSchema: {},
    },
  });

  // Request 생성 (user2가 신청)
  const request = await prisma.request.create({
    data: {
      userId: user2.id,
      commissionId: commission.id,
      status: "PENDING", // enum값
      formAnswer: {
        detail: "테스트 커미션 요청 상세 설명입니다.",
      },
      waitlist: 1,
    },
  });

  console.log("✅ Seed completed successfully.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });