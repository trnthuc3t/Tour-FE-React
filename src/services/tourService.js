import apiClient from './apiClient';

const MOCK_TOURS = [
  {
    id: 'tour-001',
    name: 'Private Voyage: Di Sản Vịnh Hạ Long & Lan Hạ',
    slug: 'vinh-ha-long-lan-ha',
    destination: 'Quảng Ninh, Việt Nam',
    duration: '3 Ngày 2 Đêm',
    durationDays: 3,
    rating: 4.9,
    reviewCount: 128,
    price: 12500000,
    badge: 'Bán chạy nhất',
    badgeType: 'primary',
    image: 'https://images.unsplash.com/photo-1528360983277-13d401cdc186?w=800&q=80',
    description: 'Khám phá vẻ đẹp di sản thế giới Vịnh Hạ Long với du thuyền 5 sao cao cấp, ẩm thực fine-dining và dịch vụ quản gia 24/7.',
    highlights: ['Du thuyền 5 Sao', 'Fine-Dining', 'Kayak & Bơi', 'Quản Gia 24/7'],
    itinerary: [
      { day: 1, title: 'Cảng Tuần Châu — Vịnh Lan Hạ', description: 'Lên tàu và bắt đầu hành trình khám phá vịnh. Check-in du thuyền và thưởng thức welcome drink. Chiều tối, tham gia hoạt động trên boong tàu.' },
      { day: 2, title: 'Hang Sáng Tối — Đảo Cát Bà', description: 'Chèo kayak khám phá hang động và bãi tắm hoang sơ. Thưởng thức bữa tối hải sản tươi sống trên du thuyền.' },
      { day: 3, title: 'Thư Giãn & Trở Về', description: 'Buổi sáng yoga trên boong tàu, tận hưởng ánh nắng ban mai trước khi về cảng. Thanh toán check-out và kết thúc hành trình.' },
    ],
    includes: ['Du thuyền cao cấp', '03 bữa ăn/ngày', 'Vé tham quan', 'Hướng dẫn viên', 'Bảo hiểm du lịch'],
    excludes: ['Vé máy bay', 'Chi tiêu cá nhân', 'Đồ uống có cồn', 'Tip cho crew'],
    reviews: [
      { name: 'Anh Tuấn Nguyễn', rating: 5, comment: 'Trải nghiệm tuyệt vời! Du thuyền đẹp, thức ăn ngon, dịch vụ chu đáo. Đội ngũ nhân viên rất chuyên nghiệp.' },
      { name: 'Chị Hương Linh', rating: 5, comment: 'Kỳ nghỉ hoàn hảo! View Vịnh Hạ Long từ du thuyền rất đẹp, ăn uống ngon, sẽ quay lại.' },
    ],
  },
  {
    id: 'tour-002',
    name: 'Sa Pa: Bản Tình Ca Ruộng Bậc Thang',
    slug: 'sa-pa-ruong-bac-thang',
    destination: 'Lào Cai, Việt Nam',
    duration: '4 Ngày 3 Đêm',
    durationDays: 4,
    rating: 4.8,
    reviewCount: 95,
    price: 8200000,
    badge: 'Phổ biến nhất',
    badgeType: 'secondary',
    image: 'https://images.unsplash.com/photo-1552831388-6a2fba73c4c1?w=800&q=80',
    description: 'Đắm mình trong vẻ đẹp hùng vĩ của ruộng bậc thang Sa Pa mùa lúa chín.',
    highlights: ['Ruộng Bậc Thang', 'Đèo Ô Quy Hồ', 'Thác Bạc', 'Văn Hóa Dân Tộc'],
    includes: ['Xe limousine', 'Khách sạn 4 sao', 'Bữa ăn', 'Hướng dẫn viên'],
    excludes: ['Vé máy bay', 'Chi tiêu cá nhân'],
    reviews: [{ name: 'Anh Minh Đức', rating: 5, comment: 'Cảnh đẹp Sapa không có chỗ nào sánh được. Mùa lúa chín rực vàng, tuyệt vời!' }],
  },
  {
    id: 'tour-003',
    name: 'Maldives: Thiên Đường Nhiệt Đới',
    slug: 'maldives-paradise',
    destination: 'Maldives',
    duration: '5 Ngày 4 Đêm',
    durationDays: 5,
    rating: 5.0,
    reviewCount: 67,
    price: 45000000,
    badge: 'Cao Cấp',
    badgeType: 'success',
    image: 'https://images.unsplash.com/photo-1514282401047-d79a71a590e8?w=800&q=80',
    description: 'Trải nghiệm nghỉ dưỡng tuyệt vời tại thiên đường Maldives với biệt thự trên biển.',
    highlights: ['Biệt Thự Trên Biển', 'Lặn Biển', 'SPA Cao Cấp', 'Hoàng Hôn Riêng'],
    includes: ['Biệt thự', 'Bữa ăn', 'Các hoạt động'],
    excludes: ['Vé máy bay', 'Visa'],
    reviews: [{ name: 'Chị Thu Hà', rating: 5, comment: ' Thiên đường trên mặt đất! Nước biển trong vắt, bungalow đẹp tuyệt.' }],
  },
  {
    id: 'tour-004',
    name: 'Kyoto & Osaka: Cố Đô Xứ Phù Tang',
    slug: 'kyoto-osaka',
    destination: 'Nhật Bản',
    duration: '6 Ngày 5 Đêm',
    durationDays: 6,
    rating: 4.9,
    reviewCount: 142,
    price: 28000000,
    badge: 'Ưu đãi 15%',
    badgeType: 'secondary',
    image: 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=800&q=80',
    description: 'Khám phá văn hóa Nhật Bản từ cổ đại đến hiện đại, từ đền chùa Kyoto đến phố đêm Osaka.',
    highlights: ['Chùa Vàng Kinkaku-ji', 'Phố Đêm Dotonbori', 'Núi Phú Sĩ', 'Ga Sở Thú Kyoto'],
    includes: ['Khách sạn', 'Bữa ăn', 'Xe di chuyển'],
    excludes: ['Vé máy bay', 'Visa'],
    reviews: [{ name: 'Anh Khoa Nguyễn', rating: 5, comment: 'Nhật Bản đẹp dưới mọi góc nhìn. Đền chùa Kyoto ấn tượng, ẩm thực Osaka tuyệt vời.' }],
  },
  {
    id: 'tour-005',
    name: 'Bali: Đảo Ngọc Indonesia',
    slug: 'bali-island',
    destination: 'Indonesia',
    duration: '4 Ngày 3 Đêm',
    durationDays: 4,
    rating: 4.7,
    reviewCount: 88,
    price: 15000000,
    badge: 'Mùa lúa chín',
    badgeType: 'primary',
    image: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=800&q=80',
    description: 'Khám phá Bali với những đền tháp cổ, ruộng bậc thang xanh mướt và bãi biển tuyệt đẹp.',
    highlights: ['Đền Tanah Lot', 'Tegallalang Rice Terrace', 'Ubud Art Market', 'Bãi Biển Seminyak'],
    includes: ['Khách sạn', 'Bữa ăn', 'Xe di chuyển'],
    excludes: ['Vé máy bay', 'Chi tiêu cá nhân'],
    reviews: [{ name: 'Chị Phương Mai', rating: 4, comment: 'Bali thanh bình và yên hòa. Đền tháp rất đẹp, người dân thân thiện.' }],
  },
  {
    id: 'tour-006',
    name: 'Bắc Âu: Vùng Đất Ngàn Đêm',
    slug: 'northern-europe',
    destination: 'Na Uy & Thụy Điển',
    duration: '7 Ngày 6 Đêm',
    durationDays: 7,
    rating: 4.9,
    reviewCount: 45,
    price: 65000000,
    badge: 'Mùa đông đặc biệt',
    badgeType: 'success',
    image: 'https://images.unsplash.com/photo-1531366936337-7c912a4589a7?w=800&q=80',
    description: 'Trải nghiệm cực quang huyền bí và vẻ đẹp hoang sơ của vùng Bắc Âu.',
    highlights: ['Cực Quang Bắc Đầu', 'Băng Hà Jotunheimen', 'Thành Phố Bergen', 'Xe Ratara'],
    includes: ['Khách sạn', 'Bữa ăn', 'Xe di chuyển', 'Vé tham quan'],
    excludes: ['Vé máy bay', 'Visa'],
    reviews: [{ name: 'Anh Đức Minh', rating: 5, comment: 'Cực quang Bắc Đầu thật sự ngoại hạng! Một trải nghiệm không thể quên.' }],
  },
  {
    id: 'tour-007',
    name: 'Đà Lạt: Thành Phố Ngàn Hoa',
    slug: 'da-lat-flower',
    destination: 'Lâm Đồng, Việt Nam',
    duration: '3 Ngày 2 Đêm',
    durationDays: 3,
    rating: 4.6,
    reviewCount: 203,
    price: 4500000,
    badge: 'Ưu đãi 20%',
    badgeType: 'secondary',
    image: 'https://images.unsplash.com/photo-1583417319070-4a69db38a482?w=800&q=80',
    description: 'Khám phá Đà Lạt với thời tiết mát mẻ quanh năm, những đồi hoa và kiến trúc Pháp cổ điển.',
    highlights: ['Hồ Tuyền Lâm', 'Thung Lũ Tình Yêu', 'Đỉnh Lang Biang', 'Quảng Trường Lâm Viên'],
    includes: ['Xe limousine', 'Khách sạn', 'Bữa ăn'],
    excludes: ['Chi tiêu cá nhân'],
    reviews: [{ name: 'Chị Thanh Trúc', rating: 5, comment: 'Đà Lạt mùa nào cũng đẹp. Không khí mát mẻ, cà phê ngon, người dân dễ thương.' }],
  },
  {
    id: 'tour-008',
    name: 'Italy: Di Sản Mediterranean',
    slug: 'italy-mediteranean',
    destination: 'Ý',
    duration: '8 Ngày 7 Đêm',
    durationDays: 8,
    rating: 5.0,
    reviewCount: 34,
    price: 85000000,
    badge: 'Premium',
    badgeType: 'success',
    image: 'https://images.unsplash.com/photo-1529260830199-42c24126f198?w=800&q=80',
    description: 'Hành trình qua Rome, Florence, Venice - khám phá nền văn minh La Mã cổ đại và phục hưng.',
    highlights: ['Đấu Trường Colosseum', 'Nhà Thờ St. Peter', 'Cầu Rialto', 'Leaning Tower Pisa'],
    includes: ['Khách sạn 5 sao', 'Bữa ăn', 'Xe di chuyển'],
    excludes: ['Vé máy bay', 'Visa'],
    reviews: [{ name: 'Anh Hoàng Nam', rating: 5, comment: 'Italy vĩ đại! Lịch sử, nghệ thuật, ẩm thực - tất cả đều tuyệt vời.' }],
  },
];

