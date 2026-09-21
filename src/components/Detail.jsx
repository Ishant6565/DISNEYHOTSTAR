import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import styled from "styled-components";

import db from "../firebase";
import { PlayBlack, PlayWhite, GroupIcon } from "../assets/images";
import { DisneyVideo } from "../assets/videos";

// Detail
const Detail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [detailData, setDetailData] = useState({});
  const [showVideo, setShowVideo] = useState(false);
  const [groupWatchToast, setGroupWatchToast] = useState(false);
  const [inWatchlist, setInWatchlist] = useState(() => {
    try {
      const list = JSON.parse(localStorage.getItem("disney_watchlist") || "[]");
      return list.includes(id);
    } catch {
      return false;
    }
  });

  // fetch movie details
  useEffect(() => {
    db.collection("movies")
      .doc(id)
      .get()
      .then((doc) => {
        if (doc.exists) {
          setDetailData(doc.data());
        } else {
          console.log("No Such Document in firebase!");
          navigate("/home");
        }
      })
      .catch((error) => {
        console.log("Error getting document:", error);
      });
  }, [id, navigate]);

  const [watchlistToast, setWatchlistToast] = useState("");

  const handleToggleWatchlist = () => {
    try {
      const list = JSON.parse(localStorage.getItem("disney_watchlist") || "[]");
      let nextList;
      if (inWatchlist) {
        nextList = list.filter((item) => item !== id);
        setInWatchlist(false);
        setWatchlistToast("Removed from Watchlist");
      } else {
        nextList = [...list, id];
        setInWatchlist(true);
        setWatchlistToast("Added to Watchlist!");
      }
      localStorage.setItem("disney_watchlist", JSON.stringify(nextList));
      setTimeout(() => setWatchlistToast(""), 2200);
    } catch (e) {
      setInWatchlist(!inWatchlist);
    }
  };

  const handleGroupWatch = () => {
    try {
      navigator.clipboard.writeText(window.location.href);
    } catch {}
    setGroupWatchToast(true);
    setTimeout(() => setGroupWatchToast(false), 2500);
  };

  return (
    <Container>
      {/* Background Image */}
      {detailData.backgroundImg && (
        <Background>
          <img src={detailData.backgroundImg} alt={detailData.title || "Disney+"} />
        </Background>
      )}

      {/* Title */}
      {detailData.titleImg && (
        <ImageTitle>
          <img src={detailData.titleImg} alt={detailData.title || "Disney+"} />
        </ImageTitle>
      )}

      {/* Content */}
      <ContentMeta>
        {/* Controls */}
        <Controls>
          {/* Play */}
          <Player onClick={() => setShowVideo(true)}>
            <img src={PlayBlack} alt="Play" />
            <span>Play</span>
          </Player>
          {/* Play Trailer */}
          <Trailer onClick={() => setShowVideo(true)}>
            <img src={PlayWhite} alt="Play Trailer" />
            <span>Trailer</span>
          </Trailer>
          {/* Add List */}
          <AddList
            $active={inWatchlist}
            title={inWatchlist ? "Remove from Watchlist" : "Add to Watchlist"}
            onClick={handleToggleWatchlist}
          >
            <IconWrap key={inWatchlist ? "checked" : "plus"} $active={inWatchlist}>
              {inWatchlist ? (
                <svg viewBox="0 0 24 24">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              ) : (
                <svg viewBox="0 0 24 24">
                  <line x1="12" y1="5" x2="12" y2="19" />
                  <line x1="5" y1="12" x2="19" y2="12" />
                </svg>
              )}
            </IconWrap>
          </AddList>
          {/* Group Watch */}
          <GroupWatch title="Watch with others" onClick={handleGroupWatch}>
            <div>
              <img src={GroupIcon} alt="Group Icon" />
            </div>
          </GroupWatch>
          {watchlistToast && <Toast>{watchlistToast}</Toast>}
          {groupWatchToast && (
            <Toast>GroupWatch link copied to clipboard!</Toast>
          )}
        </Controls>
        {/* Sub title */}
        <SubTitle>{detailData.subTitle || detailData.subtitle}</SubTitle>

        {/* Description */}
        <Description>{detailData.description}</Description>
      </ContentMeta>

      {/* Video Modal */}
      {showVideo && (
        <VideoModal onClick={() => setShowVideo(false)}>
          <ModalContent onClick={(e) => e.stopPropagation()}>
            <CloseButton onClick={() => setShowVideo(false)}>✕</CloseButton>
            <video controls autoPlay style={{ width: "100%", borderRadius: "8px" }}>
              <source src={DisneyVideo} type="video/mp4" />
            </video>
          </ModalContent>
        </VideoModal>
      )}
    </Container>
  );
};

// Container styles
const Container = styled.div`
  position: relative;
  min-height: calc(100vh - 250px);
  overflow: hidden;
  display: block;
  top: 72px;
  padding: 0 calc(3.5vw + 5px);
`;

// Background styles
const Background = styled.div`
  left: 0;
  opacity: 0.8;
  position: fixed;
  right: 0;
  top: 0;
  z-index: -1;

  img {
    width: 100vw;
    height: 100vh;

    @media only screen and (max-width: 768px) {
      width: initial;
    }
  }
`;

