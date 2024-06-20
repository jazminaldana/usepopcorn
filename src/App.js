/* eslint-disable no-unused-vars */
/* eslint-disable react/prop-types */
import React, { useEffect, useRef, useState } from "react";
import StarRating from "./StarRating";
import { useMovies } from "./useMovies";
import { useLocalStorageState } from "./useLocalStorageState";
import { useKey } from "./useKey";

const average = (arr) =>
  arr.reduce((acc, cur, i, arr) => acc + cur / arr.length, 0);
const KEY = "8d5f20d0";

export default function App() {
  const [query, setQuery] = useState("");
  const [selectedId, setSelectedId] = useState(null);
  const { movies, loading, error } = useMovies(query);
  const [watched, setWatched] = useLocalStorageState([], 'watched');

  const handleSelectMovie = (id) => {
    setSelectedId(selectedId => id === selectedId ? null : id);
  }

  const handleCloseMovie = () => {
    setSelectedId(null);
  }

  const handleAddToWatched = (movie) => {
    setWatched((watched) => [...watched, movie]);
  }

  const handleDeleteWatched = (id) => {
    setWatched((watched) => watched.filter((movie) => movie.imdbID !== id));
  }

  return (
    <>
      <NavBar>
        <Search query={query} setQuery={setQuery} />
        <NumResults movies={movies} />
      </NavBar>
      <Main>
        <Box>
          {loading && <Loader />}
          {!loading && !error && (
            <MovieList movies={movies} onSelectMovie={handleSelectMovie} />
          )}
          {error && <ErrorMessage message={error} />}
        </Box>
        <Box>
          {selectedId
            ? (
              <MovieDetails
                selectedId={selectedId}
                onCloseMovie={handleCloseMovie}
                onAddWatched={handleAddToWatched}
                watched={watched}
              />
            )
            : (
              <>
                <WatchedSummary watched={watched} />
                <WatchedMovieList watched={watched} onDeleteWatched={handleDeleteWatched} />
              </>
            )}
        </Box>
      </Main>
    </>
  );
}

const Loader = () => <p className="loader">Loading...</p>

const ErrorMessage = ({ message }) => (
  <p className="error"><span>⛔</span>{message}</p>
);

const Logo = ({ logo, title }) => (
  <div className="logo">
    <span role="img">{logo}</span>
    <h1>{title}</h1>
  </div>
)

const NavBar = ({ children }) => (
  <nav className="nav-bar">
    <Logo logo="🍿" title="usePopcorn" />
    {children}
  </nav>
);

const Search = ({ query, setQuery }) => {
  const inputEl = useRef(null);
  useKey("Enter", () => {
    if (document.activeElement === inputEl.current) return;
    inputEl.current.focus();
    setQuery("");
  });

  return (
    <input
      className="search"
      type="text"
      placeholder="Search movies..."
      value={query}
      onChange={(e) => setQuery(e.target.value)}
      ref={inputEl}
    />
  );
};

const NumResults = ({ movies }) => (
  <p className="num-results">
    Found <strong>{movies.length}</strong> results
  </p>
)

const Main = ({ children }) => (
  <main className="main">
    {children}
  </main>
);

const MovieList = ({ movies, onSelectMovie }) => (
  <ul className="list list-movies">
    {movies?.map((movie) => (
      <Movie
        movie={movie}
        key={movie.imdbID}
        onSelectMovie={onSelectMovie}
      />
    ))}
  </ul>
);

const Movie = ({ movie, onSelectMovie }) => {
  const { Title, Poster, Year, imdbID } = movie;
  return (
    <li onClick={() => onSelectMovie(imdbID)}>
      <img src={Poster} alt={`${Title} poster`} />
      <h3>{Title}</h3>
      <div>
        <p>
          <span>🗓</span>
          <span>{Year}</span>
        </p>
      </div>
    </li>
  );
}

