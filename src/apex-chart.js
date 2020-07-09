import React, { useEffect, useState, useRef } from "react";
import Chart from "react-apexcharts";
import axios from "./axios";

export default function PopChart() {
    const [options, setOptions] = useState({
        chart: {
            // background: "#f4f4f4",
            // foreColor: "#333",
            type: "line",
        },
        stroke: {
            curve: "smooth",
        },
        markers: {
            shape: "circle",
        },
        grid: {
            row: {
                colors: ["#f3f3f3", "transparent"], // takes an array which will be repeated on columns
                opacity: 0.5,
            },
        },
        xaxis: {
            categories: [
                "New York",
                "Los Angeles",
                "Chicago",
                "Houston",
                "Philadelphia",
                "Phoenix",
                "San Antonio",
                "San Diego",
                "Dallas",
                "San Jose",
            ],
            // type: "datetime",
            labels: {
                showDuplicates: false,
            },
        },
        plotOptions: {
            // line: {
            //     horizontal: false,
            // },
        },
        fill: {
            colors: ["#f44336"],
        },
        dataLabels: {
            enabled: true,
        },
        title: {
            text: "Kg/set for Bench Press By Workout Session",
            align: "center",
            margin: 20,
            offsetY: 20,
            style: {
                fontSize: "25px",
            },
        },
    });
    const [series, setSeries] = useState([
        {
            name: "Kg",
            data: [
                8550405,
                3971883,
                2720546,
                2296224,
                1567442,
                1563025,
                1469845,
                1394928,
                1300092,
                1026908,
            ],
        },
    ]);

    useEffect(() => {
        console.log("Apex-Chart component loaded!");
        loadData();
    }, []);

    const loadData = async () => {
        //getDataOn specifications will be chosen from drop-down menus

        const getDataOn = {
            type: "exercise",
            name: "Overhead Press",
        };

        console.log("getDataOn: ", getDataOn);

        const unit = "kg/set";

        try {
            const { data } = await axios.post("/chart-data", getDataOn);
            console.log("data in apex-chart: ", data);

            for (let i = 0; i < data.length; i++) {
                data[i].date = cleanDate(data[i].date);
            }
            // console.log("data after: ", data);

            //------------ X AXIS
            let categories = data.map((s) => {
                return s.date;
            });
            console.log("categories: ", categories);
            setOptions({
                ...options,
                xaxis: {
                    categories,
                },
                title: {
                    ...options.title,
                    text: `${getDataOn.name} - ${unit}`,
                },
            });

            // ------------ Y AXIS
            let yPoints = data.map((set) => {
                if (set.units1 == "kg") {
                    return set.val1;
                } else if (set.units2 == "kg") {
                    return set.val2;
                }
            });
            console.log("yPoints: ", yPoints);

            setSeries([
                {
                    name: "kg",
                    data: yPoints,
                },
            ]);
        } catch (err) {
            console.log("ERROR in loadData in /apex-chart.js: ", err);
        }
    };
    const click = () => {
        setOptions({
            ...options,
            plotOptions: {
                ...options.plotOptions,
                bar: {
                    ...options.plotOptions.bar,
                    horizontal: !options.plotOptions.bar.horizontal,
                },
            },
        });
    };

    const cleanDate = (date) => {
        const year = date.substring(0, 4);
        const month = date.substring(5, 7);
        const day = date.substring(8, 10);
        const cleanDate = day + "." + month + "." + year;
        return cleanDate;
    };

    return (
        <React.Fragment>
            <Chart
                options={options}
                series={series}
                type="line"
                height="450"
                width="100%"
            />
            {/* <button onClick={() => click()}>Horizontal</button> */}
        </React.Fragment>
    );
}
