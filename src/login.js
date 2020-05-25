import React from "react";
import axios from "./axios";
import { Link } from "react-router-dom";

export default class Login extends React.Component {
    constructor() {
        super();
        this.state = {
            error: false,
        };
    }

    handleChange(e) {
        this.setState({
            [e.target.name]: e.target.value,
        });
    }

    submit() {
        axios.post("/login", this.state).then(({ data }) => {
            if (data.success) {
                console.log("Login Success!");
                this.setState({
                    error: false,
                });

                location.replace("/");
            } else {
                this.setState({
                    error: true,
                });
            }
        });
    }

    render() {
        return (
            <div className="login-form form">
                <h3>Sign In</h3>
                <p className="toggle-comps">
                    or <Link to="/">Register</Link>
                </p>

                <div className="input-field-div">
                    <input
                        name="email"
                        placeholder="Email"
                        onChange={(e) => this.handleChange(e)}
                    />
                    <span className="focus-border"></span>
                </div>

                <div className="input-field-div">
                    <input
                        name="password"
                        placeholder="Password"
                        type="password"
                        onChange={(e) => this.handleChange(e)}
                    />
                    <span className="focus-border"></span>
                </div>
                <p className="toggle-comps">
                    Forgot Password?{" "}
                    <Link to="/reset" id="to-reset">
                        Reset
                    </Link>{" "}
                    Password
                </p>
                {this.state.error && (
                    <div className="error-message">
                        Oops, something went wrong! <br /> Please try again
                    </div>
                )}
                <button onClick={() => this.submit()}>Login</button>
            </div>
        );
    }
}
