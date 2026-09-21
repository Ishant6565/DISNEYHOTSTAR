import React, { useEffect } from "react";
import { useDispatch } from "react-redux";
import db, { auth } from "../firebase";
import { useNavigate } from "react-router-dom";
import styled from "styled-components";

import { setMovies } from "../features/movie/movieSlice";
import {
  ImgSlider,
  Viewers,
  Recommends,
  NewDisney,
  Originals,
  Trending,
} from ".";

import { HomeBg } from "../assets/images";

// Home
const Home = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  // check user login state
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (!user) {
        navigate("/login");
      }
    });
    return () => {
      if (typeof unsubscribe === "function") unsubscribe();
    };
  }, [navigate]);

  // fetch movies from database
  useEffect(() => {
    const unsubscribe = db.collection("movies").onSnapshot((snapshot) => {
      const recommends = [];
      const newDisneys = [];
      const originals = [];
      const trending = [];

      snapshot.docs.forEach((doc) => {
        const data = doc.data();
        switch (data.type) {
          case "recommend":
            recommends.push({ id: doc.id, ...data });
            break;
          case "new":
            newDisneys.push({ id: doc.id, ...data });
            break;
          case "original":
            originals.push({ id: doc.id, ...data });
            break;
          case "trending":
            trending.push({ id: doc.id, ...data });
            break;
          default:
            break;
        }
      });

      // set movies to redux store
      dispatch(
        setMovies({
          recommend: recommends,
          newDisney: newDisneys,
          original: originals,
          trending: trending,
        })
      );
    });

    return () => {
      if (typeof unsubscribe === "function") unsubscribe();
    };
  }, [dispatch]);

  return (
    <Container>
      {/* Slider */}
      <ImgSlider />
      {/* Viewers */}
      <Viewers />
      {/* Recommended */}
      <Recommends />
      {/* New to disney+ */}
      <NewDisney />
      {/* Disney originals */}
      <Originals />
      {/* Trending */}
      <Trending />
    </Container>
  );
};

// Container styles
const Container = styled.main`
  position: relative;
  min-height: calc(100% - 250px);
  overflow-x: hidden;
  display: block;
  top: 72px;
  padding: calc(3.5vw + 5px);

  &:after {
    background: url(${HomeBg}) center center / cover no-repeat fixed;
    content: "";
    position: absolute;
    inset: 0;
    opacity: 1;
    z-index: -1;
  }
`;

export default Home;
