export interface Video {
  id: number;
  title: string;
  description: string;
  creator: string;
  creatorAvatar: string;
  duration: string;
  views: string;
  uploadedAt: string;
  thumbnail: string;
  featured?: boolean;
}