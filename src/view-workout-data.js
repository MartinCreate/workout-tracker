import React, { useEffect, useState, useRef } from "react";
import { Link } from "react-router-dom";
import PopChart from "./apex-chart";
import ScatterPlot from "./apex-scatter";
// import { getExNames } from "./functions";

import axios from "./axios";

export default function ViewWoData() {
    // const [mounted, setMounted] = useState();
    const [woList, setWoList] = useState([]);
    const [woData, setWoData] = useState();
    const [seshData, setSeshData] = useState();
    const [exerNames, setExerNames] = useState([]);
    const [renderEx, setRenderEx] = useState();
    // const [renderSc, setRenderSc] = useState();

    useEffect(() => {
        // setMounted(true); //this is prob unnecessary
        console.log("View-Workout-Data Component Loaded");

        loadExerNames();
        loadData();
    }, []);

    const loadData = async () => {
        // console.log("loadData() in view-workout-data is running");

        const { data } = await axios.get("/view-basic-wo-data");
        setSeshData(data);
    };

    const loadExerNames = async () => {
        const { data } = await axios.get("/get-ex-names");

        for (let i = 0; i < data.length; i++) {
            //this if..statement should be removed after I reset the tables (we can't save a blank-named exercise)
            if (data[i].exercise_name == "") {
                data.splice(i, 1);
            }
            data[i].low_exer = data[i].exercise_name.toLowerCase();
        }
        // console.log("data in loadExerNames: ", data);

        setExerNames(data);
    };

    const collapse = (e) => {
        const coll = e.currentTarget;
        coll.classList.toggle("active");
        const content = coll.nextElementSibling;

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

    // ---- new below

    const renderExerChart = (e) => {
        // const currEl = e.currentTarget;
        // const parent = currEl.parentNode;
        const exerEl = document.getElementById("chart_exers");
        const exer = exerEl.options[exerEl.options.selectedIndex].innerHTML;
        console.log("exer: ", exer);

        setRenderEx(exer);
    };
    // ---- new above

    // --- Render HTML
    return (
        <div className="component-container">
            <div className="component" id="wo-creator-component">
                <h1>View Workout Data</h1>
                <Link to="/" className="back-home-link">
                    <p>Home</p>
                </Link>

                {/* new below xxx */}
                <div className="chart-choice">
                    <label htmlFor="chart_exers">Choose Your Exercise:</label>
                    <select name="chart_exers" id="chart_exers">
                        {exerNames &&
                            exerNames.map((ex) => (
                                <option
                                    value={ex.low_exer}
                                    key={ex.exercise_name}
                                >
                                    {ex.exercise_name}
                                </option>
                            ))}
                    </select>
                    <br />
                    <button
                        className="show-chart"
                        onClick={(e) => renderExerChart(e)}
                    >
                        Render Chart
                    </button>
                </div>
                {/* new above */}

                <div className="apex-chart">
                    {renderEx && <PopChart renderEx={renderEx} />}
                </div>
                <div className="apex-scatterplot">
                    <ScatterPlot />
                </div>

                <div id="view-woData-container">
                    <div className="basic-data-table">
                        <div className="table-header">
                            <div className="vd-nav-date vd-nav">
                                <p>Date</p>
                            </div>
                            <div className="vd-nav-workout vd-nav">
                                <p>Workout</p>
                            </div>
                            <div className="vd-nav-Exercises vd-nav">
                                <p>Exercises</p>
                            </div>
                        </div>
                        <div className="vd-table-content">
                            {/* <div className="vd-table-row">
                                <div className="vd-col1">May 25 2020</div>
                                <div className="vd-col2">Leg Day</div>
                                <div className="vd-col3">
                                    Squats, Lunges, Jump Lunges
                                </div>
                            </div> */}
                            {seshData &&
                                seshData.map((s) => (
                                    <div
                                        className="vd-table-row"
                                        key={s.seshId}
                                    >
                                        <div className="vd-col1">{s.date}</div>
                                        <div className="vd-col2">
                                            {s.woName}
                                        </div>
                                        <div className="vd-col3">
                                            <p>
                                                {s.exers.map((exer) => (
                                                    <span key={exer.exerId}>
                                                        {exer.exerName},{"  "}
                                                    </span>
                                                ))}
                                            </p>
                                        </div>
                                        {/* <div className="vd-col3">
                                            {s.exers.map((exer) => (
                                                <p key={exer}>{exer}</p>
                                            ))}
                                        </div> */}
                                    </div>
                                ))}
                        </div>
                    </div>

                    <div className="basic-data-table">
                        <div className="table-header">
                            <div className="vd-nav-date vd-nav">
                                <p>Date</p>
                            </div>
                            <div className="vd-nav-workout vd-nav">
                                <p>Workout</p>
                            </div>
                            <div className="vd-nav-Exercises vd-nav">
                                <p>Sets/Exercise</p>
                            </div>
                        </div>
                        <div className="vd-table-content">
                            {seshData &&
                                seshData.map((s) => (
                                    <div
                                        className="vd-table-row vd-rows2"
                                        key={s.seshId}
                                    >
                                        <div className="vd-col1">{s.date}</div>
                                        <div className="vd-col2">
                                            {s.woName}
                                        </div>
                                        {/* <div className="vd-col3">
                                            <p>
                                                {s.exers.map((exer) => (
                                                    <span key={exer.exerId}>
                                                        {exer.exerName}
                                                        <br />
                                                    </span>
                                                ))}
                                            </p>
                                        </div> */}
                                        <div className="vd-col4">
                                            {s.exers.map((ex) => (
                                                <div
                                                    className="vd-exer-sets-div"
                                                    key={ex.exerId}
                                                >
                                                    <div className="vd-exer-name">
                                                        {ex.exerName}
                                                    </div>
                                                    <div className="vd-exer-sets">
                                                        {ex.sets.map((set) => (
                                                            <div
                                                                className="vd-set-div"
                                                                key={set.setnr}
                                                            >
                                                                <span>
                                                                    {set.reps}r
                                                                </span>
                                                                <span>
                                                                    {set.val1}
                                                                    {set.units1}
                                                                </span>
                                                                <span>
                                                                    {set.val2}
                                                                    {set.units2}
                                                                </span>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
