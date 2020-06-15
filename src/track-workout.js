import React, { useEffect, useState, useRef } from "react";
import { Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
    delParent,
    collapse,
    createTagsDiv,
    addExercise,
    //uncomment these when editing the hardcoded html
    // submitExercise,
    // delEl,
    // delUnit,
    // addWoTag,
    // addSet,
    // duplicateSet,
    // addUnit,
} from "./functions";

import axios from "./axios";

export default function TrackWorkout() {
    const dispatch = useDispatch();
    const [mounted, setMounted] = useState();
    const [woList, setWoList] = useState([]);
    const [woData, setWoData] = useState();
    const [woNm, setWoNm] = useState();
    // const elemRef = useRef(); //for autoscroll

    useEffect(() => {
        // dispatch(getPrivChatList());
        setMounted(true);
        console.log("Track-Workout Component Loaded");
        document.body.addEventListener("click", setWoList([]));
    }, []);

    // const findInd = (arr, prop, val) => {
    //     for (var i = 0; i < arr.length; i++) {
    //         if (arr[i][prop] === val) {
    //             return i;
    //         }
    //     }
    // };

    const chooseWorkout = async () => {
        const { data } = await axios.get("/choose-workout");

        setWoList(data);
    };

    //remove existing msgs
    const successMsgs = document.getElementsByClassName("success-save");
    if (successMsgs) {
        for (let i = 0; i < successMsgs.length; i++) {
            successMsgs[i].remove();
        }
    }
    const errorMsg = document.getElementsByClassName("error-save");
    if (errorMsg) {
        for (let i = 0; i < errorMsg.length; i++) {
            errorMsg[i].remove();
        }
    }

    const selectWo = async (e, woId, woName) => {
        setWoList([]);

        const { data } = await axios.get(`/get-wo-data/${woId}`);
        setWoData(data);
        setWoNm(woName);
    };

    const clearWoData = () => {
        setWoData(null);
        setWoNm(null);
    };

    const trackCompleteWorkout = async (e) => {
        let trackWoData = {
            woName: woNm,
        };
        const parent = e.target.parentElement;
        const ggP = parent.parentNode.parentNode;
        // console.log("ggP in trackCompleteWorkout: ", ggP);

        //for success/error msgs
        const par = ggP.getElementsByClassName("exercises-div")[0];
        const trackButtonDiv = ggP.getElementsByClassName("submit-save-div")[0];

        const woNav = ggP.getElementsByClassName("workout-nav")[0];
        const woTagsVals = woNav.getElementsByClassName("tag-input");

        if (woTagsVals.length != 0) {
            let woTags = [];
            for (let i = 0; i < woTagsVals.length; i++) {
                if (woTagsVals[i].value) {
                    woTags.push(woTagsVals[i].value);
                }
            }
            trackWoData.woTags = woTags;
        }

        const exerN = ggP.getElementsByClassName("exer-name-input");
        let exersArr = [];
        for (let i = 0; i < exerN.length; i++) {
            exersArr.push(exerN[i].value);
        }

        const exerDivs = ggP.getElementsByClassName("exer-div");

        let exersData = [];

        for (const exerdiv of exerDivs) {
            const exerData = await trackExercise(exerdiv);
            exersData.push(exerData);
        }
        // console.log("exersData: ", exersData);

        trackWoData.exersData = exersData;
        // console.log("trackWoData: ", trackWoData);
        try {
            console.log("workout data being sent to index.js: ", trackWoData);
            const { data } = await axios.post("/track-workout", trackWoData);

            if (data == "success") {
                ///xxxxx anchor

                //remove existing msgs
                const successMsgs = ggP.getElementsByClassName("success-save");
                if (successMsgs) {
                    for (let i = 0; i < successMsgs.length; i++) {
                        successMsgs[i].remove();
                    }
                }
                const errorMsg = ggP.getElementsByClassName("error-save");
                if (errorMsg) {
                    for (let i = 0; i < errorMsg.length; i++) {
                        errorMsg[i].remove();
                    }
                }

                // render feedback message
                const goodMsg = document.createElement("div");
                goodMsg.classList.add("success-save");
                goodMsg.innerHTML = `This ${woNm} session has been tracked!`;

                par.insertBefore(goodMsg, trackButtonDiv);
            }
        } catch (e) {
            console.log("ERROR in trackCompleteWorkout(): ", e);
        }
    };

    const trackExercise = async (exerDiv) => {
        let exerData = {};

        const exerName = exerDiv.getElementsByClassName("exer-name-input")[0]
            .value;

        //error message if !workoutName
        //error message if !exerName
        exerData.exName = exerName;

        //----- Tag data
        const tags = exerDiv.getElementsByClassName("tag-input");
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
        const setDivs = exerDiv.getElementsByClassName("set-div");

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

        return exerData;
    };

    //// ---------------------------- Functions used in dynamicalle generatedHTML ---------------------------------------- //
    const updateWorkout = async (e) => {
        let woData = {};
        const parent = e.target.parentElement;
        const gP = parent.parentNode.parentNode;
        console.log("parent in updateWorkout: ", parent);
        console.log("gP in updateWorkout: ", gP);

        //for success/error msgs
        const par = gP.getElementsByClassName("exercises-div")[0];
        const trackButtonDiv = gP.getElementsByClassName("submit-save-div")[0];

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

        const exerNames = gP.getElementsByClassName("exer-name-input");
        let exersArr = [];
        for (let i = 0; i < exerNames.length; i++) {
            exersArr.push(exerNames[i].value);
        }
        woData.exers = exersArr;

        // console.log("woData: ", woData);
        try {
            const { data } = await axios.post("/save-workout", woData);
            console.log("data in trackCompleteWorkout: ", data);

            if (data == "success") {
                //remove existing msgs
                const successMsgs = gP.getElementsByClassName("success-save");
                if (successMsgs) {
                    for (let i = 0; i < successMsgs.length; i++) {
                        successMsgs[i].remove();
                    }
                }
                const errorMsg = gP.getElementsByClassName("error-save");
                if (errorMsg) {
                    for (let i = 0; i < errorMsg.length; i++) {
                        errorMsg[i].remove();
                    }
                }
                // render feedback message
                const goodMsg = document.createElement("div");
                goodMsg.classList.add("success-save");
                goodMsg.innerHTML = `${woNm} has been updated!`;

                par.insertBefore(goodMsg, trackButtonDiv);
            }
        } catch (e) {
            console.log("ERROR in POST /save-workout: ", e);
        }
    };

    //-- Render HTML
    return (
        <div className="component-container">
            <div className="component" id="wo-creator-component">
                <h1>Track Workout</h1>
                <Link to="/" className="back-home-link">
                    <p>Home</p>
                </Link>
                <div id="choose-wo-list">
                    <button
                        id="choose-workout"
                        className="big-button"
                        onClick={() => chooseWorkout()}
                    >
                        Choose Workout
                    </button>
                    {woList &&
                        woList.map((wo) => (
                            <div
                                className="wo-li-el"
                                key={wo.id}
                                onClick={(e) =>
                                    selectWo(e, wo.id, wo.workout_name)
                                }
                            >
                                {wo.workout_name}
                            </div>
                        ))}
                </div>

                <div id="wo-creator">
                    {woData && (
                        <div className="new-workout">
                            <div className="workout-nav">
                                <input
                                    type="text"
                                    placeholder="Workout Name"
                                    className="wo-name"
                                    defaultValue={woNm}
                                ></input>
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
                                        {woData &&
                                            woData.woTags.map((x) => (
                                                <div className="tag" key={x}>
                                                    <input
                                                        className="tag-input"
                                                        type="text"
                                                        placeholder="Tag Name"
                                                        defaultValue={x}
                                                    />
                                                    <button
                                                        className="del-button tag-del"
                                                        onClick={(e) =>
                                                            delEl(e)
                                                        }
                                                    >
                                                        - Tag
                                                    </button>
                                                </div>
                                            ))}
                                    </div>
                                </div>
                                <button
                                    className="del-button wo-del"
                                    onClick={(e) => clearWoData(e)}
                                >
                                    Remove
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
                                    onClick={(e) =>
                                        addExercise(e, "submit-save-div")
                                    }
                                >
                                    + Exercise
                                </button>
                                {woData &&
                                    woData.exerSetsTags.map((ex) => (
                                        <div
                                            className="exer-div"
                                            key={ex.exerId}
                                        >
                                            <div className="exer-nav">
                                                <input
                                                    className="exer-name-input"
                                                    placeholder="Exercise Name"
                                                    defaultValue={ex.exerName}
                                                />
                                                <div className="tags-div">
                                                    <button
                                                        className="toggle-tags toggle-button"
                                                        onClick={(e) =>
                                                            collapse(e)
                                                        }
                                                    >
                                                        Tags
                                                    </button>
                                                    <div className="tags collapse">
                                                        <button
                                                            className="tag-add"
                                                            onClick={(e) =>
                                                                addWoTag(e)
                                                            }
                                                        >
                                                            + Tag
                                                        </button>
                                                        {ex.tags.map((tag) => (
                                                            <div
                                                                className="tag"
                                                                key={tag}
                                                            >
                                                                <input
                                                                    className="tag-input"
                                                                    type="text"
                                                                    placeholder="Tag Name"
                                                                    defaultValue={
                                                                        tag
                                                                    }
                                                                />
                                                                <button
                                                                    className="del-button tag-del"
                                                                    onClick={(
                                                                        e
                                                                    ) =>
                                                                        delEl(e)
                                                                    }
                                                                >
                                                                    - Tag
                                                                </button>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                                <button
                                                    className="exer-del"
                                                    onClick={(e) =>
                                                        delParent(e)
                                                    }
                                                >
                                                    Remove
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
                                                {ex.sets.map((set) => (
                                                    <div
                                                        className="set-div"
                                                        key={set.id}
                                                    >
                                                        <input
                                                            className="reps-inp"
                                                            placeholder="reps"
                                                            defaultValue={
                                                                set.reps
                                                            }
                                                        />
                                                        <p className="reps-label">
                                                            r
                                                        </p>
                                                        <div className="units-div">
                                                            {set.units &&
                                                                set.units.map(
                                                                    (unit) => (
                                                                        <div
                                                                            className="unit-div"
                                                                            key={set.units.indexOf(
                                                                                unit
                                                                            )}
                                                                        >
                                                                            <input
                                                                                className="unit-val-inp"
                                                                                placeholder="value"
                                                                                defaultValue={
                                                                                    unit.val
                                                                                }
                                                                            />
                                                                            <input
                                                                                className="unit-measure-inp"
                                                                                type="text"
                                                                                list="units"
                                                                                placeholder="units"
                                                                                defaultValue={
                                                                                    unit.units
                                                                                }
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
                                                                                    Seconds
                                                                                    /
                                                                                    Rep
                                                                                </option>
                                                                                <option value="mins">
                                                                                    Minutes
                                                                                </option>
                                                                            </datalist>
                                                                            <button
                                                                                className="unit-del"
                                                                                onClick={(
                                                                                    e
                                                                                ) =>
                                                                                    delUnit(
                                                                                        e
                                                                                    )
                                                                                }
                                                                            >
                                                                                -
                                                                                Unit
                                                                            </button>
                                                                        </div>
                                                                    )
                                                                )}
                                                        </div>
                                                        <button
                                                            className="set-unit-add"
                                                            onClick={(e) =>
                                                                addUnit(e)
                                                            }
                                                        >
                                                            + Unit
                                                        </button>
                                                        <button
                                                            className="set-copy"
                                                            onClick={(e) =>
                                                                duplicateSet(e)
                                                            }
                                                        >
                                                            x2
                                                        </button>
                                                        <button
                                                            className="set-del"
                                                            onClick={(e) =>
                                                                delEl(e)
                                                            }
                                                        >
                                                            - Set
                                                        </button>
                                                    </div>
                                                ))}
                                                <button
                                                    className="submit-exer"
                                                    onClick={(e) =>
                                                        submitExercise(e)
                                                    }
                                                >
                                                    Update Exercise
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                <div className="submit-save-div">
                                    <button
                                        className="track-wo wo-button"
                                        onClick={(e) => trackCompleteWorkout(e)}
                                    >
                                        Track Workout
                                    </button>
                                    <button
                                        className="update-wo wo-button"
                                        onClick={(e) => updateWorkout(e)}
                                    >
                                        Update {woNm}
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
