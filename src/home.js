import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import axios from "./axios";
import Profile from "./profile";
import CreateWorkout from "./create-workout";
import TrackWorkout from "./track-workout";
import ViewWoData from "./view-workout-data";

import { BrowserRouter, Route, Link } from "react-router-dom";

export default function Home() {
    const [user, setUser] = useState();

    useEffect(() => {
        axios.get("/homepage").then(({ data }) => {
            console.log("data: ", data);
            setUser(data);
        });
    }, []);

    useEffect(() => {
        console.log("user: ", user);
    }, [user]);

    return (
        <div className="component-container">
            <div className="component">
                <h1 id="home-title">
                    Welcome<span id="comma">,</span>{" "}
                    {user && user.map((x) => <span key={x.id}>{x.first}</span>)}
                </h1>
                <a href="/logout" id="logout">
                    Logout
                </a>
                <div id="home-menu-container">
                    <Link to="/create-workout" className="home-menu-link">
                        <div className="home-menu-el">
                            <p>Create Workout</p>
                            <img src="create.png" />
                        </div>
                    </Link>
                    <Link to="/track-workout" className="home-menu-link">
                        <div className="home-menu-el">
                            <p>Track Workout</p>
                            <img src="track.png" />
                        </div>
                    </Link>
                    <Link to="/view-workout-data" className="home-menu-link">
                        <div className="home-menu-el">
                            <p>View Workout Data</p>
                            <img src="view.png" />
                        </div>
                    </Link>
                </div>
            </div>
        </div>
    );
}
