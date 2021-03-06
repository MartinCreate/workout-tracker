import React, { useEffect, useState, useRef } from "react";
import { Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import axios from "./axios";
import {
    delParent,
    collapse,
    collapseFlex,
    createTagsDiv,
    addExercise,
    renderChosenExer,
    getExNames,
    removeErrMsgs,
    removeMsgs,
    //uncomment these when editing the hardcoded html
    submitExercise,
    delEl,
    delUnit,
    addWoTag,
    addSet,
    duplicateSet,
    addUnit,
    returnUnitDiv,
} from "./functions";

export default function CreateWorkout() {
    const dispatch = useDispatch();
    const [mounted, setMounted] = useState();
    const [exList, setExList] = useState([]);
    const [exData, setExData] = useState();

    // const elemRef = useRef(); //for autoscroll

    useEffect(() => {
        setMounted(true);
        console.log("Create-Workout Component Loaded");
    }, []);

    ///------ NEW below
    const closeDropDowns = () => {
        const drops = document.getElementsByClassName("dropdown")[0];

        drops.style.display = "none";
    };

    // const getExNames = async (e, location) => {
    //     const p = e.target.parentElement;
    //     const { data } = await axios.get("/get-ex-names");

    //     const exerList = p.getElementsByClassName("exer-choices")[0];

    //     while (exerList.firstChild) {
    //         exerList.removeChild(exerList.lastChild);
    //     }

    //     let docFrag = document.createDocumentFragment();
    //     for (const exer of data) {
    //         const exLi = document.createElement("p");
    //         exLi.classList.add("exer-choice");
    //         exLi.addEventListener("click", (e) =>
    //             renderChosenExer(e, location)
    //         );
    //         exLi.innerHTML = exer.exercise_name;
    //         docFrag.appendChild(exLi);
    //     }

    //     exerList.appendChild(docFrag);
    // };

    const chooseEx = async () => {
        const { data } = await axios.get("/choose-exercise");

        setExList(data);
    };

    const selectEx = async (e, exId, woName) => {
        setExList([]);

        const { data } = await axios.get(`/get-ex-data/${exId}`);
        setExData(data);
        // setExNm(exName);
    };

    ///------ NEW above

    //// ---------------------------- Functions used in dynamicalle generatedHTML ---------------------------------------- //
    const saveWorkout = async (e) => {
        let woData = {};
        const saveButton = e.target;
        const parent = e.target.parentElement;
        const gP = parent.parentNode;
        console.log("parent in saveWorkout: ", parent);
        console.log("gP in saveWorkout: ", gP);

        const woName = gP.getElementsByClassName("wo-name")[0].value;

        removeMsgs();

        //--Formval - Error if no workout name
        if (!woName) {
            const noNameMsg = document.createElement("div");
            noNameMsg.classList.add("success-save");
            noNameMsg.classList.add("error-save");
            noNameMsg.innerHTML = "Error: please give your workout a name";

            parent.insertBefore(noNameMsg, saveButton);
            console.log("Error, no woName");
            return;
        }

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
            //--Formval - Error if missing exercise name
            if (!exerNames[i].value) {
                const noNameMsg = document.createElement("div");
                noNameMsg.classList.add("success-save");
                noNameMsg.classList.add("error-save");
                noNameMsg.innerHTML = "Error: please give each exercise a name";

                parent.insertBefore(noNameMsg, saveButton);

                console.log("Error, no exerName when Saving Workout");
                return;
            }
            exersArr.push(exerNames[i].value);
        }
        woData.exers = exersArr;

        console.log("woData in saveWorkout: ", woData);
        try {
            const { data } = await axios.post("/save-workout", woData);
            console.log("data in save Workout: ", data);

            if (data == "success") {
                // render feedback message
                console.log("parent: ", parent);
                const goodMsg = document.createElement("div");
                goodMsg.classList.add("success-save");
                goodMsg.innerHTML = "Workout data has been saved!";
                console.log("saveButton: ", saveButton);
                parent.insertBefore(goodMsg, saveButton);
            } else if (data == "Err: unsaved exers") {
                const noNameMsg = document.createElement("div");
                noNameMsg.classList.add("success-save");
                noNameMsg.classList.add("error-save");
                noNameMsg.innerHTML = "Error: please save each new exercise";

                parent.insertBefore(noNameMsg, saveButton);

                console.log("Error, unsaved exers");
                return;
            }
        } catch (e) {
            console.log("ERROR in POST /save-workout: ", e);
            res.json("error");
        }
    };

    //// ---------------------------------------------- Dynamically Generating the HTML ---------------------------------------- //
    const addWorkout = () => {
        const woContainer = document.getElementById("wo-creator");
        const newWorkout = document.createElement("div");
        newWorkout.classList.add("new-workout");

        ////--------------- Workout Nav --------------------- ////
        const woNav = document.createElement("div");
        woNav.classList.add("workout-nav");

        const woName = document.createElement("input");
        woName.type == "text";
        woName.setAttribute("placeholder", "Workout Name");
        woName.classList.add("wo-name");

        const tagsDiv = createTagsDiv();

        const delWorkout = document.createElement("button");
        delWorkout.innerHTML = "Remove";
        delWorkout.addEventListener("click", (e) => delParent(e));
        delWorkout.classList.add("del-button");
        delWorkout.classList.add("wo-del");

        woNav.appendChild(woName);
        woNav.appendChild(tagsDiv);
        woNav.appendChild(delWorkout);

        newWorkout.appendChild(woNav);

        ////--------------- Exercises --------------------- ////
        const exercises = document.createElement("button");
        exercises.classList.add("toggle-exercises");
        exercises.classList.add("toggle-button");
        exercises.addEventListener("click", (e) => collapse(e));
        exercises.innerHTML = "Exercises";
        newWorkout.appendChild(exercises);

        const exersDiv = document.createElement("div");
        exersDiv.classList.add("exercises-div");
        exersDiv.classList.add("collapse");

        ///------ NEW below
        const exerButtonsDiv = document.createElement("div");
        exerButtonsDiv.classList.add("addExerButtonsDiv");

        const exerAdd = document.createElement("button");
        exerAdd.classList.add("exer-add");
        exerAdd.addEventListener("click", (e) => addExercise(e, "submit-wo"));
        exerAdd.innerHTML = "New Exercise";

        const exerChoose = document.createElement("button");
        exerChoose.classList.add("exer-choose");
        exerChoose.classList.add("toggle-button");
        exerChoose.addEventListener("click", (e) => collapseFlex(e));
        exerChoose.innerHTML = "My Exercises";

        const exerChoicesDiv = document.createElement("div");
        exerChoicesDiv.classList.add("exerchoices-div");

        const exerChoose2 = document.createElement("button");
        exerChoose2.classList.add("my-exers-button");
        exerChoose2.addEventListener("click", (e) =>
            getExNames(e, "submit-wo", "Save Exercise")
        );
        exerChoose2.innerHTML = "Load Exercises";

        const exerChoices = document.createElement("div");
        exerChoices.classList.add("exer-choices");
        // exerChoices.classList.add("dropdown");

        exerChoicesDiv.appendChild(exerChoose2);
        exerChoicesDiv.appendChild(exerChoices);

        exerButtonsDiv.appendChild(exerAdd);
        exerButtonsDiv.appendChild(exerChoose);
        exerButtonsDiv.appendChild(exerChoicesDiv);
        //xxx

        ///------ NEW above

        const submitWo = document.createElement("button");
        submitWo.classList.add("submit-wo");
        submitWo.addEventListener("click", (e) => saveWorkout(e));
        submitWo.innerHTML = "Save Workout";

        exersDiv.appendChild(exerButtonsDiv);
        exersDiv.appendChild(submitWo);

        newWorkout.appendChild(exersDiv);

        woContainer.appendChild(newWorkout);
    };

    // --- Render HTML
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
                    {/* <div className="new-workout">
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
                                    Tags
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
                                Delete
                            </button>
                        </div>
                        <button
                            onClick={(e) => collapse(e)}
                            className="toggle-exercises toggle-button"
                        >
                            Exercises
                        </button>
                        <div className="exercises-div collapse">
                            <div className="addExerButtonsDiv">
                                <button
                                    className="exer-add"
                                    onClick={(e) => addExercise(e, "submit-wo")}
                                >
                                    New Exercise
                                </button>
                                <button
                                    className="exer-choose toggle-button"
                                    onClick={(e) => collapseFlex(e)}
                                >
                                    My Exercises
                                </button>
                                <div className="exerchoices-div">
                                    <button
                                        className="my-exers-button"
                                        onClick={(e) =>
                                            getExNames(
                                                e,
                                                "submit-wo",
                                                "Save Exercise"
                                            )
                                        }
                                    >
                                        Load Exercises
                                    </button>
                                    <div className="exer-choices"></div>
                                </div>
                            </div>
                            <div className="exer-div">
                                <div className="exer-nav">
                                    <input
                                        className="exer-name-input"
                                        placeholder="Exercise Name"
                                    />
                                    <div className="tags-div">
                                        <button
                                            className="toggle-tags toggle-button"
                                            onClick={(e) => collapse(e)}
                                        >
                                            Tags
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
                                        className="exer-del"
                                        onClick={(e) => delParent(e)}
                                    >
                                        Delete
                                    </button>
                                </div>
                                <button
                                    className="sets-toggle toggle-button"
                                    onClick={(e) => collapse(e)}
                                >
                                    Sets
                                </button>
                                <div className="sets-div collapse">
                                    <button
                                        className="set-add"
                                        onClick={(e) => addSet(e)}
                                    >
                                        + Set
                                    </button>
                                    <div className="set-div">
                                        <input
                                            className="reps-inp"
                                            placeholder="reps"
                                        />
                                        <p className="reps-label">r</p>
                                        <div className="units-div">
                                            <div className="unit-div">
                                                <input
                                                    className="unit-val-inp"
                                                    placeholder="value"
                                                />
                                                <input
                                                    className="unit-measure-inp"
                                                    type="text"
                                                    list="units"
                                                    placeholder="units"
                                                />
                                                <datalist
                                                    id="units"
                                                    name="units"
                                                >
                                                    <option value="kg"></option>
                                                    <option value="lb">
                                                        Pounds
                                                    </option>
                                                    <option value="sec">
                                                        Seconds
                                                    </option>
                                                    <option value="sec/rep">
                                                        Seconds / Rep
                                                    </option>
                                                    <option value="mins">
                                                        Minutes
                                                    </option>
                                                </datalist>
                                                <button
                                                    className="unit-del"
                                                    onClick={(e) => delUnit(e)}
                                                >
                                                    - Unit
                                                </button>
                                            </div>
                                        </div>
                                        <button
                                            className="set-unit-add"
                                            onClick={(e) => addUnit(e)}
                                        >
                                            + Unit
                                        </button>
                                        <button
                                            className="set-copy"
                                            onClick={(e) => duplicateSet(e)}
                                        >
                                            x2
                                        </button>
                                        <button
                                            className="set-del"
                                            onClick={(e) => delEl(e)}
                                        >
                                            - Set
                                        </button>
                                    </div>
                                    <button
                                        className="submit-exer"
                                        onClick={(e) => submitExercise(e)}
                                    >
                                        Save Exercise
                                    </button>
                                </div>
                            </div>
                            <button
                                className="submit-wo"
                                onClick={(e) => saveWorkout(e)}
                            >
                                Save Workout
                            </button>
                        </div>
                    </div> */}
                </div>
            </div>
        </div>
    );
}