// Image title styles
const ImageTitle = styled.div`
  align-items: flex-end;
  display: flex;
  -webkit-box-pack: start;
  justify-content: flex-start;
  margin: 0 auto;
  height: 30vw;
  min-height: 170px;
  padding-bottom: 24px;
  width: 100%;

  img {
    max-width: 600px;
    min-width: 200px;
    width: 35vw;
  }
`;

// Content Meta styles
const ContentMeta = styled.div`
  max-width: 874px;
`;

// Controls styles
const Controls = styled.div`
  align-items: center;
  display: flex;
  flex-flow: row nowrap;
  margin: 24px 0;
  min-height: 56px;
`;

// PlayerButton
const Player = styled.button`
  font-size: 15px;
  margin: 0 22px 0 0;
  padding: 0 24px;
  height: 56px;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  letter-spacing: 1.8;
  text-align: center;
  text-transform: uppercase;
  background: rgb(249, 249, 249);
  border: none;
  color: rgb(0, 0, 0);

  img {
    width: 32px;
  }

  &:hover {
    background: rgb(198, 198, 198);
  }

  @media screen and (max-width: 768px) {
    height: 45px;
    padding: 0 22px;
    font-size: 12px;
    margin: 0 10px 0 0;

    img {
      width: 25px;
    }
  }
`;

// Trailer styles
const Trailer = styled(Player)`
  background: rgba(0, 0, 0, 0.3);
  border: 1px solid rgb(249, 249, 249);
  color: rgb(249, 249, 249);
`;

// Add List styles
const AddList = styled.button`
  margin-right: 16px;
  height: 44px;
  width: 44px;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: ${(props) =>
    props.$active ? "rgba(0, 230, 118, 0.2)" : "rgba(0, 0, 0, 0.6)"};
  border-radius: 50%;
  border: 2px solid ${(props) => (props.$active ? "#00e676" : "#fff")};
  cursor: pointer;
  transition: all 0.25s cubic-bezier(0.25, 0.8, 0.25, 1);
  box-shadow: ${(props) =>
    props.$active ? "0 0 16px rgba(0, 230, 118, 0.45)" : "none"};
  outline: none;

  &:hover {
    transform: scale(1.1);
    background-color: ${(props) =>
      props.$active ? "rgba(0, 230, 118, 0.35)" : "rgba(255, 255, 255, 0.2)"};
  }

  &:active {
    transform: scale(0.92);
  }
`;

const IconWrap = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  animation: popIn 0.35s cubic-bezier(0.175, 0.885, 0.32, 1.275);

  @keyframes popIn {
    0% {
      transform: scale(0.3) rotate(-30deg);
      opacity: 0;
    }
    100% {
      transform: scale(1) rotate(0deg);
      opacity: 1;
    }
  }

  svg {
    width: 22px;
    height: 22px;
    fill: none;
    stroke: ${(props) => (props.$active ? "#00e676" : "#f9f9f9")};
    stroke-width: 2.8;
    stroke-linecap: round;
    stroke-linejoin: round;
  }
`;

// Group watch styles
const GroupWatch = styled.div`
  height: 44px;
  width: 44px;
  border-radius: 50%;
  display: flex;
  justify-content: center;
  align-items: center;
  cursor: pointer;
  background: #fff;

  div {
    height: 40px;
    width: 40px;
    background: rgb(0, 0, 0);
    border-radius: 50%;

    img {
      width: 100%;
    }
  }
`;

// Sub title styles
const SubTitle = styled.div`
  color: rgb(249, 249, 249);
  font-size: 15px;
  min-height: 20px;

  @media only screen and (max-width: 768px) {
    font-size: 12px;
  }
`;

// Description styles
const Description = styled.div`
  line-height: 1.4;
  font-size: 20px;
  padding: 16px 0;
  color: rgb(249, 249, 249);

  @media only screen and (max-width: 768px) {
    font-size: 14px;
  }
`;


const Toast = styled.div`
  background: rgba(4, 131, 238, 0.9);
  color: white;
  padding: 8px 16px;
  border-radius: 20px;
  font-size: 13px;
  margin-left: 12px;
  backdrop-filter: blur(8px);
  animation: fadeIn 0.3s ease;

  @keyframes fadeIn {
    from { opacity: 0; transform: translateY(6px); }
    to { opacity: 1; transform: translateY(0); }
  }
`;

const VideoModal = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.85);
  backdrop-filter: blur(10px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
  padding: 20px;
`;

const ModalContent = styled.div`
  position: relative;
  max-width: 800px;
  width: 100%;
  background: #090b13;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 20px 50px rgba(0, 0, 0, 0.9);
  border: 1px solid rgba(255, 255, 255, 0.1);
`;

const CloseButton = styled.button`
  position: absolute;
  top: 12px;
  right: 12px;
  background: rgba(0, 0, 0, 0.6);
  color: #fff;
  border: none;
  border-radius: 50%;
  width: 36px;
  height: 36px;
  font-size: 18px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  z-index: 10;
  transition: all 0.2s;

  &:hover {
    background: rgba(255, 255, 255, 0.2);
    transform: scale(1.1);
  }
`;

export default Detail;
