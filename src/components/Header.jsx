import React, { useEffect, useState } from "react";
import styled from "styled-components";
import { useDispatch, useSelector } from "react-redux";
import { Link, useNavigate } from "react-router-dom";

import { auth, provider } from "../firebase";
import {
  selectUserName,
  selectUserPhoto,
  setSignOutState,
  setUserLoginDetails,
} from "../features/user/userSlice";

import logo from "../assets/images/logo.svg";
import GithubIcon from "../assets/images/github-icon.svg";
import { UserAvatar } from "../assets/images";
import { navLinks } from "../data";
import moviesData from "../disneyPlusMoviesData.json";

// Header
const Header = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const userName = useSelector(selectUserName);
  const userPhoto = useSelector(selectUserPhoto);

  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [watchlistOpen, setWatchlistOpen] = useState(false);

  // check user login state
  useEffect(() => {
    auth.onAuthStateChanged(async (user) => {
      if (user) setUser(user);
    });
  }, [userName]); // eslint-disable-line react-hooks/exhaustive-deps

  // handle google auth
  const handleAuth = () => {
    if (!userName) {
      auth
        .signInWithPopup(provider)
        .then((result) => {
          setUser(result.user);
          navigate("/home");
        })
        .catch((error) => {
          console.error(error.message);
        });
    } else {
      auth
        .signOut()
        .then(() => {
          dispatch(setSignOutState());
          navigate("/");
        })
        .catch((err) => alert(err.message));
    }
  };

  // set user details
  const setUser = (user) => {
    dispatch(
      setUserLoginDetails({
        name: user.displayName,
        email: user.email,
        photo: user.photoURL,
      })
    );
  };

  const handleNavClick = (e, name, url) => {
    if (name === "Search") {
      e.preventDefault();
      setSearchOpen(true);
    } else if (name === "Watchlist") {
      e.preventDefault();
      setWatchlistOpen(true);
    } else if (name === "Home") {
      navigate("/home");
    } else if (["Originals", "Movies", "Series"].includes(name)) {
      navigate("/home");
    }
  };

  const allMoviesList = Object.entries(moviesData.movies || {}).map(
    ([id, data]) => ({ id, ...data })
  );

  const searchResults = searchQuery.trim()
    ? allMoviesList.filter((m) =>
        m.title.toLowerCase().includes(searchQuery.toLowerCase().trim())
      )
    : allMoviesList.slice(0, 6);

  const getWatchlistMovies = () => {
    try {
      const ids = JSON.parse(localStorage.getItem("disney_watchlist") || "[]");
      return allMoviesList.filter((m) => ids.includes(m.id));
    } catch {
      return [];
    }
  };

  return (
    <Nav>
      {/* Brand Logo */}
      <Logo>
        <Link to={userName ? "/home" : "/"}>
          <img src={logo} alt="Disney+" />
        </Link>
      </Logo>

      {!userName ? (
        // Login Button
        <Login onClick={handleAuth}>Login</Login>
      ) : (
        <>
          {/* Nav Menu */}
          <NavMenu>
            {navLinks.map(({ name, icon, url }, i) => (
              <a
                href={url}
                key={`Link-${i}`}
                onClick={(e) => handleNavClick(e, name, url)}
              >
                {/* Icon */}
                <img src={icon} alt={name} />
                {/* Name */}
                <span>{name}</span>
              </a>
            ))}

            {/* Github Source Code */}
            <a
              href="https://github.com/Ishant6565/DISNEYHOTSTAR"
              target="_blank"
              rel="noreferrer noopener"
              title="View Source Code"
            >
              {/* Icon */}
              <img src={GithubIcon} alt="Github" />
              {/* Name */}
              <span>Github</span>
            </a>
          </NavMenu>
          <SignOut>
            {/* user image */}
            <UserImg
              src={userPhoto || UserAvatar}
              onError={(e) => {
                e.currentTarget.onerror = null;
                e.currentTarget.src = UserAvatar;
              }}
              referrerPolicy="no-referrer"
              alt={userName || "Ishant"}
              title={userName || "Ishant"}
            />
            {/* Sign out */}
            <DropDown>
              <span onClick={handleAuth} title="Sign out">
                Sign out
              </span>
            </DropDown>
          </SignOut>
        </>
      )}

      {/* Search Modal */}
      {searchOpen && (
        <ModalBackdrop onClick={() => setSearchOpen(false)}>
          <ModalBox onClick={(e) => e.stopPropagation()}>
            <ModalHeader>
              <SearchInput
                type="text"
                autoFocus
                placeholder="Search by title, character, or genre..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <ModalClose onClick={() => setSearchOpen(false)}>✕</ModalClose>
            </ModalHeader>
            <SearchResultsList>
              {searchResults.map((movie) => (
                <SearchResultCard
                  key={movie.id}
                  to={`/detail/${movie.id}`}
                  onClick={() => {
                    setSearchOpen(false);
                    setSearchQuery("");
                  }}
                >
                  <img src={movie.cardImg} alt={movie.title} />
                  <div>
                    <h4>{movie.title}</h4>
                    <p>{movie.subTitle}</p>
                  </div>
                </SearchResultCard>
              ))}
              {searchResults.length === 0 && (
                <EmptyState>No Disney titles found for "{searchQuery}"</EmptyState>
              )}
            </SearchResultsList>
          </ModalBox>
        </ModalBackdrop>
      )}

      {/* Watchlist Modal */}
      {watchlistOpen && (
        <ModalBackdrop onClick={() => setWatchlistOpen(false)}>
          <ModalBox onClick={(e) => e.stopPropagation()}>
            <ModalHeader>
              <ModalTitle>My Watchlist</ModalTitle>
              <ModalClose onClick={() => setWatchlistOpen(false)}>✕</ModalClose>
            </ModalHeader>
            <SearchResultsList>
              {getWatchlistMovies().map((movie) => (
                <SearchResultCard
                  key={movie.id}
                  to={`/detail/${movie.id}`}
                  onClick={() => setWatchlistOpen(false)}
                >
                  <img src={movie.cardImg} alt={movie.title} />
                  <div>
                    <h4>{movie.title}</h4>
                    <p>{movie.subTitle}</p>
                  </div>
                </SearchResultCard>
              ))}
              {getWatchlistMovies().length === 0 && (
                <EmptyState>
                  Your watchlist is currently empty. Click the "+" button on any title to add it!
                </EmptyState>
              )}
            </SearchResultsList>
          </ModalBox>
        </ModalBackdrop>
      )}
    </Nav>
  );
};

