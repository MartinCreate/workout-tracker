import React, { useEffect, useState, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { getPrivChatList, privChatMsg, clearChatMessages } from "./actions";

import axios from "./axios";

export default function CreateWorkout() {
    const dispatch = useDispatch();
    const [mounted, setMounted] = useState();
    const elemRef = useRef(); //for autoscroll
    const myId = useSelector((state) => state.myId && state.myId);
    // const newLogin = useSelector((state) => state.newLogin && state.newLogin);

    useEffect(() => {
        // dispatch(getPrivChatList());
        setMounted(true);
        console.log("Create-Workout Component Loaded");
    }, []);

    // const findInd = (arr, prop, val) => {
    //     for (var i = 0; i < arr.length; i++) {
    //         if (arr[i][prop] === val) {
    //             return i;
    //         }
    //     }
    // };

    const addWorkout = () => {
        const woContainer = document.getElementById("wo-creator");

        const newWorkout = document.createElement("div");
        const newWoName = document.createElement("input");
        const addTagButton = addButton("+ Tag", "wo-tag-add", "wo-tag");
        const tagsNav = document.createElement("div"); // NEW
        const delWorkout = delButton("Remove Workout", "del-wo-button");

        // newWorkout.innerHTML = "New Workout";
        newWorkout.classList.add("new-workout");
        newWoName.type == "text";
        newWoName.setAttribute("placeholder", "Workout Name");

        // console.log("addTagButton: ", addTagButton);
        // console.log("woContainer: ", woContainer);
        // console.log("newWorkout: ", newWorkout);
        // console.log("newWoName: ", newWoName);

        newWorkout.appendChild(newWoName);
        tagsNav.appendChild(addTagButton);
        newWorkout.appendChild(tagsNav);
        newWorkout.appendChild(delWorkout);
        woContainer.appendChild(newWorkout);

        // //SideNote:
        // //-------We can update the text we've created here on the page automatically like this
        // //Setup
        // let newText = "First text";
        // newWorkout.innterHTML = newText;

        // //the line below will change the existing "First text" as soon as the line below is run.
        // newText.nodeValue = "Revised Text";
        //------ assigning id
        //newWorkout.id = "example";
    };

    const delButton = (buttonLabel, className, type, name, id) => {
        const delButton = document.createElement("button");
        delButton.innerHTML = buttonLabel;
        if (type == "whole-workout") {
            delButton.addEventListener("click", (e) => deleteParent(e));
        } else {
            delButton.addEventListener("click", (e) => deleteElement(e));
        }
        delButton.classList.add("del-button");
        delButton.classList.add(className);
        delButton.setAttribute("name", name);
        // delButton.id = id;

        return delButton;
    };

    const deleteElement = (e) => {
        console.log("e.target: ", e.target);
        const deleteEl = e.target.parentElement;
        console.log("deleteEl: ", deleteEl);
        deleteEl.parentNode.removeChild(deleteEl);
    };
    const deleteParent = (e) => {
        const deleteEl = e.target.parentElement;
        const workout = deleteEl.parentNode;
        workout.parentNode.removeChild(workout);
    };

    const addButton = (buttonLabel, className, type, name, id) => {
        const add = document.createElement("button");
        add.innerHTML = buttonLabel;
        add.classList.add("add-button");
        add.classList.add(className);

        if (type == "wo-tag") {
            add.innerHTML = "+ Tag";
            add.addEventListener("click", (e) => addWoTag(e));
        } else if (type == "exer-tag") {
            add.innerHTML = "+ Tag";
            add.addEventListener("click", (e) => addExerTag(e));
        } else if (type == "exercise") {
            add.addEventListener("click", (e) => addExer(e));
        } else if (type == "set") {
            add.addEventListener("click", (e) => addSet(e));
        } else if (type == "set-info") {
            add.addEventListener("click", (e) => addSetInfo(e));
        }

        return add;
    };

    const addWoTag = (e) => {
        console.log("addWoTag is running");

        const parent = e.target.parentElement;
        const newTagDiv = document.createElement("div");
        const tagInp = document.createElement("input");
        const delTag = delButton("- Tag", "wo-tag-del");

        newTagDiv.classList.add("wo-tag");
        tagInp.classList.add("wo-tag-input");
        tagInp.type = "text";
        tagInp.setAttribute("placeholder", "Tag Name");

        newTagDiv.appendChild(tagInp);
        newTagDiv.appendChild(delTag);
        parent.appendChild(newTagDiv);
        // parent.appendChild(tagInp);
        // parent.appendChild(delTag);

        // collapse(e);
    };

    const collapse = (e) => {
        const coll = e.currentTarget;

        coll.classList.toggle("active");
        const content = coll.nextElementSibling;
        console.log("content: ", content);

        //collapse without animation
        if (content.style.display === "grid") {
            content.style.display = "none";
        } else {
            content.style.display = "grid";
        }

        //collapse with animation
        // if (content.style.maxHeight) {
        //     content.style.maxHeight = null;
        // } else {
        //     content.style.maxHeight = content.scrollHeight + "px";
        // }
    };

    return (
        <div className="component-container">
            <div className="component" id="wo-creator-component">
                <h1>Create Workout</h1>

                <div id="create-workout" onClick={() => addWorkout()}>
                    + Add Workout
                </div>
                <div id="wo-creator">
                    <div className="new-workout">
                        {/* NEW BELOW workout-nav div*/}
                        <div className="workout-nav">
                            <input
                                type="text"
                                placeholder="Workout Name"
                                className="wo-name"
                            />
                            {/* <button
                            className="add-button"
                            onClick={(e) => addWoTag(e)}
                        >
                            + Tag
                        </button> */}
                            {/* NEW BELOW */}
                            <div className="wo-tags-div">
                                <button
                                    className="toggle-tags"
                                    onClick={(e) => collapse(e)}
                                >
                                    Tags
                                </button>
                                <div className="wo-tags collapse">
                                    <button
                                        className="wo-tag-add"
                                        onClick={(e) => addWoTag(e)}
                                    >
                                        + Tag
                                    </button>
                                    <div className="wo-tag">
                                        <input
                                            className="wo-tag-input"
                                            type="text"
                                            placeholder="Tag Name"
                                        />
                                        {/* First tag input field shouldn't have a 'remove' button, otherwise the collapse freaks out*/}
                                        <button
                                            className="del-button wo-tag-del"
                                            onClick={(e) => deleteElement(e)}
                                        >
                                            - Tag
                                        </button>
                                    </div>
                                </div>
                            </div>
                            {/* NEW ABOVE */}
                            <button
                                className="del-button wo-remove"
                                onClick={(e) => deleteParent(e)}
                            >
                                Remove Workout
                            </button>
                            {/* <div>
                            <input type="text" placeholder="Tag Name" />
                            <button
                                className="del-button"
                                onClick={(e) => deleteElement(e)}
                            >
                                - Tag
                            </button>
                        </div> */}
                        </div>
                        <button
                            onClick={(e) => collapse(e)}
                            className="toggle-exers"
                        >
                            Exercises
                        </button>
                        {/* NEW BELOW exercises div*/}
                        <div className="exercises-div collapse">
                            <button className="exer-add">Add Exercise</button>
                            <div className="exer-div">
                                <input
                                    className="exer-name-input"
                                    placeholder="exercise-name"
                                />
                                <button>Remove Exercise</button>
                                <button
                                    className="toggle-exer"
                                    onClick={(e) => collapse(e)}
                                >
                                    Collapse Exercise
                                </button>
                                <div className="sets-div collapse">
                                    <button className="set-add">+ Set</button>
                                    <div className="set-div">
                                        <input
                                            className="rep-inp"
                                            placeholder="reps"
                                        />
                                        <button className="set-del">
                                            - Set
                                        </button>
                                        <button className="set-unit-add">
                                            + Unit
                                        </button>
                                        <div>
                                            <input
                                                className="unit-val-inp"
                                                placeholder="value"
                                            ></input>
                                            <input
                                                className="unit-measure-input"
                                                placeholder="units e.g. KG"
                                            ></input>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
