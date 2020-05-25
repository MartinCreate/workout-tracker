import React from "react";
import axios from "./axios";
import { Link } from "react-router-dom";

export default class ResetPassword extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            error: false,
            step: 1,
        };
    }

    handleChange(e) {
        this.setState({
            [e.target.name]: e.target.value,
        });
    }

    sendEmail() {
        axios.post("/reset-pword/one", this.state).then(({ data }) => {
            if (data.success) {
                this.setState({
                    error: false,
                    step: 2,
                });
            } else {
                this.setState({
                    error: true,
                });
            }
        });
    }

    resetPassword() {
        axios.post("/reset-pword/two", this.state).then(({ data }) => {
            if (data.success) {
                this.setState({
                    error: false,
                    step: 3,
                });
            } else {
                this.setState({
                    error: true,
                });
            }
        });
    }

    render() {
        return (
            <div>
                {this.state.step == 1 && (
                    <div className="reset-form form">
                        <h3>Reset Password</h3>

                        <p className="toggle-comps">
                            Back to <Link to="/login">Login</Link>
                        </p>

                        <div className="input-field-div">
                            <input
                                name="email"
                                placeholder="Email"
                                onChange={(e) => this.handleChange(e)}
                            />
                            <span className="focus-border"></span>
                        </div>

                        {this.state.error && (
                            <div className="error-message">
                                Oops, something went wrong! <br /> Please try
                                again
                            </div>
                        )}
                        <button onClick={() => this.sendEmail()}>
                            Send Reset Code
                        </button>
                    </div>
                )}

                {this.state.step == 2 && (
                    <div className="reset-form form">
                        <h3>Reset Password</h3>
                        <p className="form-desc">
                            In the fields below, enter the code that was sent to
                            your email as well as a new password of your choice.
                        </p>

                        <div className="input-field-div">
                            <input
                                name="code"
                                placeholder="Code"
                                onChange={(e) => this.handleChange(e)}
                            />
                            <span className="focus-border"></span>
                        </div>
                        <div className="input-field-div">
                            <input
                                name="newPassword"
                                placeholder="New Password"
                                type="password"
                                onChange={(e) => this.handleChange(e)}
                            />
                            <span className="focus-border"></span>
                        </div>

                        {this.state.error && (
                            <div className="error-message">
                                Oops, something went wrong! <br /> Please try
                                again
                            </div>
                        )}
                        <button onClick={() => this.resetPassword()}>
                            Reset Password
                        </button>
                    </div>
                )}
                {this.state.step == 3 && (
                    <div className="reset-form form">
                        <h3>Reset Password</h3>
                        <p className="success">Success!</p>
                        <p className="form-desc">
                            Your password has been reset.
                            <br />
                            You can now <Link to="/login">login</Link> with your
                            new password.
                        </p>
                    </div>
                )}
            </div>
        );
    }
}
