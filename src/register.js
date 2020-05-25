import React from "react";
import axios from "./axios";
import { Link } from "react-router-dom";

export default class Registration extends React.Component {
    constructor() {
        super();
        this.state = {
            error: false,
        };
    }

    handleChange(e) {
        this.setState(
            {
                [e.target.name]: e.target.value,
            }
            //, () => console.log("(this.state): ", this.state)
        );
    }

    submit() {
        console.log("this.state in submit(): ", this.state);
        axios.post("/register", this.state).then(({ data }) => {
            console.log("data: ", data);
            if (data.success) {
                console.log("Registration Success!");
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
            <div className="register-form form">
                <h3>Sign Up</h3>
                <p className="toggle-comps">
                    or <Link to="/login">Login</Link>
                </p>

                <div className="input-field-div">
                    <input
                        name="first"
                        placeholder="First Name"
                        onChange={(e) => this.handleChange(e)}
                    />
                    <span className="focus-border"></span>
                </div>

                <div className="input-field-div">
                    <input
                        name="last"
                        placeholder="Last Name"
                        onChange={(e) => this.handleChange(e)}
                    />
                    <span className="focus-border"></span>
                </div>

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

                {this.state.error && (
                    <div className="error-message">
                        Oops, something went wrong! <br /> Please fill out every
                        field
                    </div>
                )}
                <button onClick={() => this.submit()}>Register</button>
            </div>
        );
    }
}
