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
  const category1 = await prisma.category.create({
    data: {
      name: "글",
    },
  });
  // Category 생성
  const category2 = await prisma.category.create({
    data: {
      name: "그림",
    },
  });
    // Category 생성
  const category3 = await prisma.category.create({
    data: {
      name: "영상",
    },
  });
  // Category 생성
  const category4 = await prisma.category.create({
    data: {
      name: "디자인",
    },
  });
    // Category 생성
  const category5 = await prisma.category.create({
    data: {
      name: "굿즈",
    },
  });
  // Category 생성
  const category6 = await prisma.category.create({
    data: {
      name: "점술",
    },
  });
    // Category 생성
  const category7 = await prisma.category.create({
    data: {
      name: "사운드",
    },
  });
  // Category 생성
  const category8 = await prisma.category.create({
    data: {
      name: "모션",
    },
  });
  // Category 생성
  const category9 = await prisma.category.create({
    data: {
      name: "외주",
    },
  });

  // Agreements 생성
  const agreement1 = await prisma.agreement.create({
    data: {
      agreeType:"(필수) 서비스 이용약관"
    },
  });
  // Agreements 생성
  const agreement2 = await prisma.agreement.create({
    data: {
      agreeType:"(필수) 개인정보 수집/이용 동의"
    },
  });
  // Agreements 생성
  const agreement3 = await prisma.agreement.create({
    data: {
      agreeType:"(선택) 마케팅 수신 동의"
    },
  });

  // Commission 생성 (Artist가 작성)
  const commission = await prisma.commission.create({
  data: {
    artistId: artist.id,
    categoryId: 1,
    title: "테스트 커미션 글",
    summary: "이것은 테스트용 커미션 글입니다.",
    content: "테스트 커미션의 상세 설명입니다. 이 부분에는 커미션의 자세한 내용이 들어갑니다.",
    minPrice: 1000, 
    
    formSchema: {},
    },
  });

  // Request 생성 (user2가 신청)
  const request = await prisma.request.create({
    data: {
      userId: user2.id,
      commissionId: commission.id,
      totalPrice: 0,
      status: "PENDING", // enum값
      formAnswer: {
        detail: "테스트 커미션 요청 상세 설명입니다.",
      },
      waitlist: 1,
    },
  });

  const product1 = await prisma.product.create({
    data: {
      point: 1000,
      price: 1200,
    },
  });

  const product2 = await prisma.product.create({
    data: {
      point: 3000,
      price: 3100,
    },
  });

  const product3 = await prisma.product.create({
    data: {
      point: 5000,
      price: 5000,
    },
  });

  const product4 = await prisma.product.create({
    data: {
      point: 10000,
      price: 9900,
    },
  });

  const product5 = await prisma.product.create({
    data: {
      point: 50000,
      price: 49000,
    },
  });

  const badges = await prisma.badge.createMany({
    data:[
      {
      name: "첫 커미션 완료!",
      type: "comm_finish",
      threshold: 1,
      badgeImage: "https://example.com/badge_comm1.png",
      },
      {
        name: "5회 커미션 완료!",
        type: "comm_finish",
        threshold: 5,
        badgeImage: "https://example.com/badge_comm5.png",
      },
      {
        name: "15회 커미션 완료!",
        type: "comm_finish",
        threshold: 15,
        badgeImage: "https://example.com/badge_comm15.png",
      },
      {
        name: "50회 커미션 완료!",
        type: "comm_finish",
        threshold: 50,
        badgeImage: "https://example.com/badge_com50.png",
      },
      {
      name: "첫 팔로우 완료!",
      type: "follow",
      threshold: 1,
      badgeImage: "https://example.com/badge_follow1.png",
      },
      {
        name: "팔로우 5회!",
        type: "follow",
        threshold: 5,
        badgeImage: "https://example.com/badge_follow5.png",
      },
      {
        name: "팔로우 15회!",
        type: "follow",
        threshold: 15,
        badgeImage: "https://example.com/badge_follow15.png",
      },
      {
        name: "팔로우 50회!",
        type: "follow",
        threshold: 50,
        badgeImage: "https://example.com/badge_follow50.png",
      },
      {
      name: "첫 후기 작성 완료!",
      type: "review",
      threshold: 1,
      badgeImage: "https://example.com/badge_review1.png",
      },
      {
        name: "5회 후기 작성!",
        type: "review",
        threshold: 5,
        badgeImage: "https://example.com/badge_review5.png",
      },
      {
        name: "15회 후기 작성!",
        type: "review",
        threshold: 15,
        badgeImage: "https://example.com/badge_review15.png",
      },
      {
        name: "50회 후기 작성!",
        type: "review",
        threshold: 50,
        badgeImage: "https://example.com/badge_review50.png",
      },
      {
      name: "첫 커미션 신청 완료!",
      type: "comm_request",
      threshold: 1,
      badgeImage: "https://example.com/badge_request1.png",
      },
      {
        name: "5회 커미션 신청 완료!",
        type: "comm_request",
        threshold: 5,
        badgeImage: "https://example.com/badge_request5.png",
      },
      {
        name: "15회 커미션 신청 완료!",
        type: "comm_request",
        threshold: 15,
        badgeImage: "https://example.com/badge_request15.png",
      },
      {
        name: "50회 커미션 신청 완료!",
        type: "comm_request",
        threshold: 50,
        badgeImage: "https://example.com/badge_request50.png",
      },
      {
        name: "가입 1주년!",
        type: "signup_1year",
        threshold: 50,
        badgeImage: "https://example.com/badge_signup_1year.png",
      },
    ]
  })

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