import React, { useEffect, useState, useRef } from "react";
import { Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
// import { getPrivChatList, privChatMsg, clearChatMessages } from "./actions";

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

    //// ---------------------------- Functions used in dynamicalle generatedHTML ---------------------------------------- //

    const delButton = (buttonLabel, className, kind) => {
        const delButton = document.createElement("button");
        delButton.innerHTML = buttonLabel;
        if (kind == "workout") {
            delButton.addEventListener("click", (e) => deleteParent(e));
        } else {
            delButton.addEventListener("click", (e) => deleteElement(e));
        }
        delButton.classList.add("del-button");
        delButton.classList.add(className);

        return delButton;
    };

    const deleteUnit = (e) => {
        console.log("e.target: ", e.target);
        const parent = e.target.parentElement;
        const gParent = parent.parentNode;
        const ggParent = gParent.parentNode;

        const deleteEl = e.target.parentElement;
        deleteEl.parentNode.removeChild(deleteEl);

        if (ggParent.getElementsByClassName("unit-div").length < 2) {
            const addUnit = ggParent.getElementsByClassName("set-unit-add")[0];
            console.log("addUnit: ", addUnit);
            addUnit.style.display = "inline-block";
        }
        console.log("ggParent: ", ggParent);
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

    const collapse = (e) => {
        const coll = e.currentTarget;
        coll.classList.toggle("active");
        const content = coll.nextElementSibling;

        ////xxxxxx remove success-save div
        const gP = coll.parentNode.parentNode;
        const successMsgs = gP.getElementsByClassName("success-save");
        if (successMsgs) {
            for (let i = 0; i < successMsgs.length; i++) {
                successMsgs[i].remove();
            }
        }

        if (content.style.display === "grid") {
            content.style.display = "none";
        } else {
            content.style.display = "grid";
        }
    };

    const submitExercise = async (e) => {
        console.log("--- In submitExercise(e) ---");
        const saveButton = e.target;
        const parent = e.target.parentElement;
        const gP = parent.parentNode;
        const gggP = gP.parentNode.parentNode;
        // console.log("e.target: ", e.target);
        // console.log("parent: ", parent);
        // console.log("gParent: ", gP);
        // console.log("gggP: ", gggP);

        let exerData = {};
        // example of how exerData is structured
        // exerData = {
        //     woName: "Chest Day"
        //     exName: "Pushups",
        //     exTags: ["bodyweight", "chest"],
        //     sets: [
        //         [ 10, [ [12, "kg"], [10, "sec"] ] ],
        //         [ 10 ],
        //         [ 10, [ [18, "kg"] ] ],
        //     ],
        // };
        //Where sets[i][0] is the number of reps

        //----- Workout & Exercise Name
        const workoutName = gggP.getElementsByClassName("wo-name")[0].value;
        const exerName = gP.getElementsByClassName("exer-name-input")[0].value;
        //error message if !workoutName
        //error message if !exerName
        exerData.woName = workoutName;
        exerData.exName = exerName;

        //----- Tag data
        const tags = gP.getElementsByClassName("tag-input");
        if (tags.length != 0) {
            //1) delete tag-divs w/ empty inputs
            for (let i = tags.length - 1; i > -1; i--) {
                if (!tags[i].value) {
                    const tagPar = tags[i].parentNode;
                    tagPar.parentNode.removeChild(tagPar);
                }
            }

            //2) get data from tags
            if (tags.length != 0) {
                let tagsArr = [];
                for (let i = 0; i < tags.length; i++) {
                    tagsArr.push(tags[i].value);
                }
                exerData.exTags = tagsArr;
            }
        }

        //----- Sets data
        const setDivs = gP.getElementsByClassName("set-div");

        if (setDivs.length != 0) {
            let setsData = [];

            for (let s = 0; s < setDivs.length; s++) {
                let setData = [];
                const reps = setDivs[s].getElementsByClassName("reps-inp")[0]
                    .value;
                //error message if reps is not a number

                setData.push(reps);

                const val = setDivs[s].getElementsByClassName("unit-val-inp");
                const m = setDivs[s].getElementsByClassName("unit-measure-inp");
                //error message if val is not a number
                //error message if val.length != m.length

                if (val.length != 0) {
                    let units = [];

                    for (let i = 0; i < val.length; i++) {
                        let unit = [];
                        const unitVal = val[i].value;
                        const unitMeas = m[i].value;

                        unit.push(unitVal);
                        unit.push(unitMeas);

                        units.push(unit);
                    }
                    setData.push(units);
                }
                setsData.push(setData);
            }
            exerData.sets = setsData;
        }

        //do axios post here
        console.log("exerData: ", exerData);
        try {
            const { data } = await axios.post("/submit-exercise", exerData);
            console.log("data: ", data);

            if (data == "success") {
                ///xxxxx anchor
                // render feedback message
                console.log("parent: ", parent);
                const goodMsg = document.createElement("div");
                goodMsg.classList.add("success-save");
                goodMsg.innerHTML = "Exercise data has been saved!";
                console.log("saveButton: ", saveButton);
                parent.insertBefore(goodMsg, saveButton);
            }
        } catch (e) {
            console.log("ERROR in POST /submit-exercise: ", e);
        }
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
                ///xxxxx anchor
                // render feedback message
                console.log("parent: ", parent);
                const goodMsg = document.createElement("div");
                goodMsg.classList.add("success-save");
                goodMsg.innerHTML = "Workout data has been saved!";
                console.log("saveButton: ", saveButton);
                parent.insertBefore(goodMsg, saveButton);
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

        const delWorkout = delButton("Delete Workout", "wo-del", "workout");

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

        const exerAdd = document.createElement("button");
        exerAdd.classList.add("exer-add");
        exerAdd.addEventListener("click", (e) => addExercise(e));
        exerAdd.innerHTML = "+ Exercise";

        const submitWo = document.createElement("button");
        submitWo.classList.add("submit-wo");
        submitWo.addEventListener("click", (e) => saveWorkout(e));
        submitWo.innerHTML = "Save Workout";

        exersDiv.appendChild(exerAdd);
        exersDiv.appendChild(submitWo);

        newWorkout.appendChild(exersDiv);

        // //SideNote:
        // //-------We can update the text we've created here on the page automatically like this
        // //Setup
        // let newText = "First text";
        // newWorkout.innterHTML = newText;

        // //the line below will change the existing "First text" as soon as the line below is run.
        // newText.nodeValue = "Revised Text";
        //------ assigning id
        //newWorkout.id = "example";

        woContainer.appendChild(newWorkout);
    };

    const createTagsDiv = () => {
        const tagsDiv = document.createElement("div");
        tagsDiv.classList.add("tags-div");

        const toggleTag = document.createElement("button");
        toggleTag.classList.add("toggle-tags");
        toggleTag.classList.add("toggle-button");
        toggleTag.addEventListener("click", (e) => collapse(e));
        toggleTag.innerHTML = "Tags";

        const addTagButton = document.createElement("button");
        addTagButton.classList.add("tag-add");
        addTagButton.innerHTML = "+ Tag";
        addTagButton.addEventListener("click", (e) => addWoTag(e));

        const tags = document.createElement("div");
        tags.classList.add("tags");
        tags.classList.add("collapse");

        tags.appendChild(addTagButton);
        tagsDiv.appendChild(toggleTag);
        tagsDiv.appendChild(tags);

        return tagsDiv;
    };

    const addWoTag = (e) => {
        console.log("addWoTag is running");

        const parent = e.target.parentElement;
        const newTagDiv = document.createElement("div");
        const tagInp = document.createElement("input");
        const delTag = delButton("- Tag", "tag-del");

        newTagDiv.classList.add("tag");
        tagInp.classList.add("tag-input");
        tagInp.type = "text";
        tagInp.setAttribute("placeholder", "Tag Name");

        newTagDiv.appendChild(tagInp);
        newTagDiv.appendChild(delTag);
        parent.appendChild(newTagDiv);
    };

    const addExercise = (e) => {
        const parent = e.target.parentElement;
        console.log("parent addExercise(e): ", parent);

        const exerDiv = document.createElement("div");
        exerDiv.classList.add("exer-div");

        const exerNav = document.createElement("div");
        exerNav.classList.add("exer-nav");

        const exerInp = document.createElement("input");
        exerInp.classList.add("exer-name-input");
        exerInp.setAttribute("placeholder", "Exercise Name");

        const tagsDiv = createTagsDiv();

        const delExer = document.createElement("button");
        delExer.classList.add("exer-del");
        delExer.addEventListener("click", (e) => deleteParent(e));
        delExer.innerHTML = "Delete Exercise";

        const toggleSets = document.createElement("button");
        toggleSets.classList.add("sets-toggle");
        toggleSets.classList.add("toggle-button");
        toggleSets.addEventListener("click", (e) => collapse(e));
        toggleSets.innerHTML = "Sets";

        const setsDiv = document.createElement("div");
        setsDiv.classList.add("sets-div");
        setsDiv.classList.add("collapse");

        const setAdd = document.createElement("button");
        setAdd.classList.add("set-add");
        setAdd.addEventListener("click", (e) => addSet(e));
        setAdd.innerHTML = "+ Set";

        const submitExer = document.createElement("button");
        submitExer.classList.add("submit-exer");
        submitExer.addEventListener("click", (e) => submitExercise(e)); //CHANGE THIS to submitExercise()
        submitExer.innerHTML = " Save Exercise";

        setsDiv.appendChild(setAdd);
        setsDiv.appendChild(submitExer);

        exerNav.appendChild(exerInp);
        exerNav.appendChild(tagsDiv);
        exerNav.appendChild(delExer);

        exerDiv.appendChild(exerNav);
        exerDiv.appendChild(toggleSets);
        exerDiv.appendChild(setsDiv);

        parent.appendChild(exerDiv);
        const submitWo = parent.getElementsByClassName("submit-wo")[0];
        parent.insertBefore(exerDiv, submitWo);
    };

    const addSet = (e) => {
        const parent = e.target.parentElement;
        console.log("parent addSet(e): ", parent);
        const setDiv = document.createElement("div");
        setDiv.classList.add("set-div");

        const repsInp = document.createElement("input");
        repsInp.classList.add("reps-inp");
        repsInp.setAttribute("placeholder", "reps");

        const pr = document.createElement("p");
        pr.classList.add("reps-label");
        pr.innerHTML = "r";

        const unitsDiv = document.createElement("div");
        unitsDiv.classList.add("units-div");

        const addUnits = document.createElement("button");
        addUnits.classList.add("set-unit-add");
        addUnits.innerHTML = "+ Unit";
        addUnits.addEventListener("click", (e) => addUnit(e));

        const copySet = document.createElement("button");
        copySet.classList.add("set-copy");
        copySet.innerHTML = "x2";
        copySet.addEventListener("click", (e) => duplicateSet(e));

        const delSet = document.createElement("button");
        delSet.classList.add("set-del");
        delSet.addEventListener("click", (e) => deleteElement(e));
        delSet.innerHTML = "- Set";

        setDiv.appendChild(repsInp);
        setDiv.appendChild(pr);
        setDiv.appendChild(unitsDiv);

        setDiv.appendChild(addUnits);
        setDiv.appendChild(copySet);
        setDiv.appendChild(delSet);

        const submitExer = parent.getElementsByClassName("submit-exer")[0];
        parent.insertBefore(setDiv, submitExer);
    };

    const duplicateSet = (e) => {
        const parent = e.target.parentElement;
        const grandparent = parent.parentNode;

        const clone = parent.cloneNode(true);
        console.log("clone: ", clone);

        const addUnitClone = clone.getElementsByClassName("set-unit-add")[0];
        const copySetClone = clone.getElementsByClassName("set-copy")[0];
        const delSetClone = clone.getElementsByClassName("set-del")[0];
        const delUnitClone = clone.getElementsByClassName("unit-del");

        addUnitClone.addEventListener("click", (e) => addUnit(e));
        copySetClone.addEventListener("click", (e) => duplicateSet(e));
        delSetClone.addEventListener("click", (e) => deleteElement(e));
        if (delUnitClone) {
            for (let i = 0; i < delUnitClone.length; i++) {
                delUnitClone[i].addEventListener("click", (e) => deleteUnit(e));
            }
        }

        grandparent.insertBefore(clone, parent.nextSibling);
    };

    const addUnit = (e) => {
        const prevSib = e.target.previousSibling;
        const parent = e.target.parentElement;
        console.log("parent addUnit(): ", parent);
        const unitDiv = document.createElement("div");

        const valInp = document.createElement("input");
        valInp.classList.add("unit-val-inp");
        valInp.setAttribute("placeholder", "value");
        valInp.type = "text";

        const measureInp = document.createElement("input");
        measureInp.classList.add("unit-measure-inp");
        measureInp.setAttribute("placeholder", "units");
        measureInp.setAttribute("list", "units"); //has to correspond to id of datalist
        measureInp.type = "text";

        const unitsList = document.createElement("datalist");
        unitsList.id = "units"; //customize this
        unitsList.setAttribute("name", "units"); //customize this

        const option1 = document.createElement("option");
        const option2 = document.createElement("option");
        const option3 = document.createElement("option");
        const option4 = document.createElement("option");
        const option5 = document.createElement("option");
        option1.setAttribute("value", "kg");
        option2.setAttribute("value", "lb");
        option3.setAttribute("value", "sec");
        option4.setAttribute("value", "sec/rep");
        option5.setAttribute("value", "mins");
        option1.innerHTML = "";
        option2.innerHTML = "Pounds";
        option3.innerHTML = "Seconds";
        option4.innerHTML = "Seconds / Rep";
        option5.innerHTML = "Minutes";
        unitsList.appendChild(option1);
        unitsList.appendChild(option2);
        unitsList.appendChild(option3);
        unitsList.appendChild(option4);
        unitsList.appendChild(option5);

        const unitDel = document.createElement("button");
        unitDel.classList.add("unit-del");
        unitDel.addEventListener("click", (e) => deleteUnit(e));
        unitDel.innerHTML = "- Unit";

        unitDiv.appendChild(valInp);
        unitDiv.appendChild(measureInp);
        unitDiv.appendChild(unitsList);
        unitDiv.appendChild(unitDel);

        unitDiv.classList.add("unit-div");

        prevSib.appendChild(unitDiv);

        if (parent.getElementsByClassName("unit-div").length == 2) {
            const addUnit = parent.getElementsByClassName("set-unit-add")[0];
            // addUnit.style.visibility = "hidden";
            addUnit.style.display = "none";
        }
    };

    return (
        <div className="component-container">
            <div className="component" id="wo-creator-component">
                <Link to="/" className="back-home-link">
                    <p>Home Menu</p>
                </Link>
                <h1>Create Workout</h1>
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
                                            onClick={(e) => deleteElement(e)}
                                        >
                                            - Tag
                                        </button>
                                    </div>
                                </div>
                            </div>
                            <button
                                className="del-button wo-del"
                                onClick={(e) => deleteParent(e)}
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
                        <div className="exercises-div collapse">
                            <button
                                className="exer-add"
                                onClick={(e) => addExercise(e)}
                            >
                                + Exercise
                            </button>
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
                                                    onClick={(e) =>
                                                        deleteElement(e)
                                                    }
                                                >
                                                    - Tag
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                    <button
                                        className="exer-del"
                                        onClick={(e) => deleteParent(e)}
                                    >
                                        Delete Exercise
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
                                                    id="units" //gonna have to make this value custom
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
                                                    onClick={(e) =>
                                                        deleteUnit(e)
                                                    }
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
                                            onClick={(e) => deleteElement(e)}
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
                    </div>
                </div>
            </div>
        </div>
    );
}
