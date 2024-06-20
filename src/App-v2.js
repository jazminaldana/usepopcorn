/* eslint-disable no-unused-vars */
/* eslint-disable react/prop-types */
import React, { useEffect, useState } from "react";
import StarRating from "./StarRating";

const tempMovieData = [
  {
    imdbID: "tt1375666",
    Title: "Inception",
    Year: "2010",
    Poster:
      "https://m.media-amazon.com/images/M/MV5BMjAxMzY3NjcxNF5BMl5BanBnXkFtZTcwNTI5OTM0Mw@@._V1_SX300.jpg",
  },
  {
    imdbID: "tt0133093",
    Title: "The Matrix",
    Year: "1999",
    Poster:
      "https://m.media-amazon.com/images/M/MV5BNzQzOTk3OTAtNDQ0Zi00ZTVkLWI0MTEtMDllZjNkYzNjNTc4L2ltYWdlXkEyXkFqcGdeQXVyNjU0OTQ0OTY@._V1_SX300.jpg",
  },
  {
    imdbID: "tt6751668",
    Title: "Parasite",
    Year: "2019",
    Poster:
      "https://m.media-amazon.com/images/M/MV5BYWZjMjk3ZTItODQ2ZC00NTY5LWE0ZDYtZTI3MjcwN2Q5NTVkXkEyXkFqcGdeQXVyODk4OTc3MTY@._V1_SX300.jpg",
  },
];

const tempWatchedData = [
  {
    imdbID: "tt1375666",
    Title: "Inception",
    Year: "2010",
    Poster:
      "https://m.media-amazon.com/images/M/MV5BMjAxMzY3NjcxNF5BMl5BanBnXkFtZTcwNTI5OTM0Mw@@._V1_SX300.jpg",
    runtime: 148,
    imdbRating: 8.8,
    userRating: 10,
  },
  {
    imdbID: "tt0088763",
    Title: "Back to the Future",
    Year: "1985",
    Poster:
      "https://m.media-amazon.com/images/M/MV5BZmU0M2Y1OGUtZjIxNi00ZjBkLTg1MjgtOWIyNThiZWIwYjRiXkEyXkFqcGdeQXVyMTQxNzMzNDI@._V1_SX300.jpg",
    runtime: 116,
    imdbRating: 8.5,
    userRating: 9,
  },
];

const average = (arr) =>
  arr.reduce((acc, cur, i, arr) => acc + cur / arr.length, 0);

const KEY = "8d5f20d0";

export default function App() {
  const [query, setQuery] = useState("");
  const [movies, setMovies] = useState([]);
  const [watched, setWatched] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [selectedId, setSelectedId] = useState(null);

  const handleSelectMovie = (id) => {
    setSelectedId(selectedId => id === selectedId ? null : id);
  }

  const handleCloseMovie = () => {
    setSelectedId(null);
  };

  const handleAddToWatched = (movie) => {
    setWatched((watched) => [...watched, movie]);
  }

  const handleDeleteWatched = (id) => {
    setWatched((watched) => watched.filter((movie) => movie.imdbID !== id));
  }

  useEffect(() => {
    const controller = new AbortController();
    const fetchMovies = async () => {
      try {
        setLoading(true);
        setError("");
        const res = await fetch(`https://www.omdbapi.com/?&apikey=${KEY}&s=${query}`, { signal: controller.signal })

        if (!res.ok) {
          throw new Error("Something went wrong while fetching the movies.");
        }

        const data = await res.json();

        if (data.Response === "False") throw new Error("Movie not found");

        setMovies(data.Search);
        setError("");
      } catch (err) {
        if (err.name !== "AbortError") {
          console.error(err);
          setError(err.message);
        }
      } finally {
        setLoading(false);
      }
    };

    if (query.length < 3) {
      setMovies([]);
      setError("");
      return;
    }
    handleCloseMovie();
    fetchMovies();

    return () => {
      controller.abort();
    };
  }, [query]);

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
            <MovieList
              movies={movies}
              onSelectMovie={handleSelectMovie}

            />
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

const Search = ({ query, setQuery }) => (
  <input
    className="search"
    type="text"
    placeholder="Search movies..."
    value={query}
    onChange={(e) => setQuery(e.target.value)}
  />
);

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
    }
    onAddWatched(newWatchedMovie);
    onCloseMovie();
  }

  useEffect(() => {
    const callback = (e) => {
      if (e.key === "Escape") {
        onCloseMovie();
      }
    };
    document.addEventListener("keydown", callback);

    return () => {
      document.removeEventListener("keydown", callback);
    }
  }, [onCloseMovie]);


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