// Nav styles
const Nav = styled.nav`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  height: 70px;
  background-color: #090b13;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 36px;
  letter-spacing: 16px;
  z-index: 3;
`;

// Logo styles
const Logo = styled.div`
  padding: 0;
  width: 80px;
  margin-top: 4px;
  max-height: 70px;
  font-size: 0;
  display: inline-block;

  img {
    display: block;
    width: 100%;
  }
`;

// Nav Menu styles
const NavMenu = styled.div`
  align-items: center;
  display: flex;
  flex-flow: row nowrap;
  height: 100%;
  justify-content: flex-end;
  padding: 0;
  margin: 0;
  position: relative;
  margin-right: auto;
  margin-left: 25px;

  a {
    display: flex;
    align-items: center;
    padding: 0 12px;
    cursor: pointer;

    img {
      height: 20px;
      min-width: 20px;
      width: 20px;
      z-index: auto;
    }

    span {
      color: rgb(249, 249, 249);
      font-size: 13px;
      letter-spacing: 1.42px;
      line-height: 1.08;
      padding: 8px;
      white-space: nowrap;
      position: relative;
      text-transform: uppercase;

      &:before {
        background-color: rgb(249, 249, 249);
        border-radius: 0 0 4px 4px;
        bottom: -6px;
        content: "";
        height: 2px;
        left: 0;
        opacity: 0;
        position: absolute;
        right: 0;
        transform-origin: left center;
        transform: scaleX(0);
        transition: all 250ms cubic-bezier(0.25, 0.46, 0.45, 0.94) 0s;
        visibility: hidden;
        width: auto;
      }
    }

    &:hover {
      span:before {
        transform: scaleX(1);
        visibility: visible;
        opacity: 1 !important;
      }
    }
  }

  @media only screen and (max-width: 768px) {
    display: none;
  }
`;

// Login styles
const Login = styled.button`
  background-color: rgba(0, 0, 0, 0.6);
  padding: 10px;
  text-transform: uppercase;
  letter-spacing: 1.5px;
  border: 1px solid #f9f9f9;
  color: #f9f9f9;
  border-radius: 4px;
  transition: all 0.2s ease 0s;

  &:hover {
    background-color: #f9f9f9;
    color: #090b13;
    border-color: transparent;
  }
`;

// User image styles
const UserImg = styled.img`
  height: 100%;
  width: 100%;
  border-radius: 50%;
`;

