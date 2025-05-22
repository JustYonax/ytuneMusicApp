import React from 'react';

interface GenreMenuProps {
  genres: string[];
  selectedGenre: string | null;
  onGenreSelect: (genre: string) => void;
}

const GenreMenu: React.FC<GenreMenuProps> = ({ genres, selectedGenre, onGenreSelect }) => {
  return (
    <div className="flex flex-wrap justify-center gap-2">
      {genres.map((genre) => (
        <button
          key={genre}
          onClick={() => onGenreSelect(genre)}
          className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
            selectedGenre === genre
              ? 'bg-white text-purple-600'
              : 'bg-white/20 text-white hover:bg-white/30'
          }`}
        >
          {genre}
        </button>
      ))}
    </div>
  );
};

export default GenreMenu;