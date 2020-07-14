import React, { useEffect, useState, useRef } from "react";
import ReactApexChart from "react-apexcharts";
import axios from "./axios";

export default function ScatterPlot() {
    const [series, setSeries] = useState([
        // {
        //     name: "TEAM 1",
        //     data: new Date("11 Feb 2017 GMT").getTime(),
        // },
        // {
        //     name: "TEAM 2",
        //     data: new Date("11 Feb 2017 GMT").getTime(),
        // },
        // {
        //     name: "TEAM 3",
        //     data: new Date("11 Feb 2017 GMT").getTime(),
        // },
        // {
        //     name: "TEAM 4",
        //     data: new Date("11 Feb 2017 GMT").getTime(),
        // },
        // {
        //     name: "TEAM 5",
        //     data: new Date("11 Feb 2017 GMT").getTime(),
        // },
    ]);
    const [options, setOptions] = useState({
        // series: [
        //     {
        //         name: "TEAM 1",
        //         data: generateDayWiseTimeSeries(
        //             new Date("11 Feb 2017 GMT").getTime(),
        //             20,
        //             {
        //                 min: 10,
        //                 max: 60,
        //             }
        //         ),
        //     },
        //     {
        //         name: "TEAM 2",
        //         data: generateDayWiseTimeSeries(
        //             new Date("11 Feb 2017 GMT").getTime(),
        //             20,
        //             {
        //                 min: 10,
        //                 max: 60,
        //             }
        //         ),
        //     },
        //     {
        //         name: "TEAM 3",
        //         data: generateDayWiseTimeSeries(
        //             new Date("11 Feb 2017 GMT").getTime(),
        //             30,
        //             {
        //                 min: 10,
        //                 max: 60,
        //             }
        //         ),
        //     },
        //     {
        //         name: "TEAM 4",
        //         data: generateDayWiseTimeSeries(
        //             new Date("11 Feb 2017 GMT").getTime(),
        //             10,
        //             {
        //                 min: 10,
        //                 max: 60,
        //             }
        //         ),
        //     },
        //     {
        //         name: "TEAM 5",
        //         data: generateDayWiseTimeSeries(
        //             new Date("11 Feb 2017 GMT").getTime(),
        //             30,
        //             {
        //                 min: 10,
        //                 max: 60,
        //             }
        //         ),
        //     },
        // ],
        options: {
            chart: {
                height: 350,
                type: "scatter",
                zoom: {
                    type: "xy",
                },
            },
            dataLabels: {
                enabled: false,
            },
            grid: {
                xaxis: {
                    lines: {
                        show: true,
                    },
                },
                yaxis: {
                    lines: {
                        show: true,
                    },
                },
            },
            xaxis: {
                type: "datetime",
            },
            yaxis: {
                max: 70,
            },
        },
    });

    useEffect(() => {
        loadScatterData();
    });

    const loadScatterData = async () => {
        try {
            const { data } = await axios.get("/scatter-plot");
            console.log("data in apex-scatter: ", data);

            //UP NEXT:
            //--figure out how to get tag-names as y-axis points instead of the current numbers (max: 70)
            //--make sure the date is in a format that apexcharts can understand

            // for (let i = 0; i < data.length; i++) {
            //     data[i].date = cleanDate(data[i].date);
            // }
            // console.log("data after: ", data);

            // //------------ X AXIS
            // let categories = data.map((s) => {
            //     return s.date;
            // });
            // // console.log("categories: ", categories);
            // setOptions({
            //     ...options,
            //     xaxis: {
            //         categories,
            //     },
            //     title: {
            //         ...options.title,
            //         text: `${getDataOn.name} - ${unit}`,
            //     },
            // });

            // // ------------ Y AXIS
            // let yPoints = data.map((set) => {
            //     if (set.units1 == "kg") {
            //         return set.val1;
            //     } else if (set.units2 == "kg") {
            //         return set.val2;
            //     }
            // });
            // // console.log("yPoints: ", yPoints);

            // setSeries([
            //     {
            //         name: "kg",
            //         data: yPoints,
            //     },
            // ]);
        } catch (err) {
            console.log("ERROR in loadData in /apex-scatter.js: ", err);
        }
    };
    //---- this is from traversy's example
    // const click = () => {
    //     setOptions({
    //         ...options,
    //         plotOptions: {
    //             ...options.plotOptions,
    //             bar: {
    //                 ...options.plotOptions.bar,
    //                 horizontal: !options.plotOptions.bar.horizontal,
    //             },
    //         },
    //     });
    // };

    // const cleanDate = (date) => {
    //     const year = date.substring(0, 4);
    //     const month = date.substring(5, 7);
    //     const day = date.substring(8, 10);
    //     const cleanDate = day + "." + month + "." + year;
    //     return cleanDate;
    // };

    return (
        <React.Fragment>
            <ReactApexChart
                options={options}
                series={series}
                type="scatter"
                height={350}
            />
        </React.Fragment>
    );
}