// Drop Down styles
const DropDown = styled.div`
  position: absolute;
  top: 48px;
  right: 0;
  background: rgb(19, 19, 19);
  border: 1px solid rgba(151, 151, 151, 0.34);
  border-radius: 4px;
  box-shadow: 0 4px 18px rgba(0, 0, 0, 0.6);
  padding: 10px;
  font-size: 14px;
  letter-spacing: 1.5px;
  width: 110px;
  text-align: center;
  opacity: 0;
  pointer-events: none;
  transition: all 0.25s ease;
`;

// Sign Out styles
const SignOut = styled.div`
  position: relative;
  height: 48px;
  width: 48px;
  display: flex;
  cursor: pointer;
  align-items: center;
  justify-content: center;

  &:hover {
    ${DropDown} {
      opacity: 1;
      pointer-events: auto;
    }
  }
`;

const ModalBackdrop = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(4, 7, 20, 0.85);
  backdrop-filter: blur(12px);
  z-index: 1000;
  display: flex;
  justify-content: center;
  align-items: flex-start;
  padding: 90px 20px 40px;
  letter-spacing: normal;
`;

const ModalBox = styled.div`
  background: #0e111d;
  border: 1px solid rgba(255, 255, 255, 0.15);
  border-radius: 12px;
  max-width: 650px;
  width: 100%;
  max-height: 80vh;
  display: flex;
  flex-direction: column;
  box-shadow: 0 25px 60px rgba(0, 0, 0, 0.8);
  overflow: hidden;
  letter-spacing: normal;
  animation: slideDown 0.25s cubic-bezier(0.16, 1, 0.3, 1);

  @keyframes slideDown {
    from {
      opacity: 0;
      transform: translateY(-20px) scale(0.98);
    }
    to {
      opacity: 1;
      transform: translateY(0) scale(1);
    }
  }
`;

const ModalHeader = styled.div`
  display: flex;
  align-items: center;
  padding: 16px 20px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  gap: 12px;
  letter-spacing: normal;
`;

const ModalTitle = styled.h3`
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  color: #f9f9f9;
  flex: 1;
  letter-spacing: 0.5px;
`;

const SearchInput = styled.input`
  flex: 1;
  background: rgba(255, 255, 255, 0.08);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 6px;
  padding: 12px 16px;
  color: #fff;
  font-size: 16px;
  outline: none;
  letter-spacing: normal;
  transition: all 0.2s;

  &:focus {
    border-color: #0063e5;
    background: rgba(255, 255, 255, 0.12);
    box-shadow: 0 0 12px rgba(0, 99, 229, 0.5);
  }

  &::placeholder {
    color: rgba(255, 255, 255, 0.5);
    letter-spacing: normal;
  }
`;

const ModalClose = styled.button`
  background: transparent;
  border: none;
  color: rgba(255, 255, 255, 0.7);
  font-size: 20px;
  cursor: pointer;
  padding: 4px 8px;
  border-radius: 4px;
  letter-spacing: normal;
  transition: all 0.2s;

  &:hover {
    color: #fff;
    background: rgba(255, 255, 255, 0.1);
  }
`;

const SearchResultsList = styled.div`
  overflow-y: auto;
  padding: 12px;
  display: flex;
  flex-direction: column;
  gap: 8px;
  letter-spacing: normal;
`;

const SearchResultCard = styled(Link)`
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 10px;
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid transparent;
  transition: all 0.2s;
  text-decoration: none;
  letter-spacing: normal;

  img {
    width: 110px;
    height: 62px;
    object-fit: cover;
    border-radius: 6px;
    flex-shrink: 0;
  }

  div {
    display: flex;
    flex-direction: column;
    gap: 4px;
    letter-spacing: normal;

    h4 {
      margin: 0;
      font-size: 16px;
      font-weight: 600;
      color: #f9f9f9;
      letter-spacing: 0.2px;
    }

    p {
      margin: 0;
      font-size: 13px;
      color: rgba(249, 249, 249, 0.7);
      line-height: 1.4;
      letter-spacing: normal;
    }
  }

  &:hover {
    background: rgba(255, 255, 255, 0.08);
    border-color: rgba(0, 99, 229, 0.6);
    transform: translateX(4px);
  }
`;

const EmptyState = styled.div`
  padding: 36px 20px;
  text-align: center;
  color: rgba(255, 255, 255, 0.6);
  font-size: 14px;
  letter-spacing: normal;
`;

export default Header;
