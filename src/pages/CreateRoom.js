import React, { useState } from "react";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import "../App.css";
import axios from "../utils/axiosInstance";
import { useNavigate } from "react-router-dom";
import logo from "../assets/Walmart_logo.svg";

export default function CreateRoom() {
  const navigate = useNavigate();

  //Create Room
  const [roomName, setRoomName] = useState("");
  const [username, setUsername] = useState("");
  const [jql, setJql] = useState("");
  const [error, setError] = useState("");

  //Enter Room
  const [roomId, setRoomId] = useState("");
  const [joinerName, setJoinerName] = useState("");

  //Create Room Methods
  const handleCreateRoom = () => {
    if (roomName !== "" && username !== "") {
      const request = {
        roomName: roomName,
        username: username,
        jql: "jql",
      };
      axios
        .post("http://ec2-18-191-179-200.us-east-2.compute.amazonaws.com:8080/create-room", { ...request })
        .then((response) => {
          if (response.data && response.data.roomId) {
            sessionStorage.setItem(
              "userSession",
              JSON.stringify(response.data)
            );
            navigate("/poker", {
              state: {
                id: response.data.roomId,
                name: response.data.username,
                admin: response.data.admin,
                popUp: true
              },
            });
          }
        })
        .catch((error) => {
          console.error("Error creating room:", error);
        });
    } else {
      setError("Invalid Entry");
    }
  };

  //Enter Room Methods
  const handleJoinRoom = () => {
    console.log("Enter Room");
    if (roomId !== "" && joinerName !== "") {
      const request = {
        roomId: roomId,
        username: joinerName,
      };
      axios
        .post("http://ec2-18-191-179-200.us-east-2.compute.amazonaws.com:8080/join-room", { ...request })
        .then((response) => {
          if (response.status === 201) {
            sessionStorage.setItem("userSession", JSON.stringify(response.data));
            navigate("/poker", {
              state: {
                id: response.data.roomId,
                name: response.data.username,
                admin: response.data.admin,
                userList: response.data.userList
              },
            });
          } else {
            //Todo: handle error
            console.error("Error joining room");
          }
        })
        .catch((error) => {
          //Todo: handle error
          console.error("Error creating room:", error);
        });
    } else {
      setError("Invalid Entry");
    }
  };

  return (
    <div className="header">
      <h1 className="title">Walmart's Planning Poker</h1>
      <div className="login-screen">
        <div className="logo">
          <img src={logo} alt="Logo" />
        </div>
        <div className="create-session">
          <h2>Create Room</h2>
          <TextField
            fullWidth
            id="standard-basic"
            label="Enter Room Name"
            required
            autoComplete="off"
            variant="standard"
            onChange={(e) => setRoomName(e.target.value)}
          />
          <TextField
            fullWidth
            id="standard-basic"
            label="Enter User Name"
            required
            autoComplete="off"
            variant="standard"
            onChange={(e) => setUsername(e.target.value)}
          />
          <div className="bottomButtons">
            <Button variant="outlined" onClick={handleCreateRoom}>
              Create Room
            </Button>
          </div>
        </div>
        <div className="join-session">
          <h2>Join Room</h2>
          <TextField
            fullWidth
            id="standard-basic"
            label="Enter Room Id"
            required
            autoComplete="off"
            variant="standard"
            onChange={(e) => setRoomId(e.target.value)}
          />
          <TextField
            fullWidth
            id="standard-basic"
            label="Enter Name"
            required
            autoComplete="off"
            variant="standard"
            onChange={(e) => setJoinerName(e.target.value)}
          />
          <div className="bottomButtons">
            <Button variant="outlined" onClick={handleJoinRoom}>
              Join Room
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
