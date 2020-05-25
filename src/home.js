import React, { useEffect } from "react";
import { useSelector } from "react-redux";
import axios from "./axios";
import Profile from "./profile";
import CreateWorkout from "./create-workout";
import { BrowserRouter, Route, Link } from "react-router-dom";

export default function Home() {
    useEffect(() => {}, []);

    return (
        <div className="component-container">
            <div className="component">
                <h1>
                    Welcome back
                    {/* , {first} {last} */}
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

            {/* <Route exact path="/" component={Home} />
                <Route exact path="/create-workout" component={CreateWorkout} /> */}

            {/* <div id="browser-router">
                        <div id="header">
                            <div id="logo-div">
                                <Link to="/">
                                    <img
                                        src="/logo.png"
                                        alt="amjam logo"
                                        id="logo"
                                    />
                                </Link>
                                <br />
                                <a href="/logout" id="logout">
                                    Logout
                                </a>
                            </div>

                            <div className="navbar">
                                <Link
                                    to="/"
                                    id="nav-profile"
                                    className="nav-link profile"
                                    onClick={(e) => this.addHighlight(e)}
                                >
                                    Profile
                                </Link>
                                <Link
                                    to="/friends"
                                    id="nav-friends"
                                    className="nav-link friends"
                                    onClick={(e) => this.addHighlight(e)}
                                >
                                    Friends
                                </Link>
                                <Link
                                    to="/users"
                                    id="nav-search"
                                    className="nav-link users"
                                    onClick={(e) => this.addHighlight(e)}
                                >
                                    Search
                                </Link>
                                <Link
                                    to="/private-chat"
                                    id="nav-chat"
                                    className="nav-link private-chat last-link"
                                    onClick={(e) => this.addHighlight(e)}
                                >
                                    Chat
                                </Link>
                            </div>

                            <div id="header-pic">
                                <ProfilePic
                                    toggleModal={this.toggleModal}
                                    first={first}
                                    last={last}
                                    imageUrl={image_url}
                                />
                            </div>
                        </div>
                        {this.state.uploaderIsVisible && (
                            <div id="upload-container">
                                <Uploader
                                    setImgUrl={this.setImgUrl}
                                    toggleModal={this.toggleModal}
                                    id={id}
                                />
                            </div>
                        )}

                        <Route
                            exact
                            path="/"
                            render={() => (
                                <Profile
                                    toggleModal={this.toggleModal}
                                    id={id}
                                    first={first}
                                    last={last}
                                    imageUrl={image_url}
                                    bio={bio}
                                    updateBio={this.updateBio}
                                />
                            )}
                        />

                        <Route
                            exact
                            path="/user/:id"
                            render={(props) => (
                                <OtherProfile
                                    key={props.match.url}
                                    match={props.match}
                                    history={props.history}
                                />
                            )}
                        />

                        <Route
                            exact
                            path="/friends"
                            component={FriendsAndWannabes}
                        />

                        <Route exact path="/users" component={FindPeople} />
                        <Route exact path="/public-chat" component={Chat} />
                        <Route
                            exact
                            path="/private-chat"
                            component={PrivateChat}
                        />
                    </div> */}
        </div>
    );
}