export const tourService = {
  getTours: async (filters = {}) => {
    await new Promise(resolve => setTimeout(resolve, 500));
    let filtered = [...MOCK_TOURS];
    if (filters.destination) {
      filtered = filtered.filter(t =>
        t.destination.toLowerCase().includes(filters.destination.toLowerCase()) ||
        t.name.toLowerCase().includes(filters.destination.toLowerCase())
      );
    }
    if (filters.priceMin) filtered = filtered.filter(t => t.price >= filters.priceMin);
    if (filters.priceMax) filtered = filtered.filter(t => t.price <= filters.priceMax);
    if (filters.rating > 0) filtered = filtered.filter(t => t.rating >= filters.rating);
    return { data: { tours: filtered, total: filtered.length } };
  },

  getTourById: async (id) => {
    await new Promise(resolve => setTimeout(resolve, 300));
    const tour = MOCK_TOURS.find(t => t.id === id);
    if (!tour) throw new Error('Tour not found');
    return { data: tour };
  },

  searchTours: async (query) => {
    await new Promise(resolve => setTimeout(resolve, 400));
    const results = MOCK_TOURS.filter(t =>
      t.name.toLowerCase().includes(query.toLowerCase()) ||
      t.destination.toLowerCase().includes(query.toLowerCase())
    );
    return { data: results };
  },

  getFeaturedTours: async () => {
    await new Promise(resolve => setTimeout(resolve, 300));
    return { data: MOCK_TOURS.slice(0, 4) };
  },

  getTopDestinations: async () => {
    await new Promise(resolve => setTimeout(resolve, 300));
    return {
      data: [
        { id: 'dest-1', name: 'Việt Nam', location: 'Vịnh Hạ Long', image: 'https://images.unsplash.com/photo-1528360983277-13d401cdc186?w=600&q=80', tourCount: 24 },
        { id: 'dest-2', name: 'Nhật Bản', location: 'Kyoto', image: 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=600&q=80', tourCount: 18 },
        { id: 'dest-3', name: 'Indonesia', location: 'Bali', image: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=600&q=80', tourCount: 15 },
        { id: 'dest-4', name: 'Maldives', location: 'Malé', image: 'https://images.unsplash.com/photo-1514282401047-d79a71a590e8?w=600&q=80', tourCount: 8 },
      ],
    };
  },
};

export default tourService;
