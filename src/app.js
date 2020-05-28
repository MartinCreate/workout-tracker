import React, { useEffect } from "react";
import { useSelector } from "react-redux";
import axios from "./axios";
import Profile from "./profile";
import Home from "./home";
import CreateWorkout from "./create-workout";
import TrackWorkout from "./track-workout";
import ViewWoData from "./view-workout-data";
import { BrowserRouter, Route, Link } from "react-router-dom";

export default function App() {
    useEffect(() => {}, []);

    return (
        <div id="app-component-container">
            <BrowserRouter>
                <Route exact path="/" component={Home} />
                <Route exact path="/create-workout" component={CreateWorkout} />
                <Route exact path="/track-workout" component={TrackWorkout} />
                <Route exact path="/view-workout-data" component={ViewWoData} />
            </BrowserRouter>
        </div>
    );
}
