import React, { useEffect, useState, useRef } from "react";
import { Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import axios from "./axios";
import {
    delParent,
    collapse,
    createTagsDiv,
    addExercise,
    submitExercise,
    delEl,
    delUnit,
    addWoTag,
    addSet,
    duplicateSet,
    addUnit,
} from "./functions";

export default function CreateWorkout() {
    const dispatch = useDispatch();
    const [mounted, setMounted] = useState();
    const [exList, setExList] = useState([]);
    const [exData, setExData] = useState();

    useEffect(() => {
        setMounted(true);
        console.log("Create-Workout Component Loaded");
    }, []);

    const closeDropDowns = () => {
        const drops = document.getElementsByClassName("dropdown")[0];

        drops.style.display = "none";
    };

    const getExNames = async (e) => {
        const p = e.target.parentElement;
        const { data } = await axios.get("/get-ex-names");
        console.log("data: ", data);

        const exerList = p.getElementsByClassName("exer-choises")[0];

        while (exerList.firstChild) {
            exerList.removeChild(exerList.lastChild);
        }

        let docFrag = document.createDocumentFragment();

        for (const exer of data) {
            const exLi = document.createElement("p");
            exLi.classList.add("exer-choise");
            exLi.innerHTML = exer.exercise_name;
            docFrag.appendChild(exLi);
        }

        exerList.appendChild(docFrag);
    };

    const chooseEx = async () => {
        const { data } = await axios.get("/choose-exercise");

        setExList(data);
    };

    const selectEx = async (e, exId, woName) => {
        setExList([]);

        const { data } = await axios.get(`/get-ex-data/${exId}`);
        setExData(data);
    };

    const saveWorkout = async (e) => {
        let woData = {};
        const saveButton = e.target;
        const parent = e.target.parentElement;
        const gP = parent.parentNode;
        console.log("parent in saveWorkout: ", parent);
        console.log("gP in saveWorkout: ", gP);

        const woName = gP.getElementsByClassName("wo-name")[0].value;
        woData.woName = woName;

        const woNav = gP.getElementsByClassName("workout-nav")[0];
        const woTagsVals = woNav.getElementsByClassName("tag-input");

        if (woTagsVals.length != 0) {
            let woTags = [];
            for (let i = 0; i < woTagsVals.length; i++) {
                if (woTagsVals[i].value) {
                    woTags.push(woTagsVals[i].value);
                }
            }
            woData.woTags = woTags;
        }

        const exerNames = parent.getElementsByClassName("exer-name-input");
        let exersArr = [];
        for (let i = 0; i < exerNames.length; i++) {
            exersArr.push(exerNames[i].value);
        }
        woData.exers = exersArr;

        console.log("woData in saveWorkout: ", woData);
        try {
            const { data } = await axios.post("/save-workout", woData);
            console.log("data in save Workout: ", data);

            if (data == "success") {
                console.log("parent: ", parent);
                const goodMsg = document.createElement("div");
                goodMsg.classList.add("success-save");
                goodMsg.innerHTML = "Workout data has been saved!";
                console.log("saveButton: ", saveButton);
                parent.inserBefore(goodMsg, saveButton);
            }
        } catch (e) {
            console.log("ERROR in POST /save-workout: ", e);
            res.json("error");
        }
    };

    const addWorkout = () => {
        const woContainer = document.getElementById("wo-creator");
        const newWorkout = document.createElement("div");
        newWorkout.classList.add("new-workout");

        const woNav = document.createElement("div");
        woNav.classList.add("workout-nav");

        const woName = document.createElement("input");
        woName.type == "text";
        woName.setAttribute("placeholder", "Workout Name");
        woName.classList.add("wo-name");

        const tagsDiv = createTagsDiv();

        const delWorkout = document.createElement("button");
        delWorkout.innerHTML = "Delete Workout";
        delWorkout.addEventListener("click", (e) => delParent(e));
        delWorkout.classList.add("del-button");
        delWorkout.classList.add("wo-del");

        woNav.appendChild(woName);
        woNav.appendChild(tagsDiv);
        woNav.appendChild(delWorkout);

        newWorkout.appendChild(woNav);

        const exercises = document.createElement("button");
        exercises.classList.add("toggle-exercises");
        exercises.classList.add("toggle-button");
        exercises.addEventListener("click", (e) => collapse(e));
        exercises.innerHTML = "Exercises";
        newWorkout.appendChild(exercises);

        const exersDiv = document.createElement("div");
        exersDiv.classList.add("exercises-div");
        exersDiv.classList.add("collapse");
    };

    return (
        <div className="component-container">
            <div className="component" id="wo-creator-component">
                <h1>Create Workout</h1>
                <Link to="/" className="back-home-link">
                    <p>Home</p>
                </Link>
                <button
                    id="create-workout"
                    className="big-button"
                    onClick={() => addWorkout()}
                >
                    + Workout
                </button>

                <div id="wo-creator">
                    <div className="new-workout">
                        <div className="workout-nav">
                            <input
                                type="text"
                                placeholder="Workout Name"
                                className="wo-name"
                            />
                            <div className="tags-div">
                                <button
                                    className="toggle-tags toggle-button"
                                    onClick={(e) => collapse(e)}
                                >
                                    tags
                                </button>
                                <div className="tags collapse">
                                    <button
                                        className="tag-add"
                                        onClick={(e) => addWoTag(e)}
                                    >
                                        + Tag
                                    </button>
                                    <div className="tag">
                                        <input
                                            className="tag-input"
                                            type="text"
                                            placeholder="Tag Name"
                                        />
                                        <button
                                            className="del-button tag-del"
                                            onClick={(e) => delEl(e)}
                                        >
                                            - Tag
                                        </button>
                                    </div>
                                </div>
                            </div>
                            <button
                                className="del-button wo-del"
                                onClick={(e) => delParent(e)}
                            >
                                Delete Workout
                            </button>
                        </div>
                        <button
                            onClick={(e) => collapse(e)}
                            className="toggle-exercises toggle-button"
                        >
                            Exercises
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
