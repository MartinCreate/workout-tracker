import React from "react";
import { HashRouter, Route } from "react-router-dom";
import Register from "./register";
import Login from "./login";
import ResetPassword from "./reset";

export default function Welcome() {
    return (
        <div className="welcome-component">
            <div className="welcome-backdrop">
                <h1>TrackerX</h1>
                <p className="subTitle">Fully customizable exercise tracker</p>

                <HashRouter>
                    <div>
                        <Route exact path="/" component={Register} />
                        <Route path="/login" component={Login} />
                        <Route path="/reset" component={ResetPassword} />
                    </div>
                </HashRouter>
            </div>
        </div>
    );
}
