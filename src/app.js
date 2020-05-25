import React, { useEffect } from "react";
import { useSelector } from "react-redux";
import axios from "./axios";
import Profile from "./profile";
import Home from "./home";
import CreateWorkout from "./create-workout";
import { BrowserRouter, Route, Link } from "react-router-dom";

export default function App() {
    useEffect(() => {}, []);

    return (
        <div id="app-component-container">
            <BrowserRouter>
                <Route exact path="/" component={Home} />
                <Route exact path="/create-workout" component={CreateWorkout} />
            </BrowserRouter>
        </div>
    );
}
