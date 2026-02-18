export interface Episode {
  id?: number;
  title: string;
  video?: string;
  season_number: number;
  episode_number: number;
}

export interface Serie {
  id?: number;
  title: string;
  desc: string;
  year: number;
  image?: string;
  video?: string;
  seasons: number;
  episodes: number;
  episode_list?: Episode[];
  genre?: string;
}
