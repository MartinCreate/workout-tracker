import React from "react";

//props from app.js

export default function Profile({ id, first, last }) {
    return (
        <div id="profile-component">
            <div id="bio-div">
                <h1>
                    {first} {last}
                </h1>
                <h3>Profile</h3>
            </div>
        </div>
    );
}
