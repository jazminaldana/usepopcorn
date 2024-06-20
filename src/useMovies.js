import { useState, useEffect } from "react";

const KEY = "8d5f20d0";

export const useMovies = (query) => {
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

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
    // handleCloseMovie();
    fetchMovies();

    return () => {
      controller.abort();
    };
  }, [query]);
  return { movies, loading, error };
};