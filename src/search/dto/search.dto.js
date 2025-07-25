// 검색 결과 조회 DTO
export class SearchCommissionDto {
  constructor({
    keyword,
    categoryId,
    sort = 'latest',
    minPrice,
    maxPrice,
    deadline = 'all',
    followingOnly = false,
    page = 1,
    limit = 12
  }) {
    this.keyword = keyword;
    this.categoryId = categoryId ? Number(categoryId) : null;
    this.sort = sort;
    this.minPrice = minPrice ? Number(minPrice) : null;
    this.maxPrice = maxPrice ? Number(maxPrice) : null;
    this.deadline = deadline;
    this.followingOnly = followingOnly === 'true' || followingOnly === true;
    this.page = Number(page);
    this.limit = Number(limit);
  }
}

// 검색 응답용 데이터 구조
export class CommissionItemDto {
  constructor({
    id,
    title,
    minPrice,
    thumbnailImageUrl,
    deadline,
    isBookmarked,
    category,
    artist,
    tags
  }) {
    this.id = id;
    this.title = title;
    this.minPrice = minPrice;
    this.thumbnailImageUrl = thumbnailImageUrl;
    this.deadline = deadline;
    this.isBookmarked = isBookmarked;
    this.category = category;
    this.artist = artist;
    this.tags = tags;
  }
}