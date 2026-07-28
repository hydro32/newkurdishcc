import type { Video } from "@/types/video";

// Deterministic placeholder media
const thumb = (seed: string) =>
  `https://picsum.photos/seed/${seed}/640/360`;

const avatar = (seed: string) =>
  `https://i.pravatar.cc/150?u=${seed}`;

export const videos: Video[] = [
  {
    id: 1,
    title: "گەشتێک بۆ چیاکانی هەورامان لە وەرزی بەهار",
    description:
      "لەم ڤیدیۆیەدا سەردانی گوندە شاخاوییەکانی هەورامان دەکەین و چێژ لە سروشتی سەرسوڕهێنەری بەهار وەردەگرین.",
    creator: "کاروان گەشتیار",
    creatorAvatar: avatar("karwan"),
    duration: "12:45",
    views: "1.2M",
    uploadedAt: "٢ ڕۆژ لەمەوبەر",
    thumbnail: thumb("hawraman"),
    featured: true,
  },
  {
    id: 2,
    title: "نوێترین گۆرانی کوردی — مۆنتاژی هونەری ٢٠٢٦",
    description:
      "کۆمەڵێک لە خۆشترین گۆرانییە کوردیەکانی ئەم ساڵە کۆکراونەتەوە.",
    creator: "دەنگی کوردستان",
    creatorAvatar: avatar("dengi"),
    duration: "34:10",
    views: "875K",
    uploadedAt: "٥ ڕۆژ لەمەوبەر",
    thumbnail: thumb("music-kurd"),
  },
  {
    id: 3,
    title: "پرتەیشتی خۆشترین دۆلمە — وەصفی تەواو",
    description:
      "فێری دروستکردنی دۆلمەی کوردی بە شێوازی ماڵی دەبیت، هەنگاو بە هەنگاو.",
    creator: "چێشتخانەی دایک",
    creatorAvatar: avatar("dayik"),
    duration: "08:22",
    views: "450K",
    uploadedAt: "١ هەفتە لەمەوبەر",
    thumbnail: thumb("dolma"),
  },
  {
    id: 4,
    title: "کۆمیدیای ماڵی — کاتێک باوکم ئینتەرنێت دادەبەزێنێت",
    description:
      "بەشێکی نوێ لە کۆمیدیای ماڵەوە، سەرنجت ڕادەکێشێت.",
    creator: "ژیانی ڕۆژانە",
    creatorAvatar: avatar("jiyan"),
    duration: "06:15",
    views: "2.3M",
    uploadedAt: "٣ ڕۆژ لەمەوبەر",
    thumbnail: thumb("comedy-home"),
  },
  {
    id: 5,
    title: "کورتەیەک لە هەواڵەکانی ئەمڕۆی هەرێمی کوردستان",
    description:
      "کۆبوونەوەی گرنگترین هەواڵەکانی ئەمڕۆ بە شێوەیەکی کورت و ڕوون.",
    creator: "کوردستان نیوز",
    creatorAvatar: avatar("news"),
    duration: "15:40",
    views: "980K",
    uploadedAt: "١٢ کاتژمێر لەمەوبەر",
    thumbnail: thumb("news-krd"),
  },
  {
    id: 6,
    title: "یارییەکانی گەیمینگ — باشترین ساتەکان",
    description:
      "چۆن باشترین تیم دروست بکەین و بۆ ئاست بەرزتر بڕۆین.",
    creator: "گەیمەری کورد",
    creatorAvatar: avatar("gamer"),
    duration: "22:05",
    views: "610K",
    uploadedAt: "٤ ڕۆژ لەمەوبەر",
    thumbnail: thumb("gaming-krd"),
  },
  {
    id: 7,
    title: "شەقامەکانی هەولێر بە شەو — ڤلۆگ",
    description:
      "گەشتێکی نیوە شەو بۆ ناو شەقامە مێژووییەکانی هەولێر.",
    creator: "کاروان گەشتیار",
    creatorAvatar: avatar("karwan"),
    duration: "18:30",
    views: "1.5M",
    uploadedAt: "١ ڕۆژ لەمەوبەر",
    thumbnail: thumb("erbil-night"),
  },
  {
    id: 8,
    title: "ڕاهێنانی سادە لە ماڵەوە",
    description:
      "ڕاهێنانێکی سادە کە بەبێ ئامێر لە ماڵەوە دەیکەیت.",
    creator: "تەندروستی ڕۆژانە",
    creatorAvatar: avatar("fit"),
    duration: "10:00",
    views: "330K",
    uploadedAt: "٦ ڕۆژ لەمەوبەر",
    thumbnail: thumb("workout-krd"),
  },
  {
    id: 9,
    title: "پێداچوونەوە بۆ نوێترین فیلمی کوردی",
    description:
      "پێداچوونەوەیەکی کورت بۆ نوێترین فیلمی کوردی.",
    creator: "سینەمای کورد",
    creatorAvatar: avatar("cinema"),
    duration: "14:12",
    views: "720K",
    uploadedAt: "٢ هەفتە لەمەوبەر",
    thumbnail: thumb("movie-review"),
  },
  {
    id: 10,
    title: "١٥ ڕستەی بەکاربراو بۆ ژیانی ڕۆژانە",
    description:
      "١٥ ڕستەی بەکاربراو کە ڕۆژانە پێویستت دەبێت.",
    creator: "فێربوونی زمان",
    creatorAvatar: avatar("learn"),
    duration: "20:48",
    views: "540K",
    uploadedAt: "٣ ڕۆژ لەمەوبەر",
    thumbnail: thumb("english-lesson"),
  },
  {
    id: 11,
    title: "کۆنسێرتی گەورە لە سلێمانی — تۆمارکردنی تەواو",
    description:
      "لەگەڵ گۆرانیبێژە دۆستراوەکانتان لەم شەوە دەرگیر بن.",
    creator: "دەنگی کوردستان",
    creatorAvatar: avatar("dengi"),
    duration: "48:00",
    views: "3.1M",
    uploadedAt: "١ مانگ لەمەوبەر",
    thumbnail: thumb("concert-slemani"),
  },
  {
    id: 12,
    title: "کۆمیدیای ستاند-ئەپ — یەکەم شەو",
    description:
      "کلیپی هەڵبژاردەی یەکەم پێشانگای ستاند-ئەپی کوردی.",
    creator: "ژیانی ڕۆژانە",
    creatorAvatar: avatar("jiyan"),
    duration: "09:52",
    views: "1.1M",
    uploadedAt: "٥ ڕۆژ لەمەوبەر",
    thumbnail: thumb("standup-krd"),
  },
  {
    id: 13,
    title: "چێشتی سەر خۆرەتاو — کەباب و برژاو",
    description:
      "نهێنیەکانی برژاوی تەواو لەسەر ئاگر بۆ کۆبوونەوەی خێزانی.",
    creator: "چێشتخانەی دایک",
    creatorAvatar: avatar("dayik"),
    duration: "11:35",
    views: "295K",
    uploadedAt: "١ هەفتە لەمەوبەر",
    thumbnail: thumb("kebab-krd"),
  },
  {
    id: 14,
    title: "باشترین ساتەکانی وەرزش",
    description:
      "کورتەیەک لە باشترین ساتەکانی وەرزش.",
    creator: "تەندروستی ڕۆژانە",
    creatorAvatar: avatar("fit"),
    duration: "07:44",
    views: "410K",
    uploadedAt: "٤ ڕۆژ لەمەوبەر",
    thumbnail: thumb("sports-recap"),
  },
  {
    id: 15,
    title: "زنجیرەی نوێ — بەشی یەکەم بە تەواوی",
    description:
      "دەستپێکی چیرۆکێکی نوێ کە ڕەنگە جیهانی زنجیرەکان بگۆڕێت.",
    creator: "سینەمای کورد",
    creatorAvatar: avatar("cinema"),
    duration: "42:18",
    views: "1.8M",
    uploadedAt: "٣ ڕۆژ لەمەوبەر",
    thumbnail: thumb("series-ep1"),
  },
  {
    id: 16,
    title: "یارییەکی نوێ — گەیمپڵەی تەواو",
    description:
      "گەیمپڵەیەکی خۆش و سەرنجڕاکێش.",
    creator: "گەیمەری کورد",
    creatorAvatar: avatar("gamer"),
    duration: "26:33",
    views: "890K",
    uploadedAt: "٢ ڕۆژ لەمەوبەر",
    thumbnail: thumb("gaming-2"),
  },
  {
    id: 17,
    title: "چۆنیەتی خوێندنی سەرکەوتوو — ڕاوێژی خوێندکاران",
    description:
      "شێوازی خوێندنی کارا بۆ تاقیکردنەوەی کۆتایی وەرز.",
    creator: "فێربوونی زمان",
    creatorAvatar: avatar("learn"),
    duration: "16:05",
    views: "205K",
    uploadedAt: "١ هەفتە لەمەوبەر",
    thumbnail: thumb("study-tips"),
  },
  {
    id: 18,
    title: "دوایین هەواڵی کەشوهەوا و ڕێبەندی هەفتە",
    description:
      "پێشبینی کەشوهەوا بۆ شارەکانی هەرێم لە درێژایی هەفتە.",
    creator: "کوردستان نیوز",
    creatorAvatar: avatar("news"),
    duration: "05:20",
    views: "312K",
    uploadedAt: "٨ کاتژمێر لەمەوبەر",
    thumbnail: thumb("weather-krd"),
  },
];

export function getVideoById(id: number): Video | undefined {
  return videos.find((v) => v.id === id);
}

export function getRelatedVideos(
  video: Video,
  limit = 6,
): Video[] {
  return videos
    .filter((v) => v.id !== video.id)
    .slice(0, limit);
}

export function getFeaturedVideo(): Video {
  return videos.find((v) => v.featured) ?? videos[0];
}