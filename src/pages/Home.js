import React, { useEffect, useState } from "react";
import ExitToAppOutlinedIcon from '@mui/icons-material/ExitToAppOutlined';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { Button, Typography } from "@mui/material";
import "../App.css";
import ai from "../assets/ai.png";
import businessman from "../assets/businessman.png";
import robot3 from "../assets/robot (3).png";
import robot from "../assets/robot.png";
import io from 'socket.io-client';
import axios from "../utils/axiosInstance";
import { useNavigate } from "react-router-dom";

function Home() {
    const navigate = useNavigate();

    const [isFlipped, setIsFlipped] = useState(false);
    const [isFrontCard, setIsFrontCard] = useState(true);

    // const userList = location && location.state && location.state.userList ? location.state.userList : [];
    const [userDetails, setUserDetails] = useState([]);
    
    const [leftView, setLeftView] = useState();
    const [topView, setTopView] = useState();
    const [rightView, setRightView] = useState();
    const [bottomView, setBottomView] = useState();
    const [voteStatus, setVoteStatus] = useState(false);
    const [voteValue, setVoteValue] = useState();
    const voteOptions = [1, 2, 3, 5, 8];

    const userSession = JSON.parse(sessionStorage.getItem('userSession'));
    const [isAdmin, setIsAdmin] = useState(userSession && userSession.admin ? userSession.admin : false);

    useEffect(() => {
      const socketInstance = io.connect('http://ec2-3-135-237-158.us-east-2.compute.amazonaws.com:8080', {
        withCredentials: true, //Setting it true will enable sending cookies to server
      });

      socketInstance.emit("join-room", (response) => {
        if(response.status !== 201) {
          navigate("/");
          return;
        }

        if(userDetails && userDetails.length === 0) {
          fetchUserDetails();
        } else {
          updateMembersInTable(userDetails);
        }
      });

      socketInstance.on("vote-casted", (response) => {
        const { userId, voted } = response.data;
        const userList = [ ...userDetails ];
        userList.map(user => {
          if(user.userId === userId) {
            user.voted = voted;
          }
          return user;
        })
        updateParticipantVoteStatus(userId, userList);
      });

      socketInstance.on("users-update", (response) => {
        if(response && response.status === 201) {
          updateMembersInTable(response.data);
        }
      })

      socketInstance.on("card-revealed", (response) => {
        console.log(response);
        updateMembersInTable(response.usersData);
        if (isFrontCard) {
          setIsFlipped(true);
          setIsFrontCard(!isFrontCard);
          setTimeout(() => {
            setIsFlipped(false);
          }, 500); // Change text and remove flip class after 0.5 second
        }
      });

      return () => {
        socketInstance.disconnect();
      };
    }, []);

    const fetchUserDetails = () => {
      const userSession = JSON.parse(sessionStorage.getItem("userSession"));
      if(userSession) {
        axios.get("http://ec2-3-135-237-158.us-east-2.compute.amazonaws.com:8080/user-details", { params: { roomId: userSession.roomId } }).then((response) => {
          if(response && response.data && response.data.status === 201) {
            updateMembersInTable(response.data.users);
          }
        }).catch((error) => {
          console.log("fetchUserDetails error: ", error);
        });
      }
    }

    const castVote = (option) => {
      const userSession = JSON.parse(sessionStorage.getItem("userSession"));
      const request = {...userSession, vote: option};
      setVoteStatus(true);
      setVoteValue(option);
      axios.post("http://ec2-3-135-237-158.us-east-2.compute.amazonaws.com:8080/cast-vote", { ...request }).then((response) => {
        if(response && response.status === 201) {
          console.log("castVote response: ", response.data);
        }
      }).catch((error) => {
        console.log("castVote error: ", error);
      });
    }

    const updateMembersInTable = (userList) => {
      const list = userList.filter(member => !member.admin);
      const left = new Map(), right = new Map(), top = new Map(), bottom = new Map();
      
      list.forEach((participant, index) => {
        if(list.length >= 4 && index === list.length - 1) {
          right.set(participant.userId, participant);
        } else if(list.length >= 4 && index === list.length - 2) {
          left.set(participant.userId, participant);
        } else {
          if(index%2 === 0) {
            top.set(participant.userId, participant);
          } else {
            bottom.set(participant.userId, participant);
          }
        }
      });

      setLeftView(left);
      setRightView(right);
      setTopView(top);
      setBottomView(bottom);
      setUserDetails(userList);
    }

    const updateParticipantVoteStatus = (userId, userList) => {
      if(leftView && leftView.has(userId)) {
        const userDetail = leftView.get(userId);
        userDetail.voted = true;
        leftView.set(userId, userDetail);
      } else if(rightView && rightView.has(userId)) {
        const userDetail = rightView.get(userId);
        userDetail.voted = true;
        rightView.set(userId, userDetail);
      } else if(topView && topView.has(userId)) {
        const userDetail = topView.get(userId);
        userDetail.voted = true;
        topView.set(userId, userDetail);
      } else if(bottomView && bottomView.has(userId)) {
        const userDetail = bottomView.get(userId);
        userDetail.voted = true;
        bottomView.set(userId, userDetail);
      }
      setUserDetails(userList);
    };

    const handleRevealCard = () => {
      axios.get("http://ec2-3-135-237-158.us-east-2.compute.amazonaws.com:8080/reveal-card").then(res => {
        if(res.status === 200) {
          console.log("Reveal Card response: ", res.data);
        }
      }).catch(err => {
        console.log("handleRevealCard error: ", err);
      })
    };

    const handleLeaveRoom = () => {
      axios.get("http://ec2-3-135-237-158.us-east-2.compute.amazonaws.com:8080/leave-room").then(res => {
        if(res.status === 201) {
          console.log("Leave Room response: ", res);
          navigate("/")
        }
      }).catch(err => {
        console.log("handleLeaveRoom error: ", err);
      })
    }

    return (
      <div className="board-container">
        <div className="leave-room">
          <Button variant="outlined" onClick={handleLeaveRoom} style={{background: '#e73434',color: 'black', margin: '20px'}} startIcon={<ExitToAppOutlinedIcon />}>
            Leave Room
          </Button>
        </div>
        <div className="poker-body">
          <div className="mid-profile" id="top">
            <div className="profile-icons mid-top">
              { topView && Array.from(topView).map(([key, value]) => (
                <div className="profile-card" spacing={2}>
                  <div className="profile-name">
                    <Typography>{value.username}</Typography>
                    { value.voted && <CheckCircleIcon color="success"/> }
                  </div>
                  <div className={`profile ${isFlipped ? "flip" : ""}`} key={key}>
                    {isFrontCard ? (
                      <img src={robot} alt="Profile Icon" />
                    ) : (
                      <Typography>{value.vote}</Typography>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="root-board">
            <div className="left-profile">
              <div className="profile-icons">
                { leftView && Array.from(leftView).map(([key, value]) => (
                  <div className="profile-card" spacing={2}>
                    <div className="profile-name">
                      <Typography>{value.username}</Typography>
                      { value.voted && <CheckCircleIcon color="success"/> }
                    </div>
                    <div className={`profile ${isFlipped ? "flip" : ""}`} key={key}>
                      {isFrontCard ? (
                        <img src={robot} alt="Profile Icon" />
                      ) : (
                        <Typography>{value.vote}</Typography>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="board">
              <div className="border-1">
                <div className="border-2">
                  <div className="border-3">
                    <div className="jira-container">
                      <div className="story-header color-blue">
                        <Typography>Recruiting/RECRUIT-73036</Typography>
                      </div>
                      <div className="story-title color-white">
                        <Typography>
                          Title: UX |Req Simplification| Requisition - Add Job
                          Openings
                        </Typography>
                      </div>
                      <div className="story-description color-white">
                        <Typography>
                          Description: As a Hiring manager when I click Requisition
                          Tile 1 - Add Job Openings I want to see job opening(classes)
                          for selected work groups and add role functionality
                        </Typography>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="right-profile">
              <div className="profile-icons">
                { rightView && Array.from(rightView).map(([key, value]) => (
                  <div className="profile-card" spacing={2}>
                    <div className="profile-name">
                      <Typography>{value.username}</Typography>
                      { value.voted && <CheckCircleIcon color="success"/> }
                    </div>
                    <div className={`profile ${isFlipped ? "flip" : ""}`} key={key}>
                      {isFrontCard ? (
                        <img src={robot} alt="Profile Icon" />
                      ) : (
                        <Typography>{value.vote}</Typography>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <div className="mid-profile" id="bottom">
            <div className="profile-icons mid-bottom">
              { bottomView && Array.from(bottomView).map(([key, value]) => (
                <div className="profile-card" spacing={2}>
                  <div className="profile-name">
                    <Typography>{value.username}</Typography>
                    { value.voted && <CheckCircleIcon color="success"/> }
                  </div>
                  <div className={`profile ${isFlipped ? "flip" : ""}`} key={key}>
                    {isFrontCard ? (
                      <img src={robot} alt="Profile Icon" />
                    ) : (
                      <Typography>{value.vote}</Typography>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
        <div className="points-container">
          { !isAdmin && voteOptions && voteOptions.map(option => (
            <div className="box" onClick={() => castVote(option)}>
              <Typography>{option}</Typography>
            </div>
          ))}
        </div>
        { isAdmin && isFrontCard && 
          <div className="reveal-button">
            <Button
              variant="contained"
              onClick={handleRevealCard}
              disabled={!isFrontCard}
              style={{ color: "#fff" }}
            >
              Reveal Cards
            </Button>
          </div>
        }
      </div>
    );
}

export default Home;