const MovieDetails = ({ selectedId, onCloseMovie, onAddWatched, watched }) => {
  const [movie, setMovie] = useState({});
  const [loading, setLoading] = useState(false);
  const [userRating, setUserRating] = useState("");

  const countRef = useRef(0);
  useEffect(() => {
    if (userRating) {
      countRef.current = countRef.current + 1;
    }
  }, [userRating]);


  const isWatched = watched.map((movie) => movie.imdbID).includes(selectedId);
  const watchedUserRating = watched.find((movie) => movie.imdbID === selectedId)?.userRating;

  const {
    Title: title,
    Year: year,
    Poster: poster,
    Runtime: runtime,
    imdbRating,
    Plot: plot,
    Released: released,
    Actors: actors,
    Director: director,
    Genre: genre
  } = movie;


  const handleAdd = () => {
    const newWatchedMovie = {
      imdbID: selectedId,
      title,
      year,
      poster,
      imdbRating: Number(imdbRating),
      runtime: Number(runtime.split(" ").at(0)),
      userRating,
      countRatingDecisions: countRef.current
    }
    onAddWatched(newWatchedMovie);
    onCloseMovie();
  }

  useKey("Escape", onCloseMovie);

  useEffect(() => {
    const getMovieDetails = async () => {
      try {
        setLoading(true);
        const res = await fetch(`https://www.omdbapi.com/?&apikey=${KEY}&i=${selectedId}`);
        if (!res.ok) throw new Error("Something went wrong while fetching the movie details.");

        const data = await res.json();
        setMovie(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    getMovieDetails();
  }, [selectedId]);

  useEffect(() => {
    if (!title) return;
    document.title = `Movie | ${title} via usePopcorn`;

    return () => {
      document.title = "usePopcorn";
    };
  }, [title]);

  return (
    <div className="details">
      {loading
        ? <Loader />
        : (
          <>
            <header>
              <button className="btn-back" onClick={onCloseMovie}>&larr;</button>
              <img src={poster} alt={`${title} poster`} />
              <div className="details-overview">
                <h2>{title}</h2>
                <p>{released} &bull; {runtime}</p>
                <p>{genre}</p>
                <p><span>⭐</span> {imdbRating}</p>
              </div>
            </header>
            <section>
              <div className="rating">
                {!isWatched
                  ? (
                    <>
                      <StarRating maxRating={10} size={24} onSetRating={setUserRating} />
                      {userRating > 0 &&
                        <button className="btn-add" onClick={handleAdd}>+ Add to list</button>}
                    </>
                  )
                  : <p>You rated this movie {watchedUserRating} <span>⭐</span></p>}
              </div>
              <p><em>{plot}</em></p>
              <p>Starring {actors}</p>
              <p>Directed by {director}</p>
            </section>
          </>
        )}
    </div>
  );
};
const WatchedSummary = ({ watched }) => {
  const avgImdbRating = average(watched.map((movie) => movie.imdbRating));
  const avgUserRating = average(watched.map((movie) => movie.userRating));
  const avgRuntime = average(watched.map((movie) => movie.runtime));
  return (
    <div className="summary">
      <h2>Movies you watched</h2>
      <div>
        <p>
          <span>#️⃣</span>
          <span>{watched.length} movies</span>
        </p>
        <p>
          <span>⭐️</span>
          <span>{avgImdbRating.toFixed(2)}</span>
        </p>
        <p>
          <span>🌟</span>
          <span>{avgUserRating.toFixed(2)}</span>
        </p>
        <p>
          <span>⏳</span>
          <span>{avgRuntime} min</span>
        </p>
      </div>
    </div>
  )
};

const WatchedMovieList = ({ watched, onDeleteWatched }) => (
  <ul className="list">
    {watched.map((movie) => (
      <WatchedMovie movie={movie} key={movie.imdbID} onDeleteWatched={onDeleteWatched} />
    ))}
  </ul>
);

const WatchedMovie = ({ movie, onDeleteWatched }) => {
  const { title, poster, runtime, imdbRating, userRating } = movie;
  return (
    <li>
      <img src={poster} alt={`${title} poster`} />
      <h3>{title}</h3>
      <div>
        <p>
          <span>⭐️</span>
          <span>{imdbRating}</span>
        </p>
        <p>
          <span>🌟</span>
          <span>{userRating}</span>
        </p>
        <p>
          <span>⏳</span>
          <span>{runtime} min</span>
        </p>

        <button className="btn-delete" onClick={() => onDeleteWatched(movie.imdbID)}>X</button>
      </div>
    </li>
  );
};

const Box = ({ children }) => {
  const [isOpen, setIsOpen] = useState(true);
  return (
    <div className="box">
      <button
        className="btn-toggle"
        onClick={() => setIsOpen((open) => !open)}
      >
        {isOpen ? "–" : "+"}
      </button>
      {isOpen && children}
    </div>
  )
};