import axios from "./axios";

export const delUnit = (e) => {
    const parent = e.target.parentElement;
    const gParent = parent.parentNode;
    const ggParent = gParent.parentNode;

    const deleteEl = e.target.parentElement;
    deleteEl.parentNode.removeChild(deleteEl);

    if (ggParent.getElementsByClassName("unit-div").length < 2) {
        const addUnit = ggParent.getElementsByClassName("set-unit-add")[0];
        addUnit.style.display = "inline-block";
    }
};

export const delEl = (e, elClass) => {
    const deleteEl = e.target.parentElement;
    const gP = deleteEl.parentNode;

    deleteEl.parentNode.removeChild(deleteEl);

    if (elClass == "tag") {
        if (gP.getElementsByClassName(elClass).length < 10) {
            const tagAdd = gP.getElementsByClassName("tag-add")[0];
            tagAdd.style.display = "inline-block";
        }
    } else if (elClass == "set") {
        setSetNumbers(gP);
    }
};

export const delParent = (e) => {
    const deleteEl = e.target.parentElement;
    const workout = deleteEl.parentNode;
    workout.parentNode.removeChild(workout);
};

export const collapse = (e) => {
    const coll = e.currentTarget;
    coll.classList.toggle("active");
    const content = coll.nextElementSibling;

    //removing success/error message
    // const gP = coll.parentNode.parentNode;
    const successMsgs = document.getElementsByClassName("success-save");
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
export const collapseFlex = (e) => {
    const coll = e.currentTarget;
    coll.classList.toggle("active");
    const content = coll.nextElementSibling;

    //removing success/error message
    // const gP = coll.parentNode.parentNode;
    const successMsgs = document.getElementsByClassName("success-save");
    if (successMsgs) {
        for (let i = 0; i < successMsgs.length; i++) {
            successMsgs[i].remove();
        }
    }

    if (content.style.display === "flex") {
        content.style.display = "none";
    } else {
        content.style.display = "flex";
    }
};

export const submitExercise = async (e) => {
    console.log("--- In submitExercise(e) ---");
    const saveButton = e.target;
    const parent = e.target.parentElement;
    const gP = parent.parentNode;
    const gggP = gP.parentNode.parentNode;

    removeMsgs();

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
            const reps = setDivs[s].getElementsByClassName("reps-inp")[0].value;
            //error message if reps is not a number

            setData.push(reps);

            const val = setDivs[s].getElementsByClassName("unit-val-inp");
            const m = setDivs[s].getElementsByClassName("unit-measure-inp");
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

    console.log("submitExercise data being sent to server: ", exerData);
    if (!exerData.exName) {
        const errMsg = document.createElement("div");
        errMsg.classList.add("success-save");
        errMsg.classList.add("error-save");
        errMsg.innerHTML =
            "Error: please make sure your exercise has a name and at least one filled out set";
        parent.insertBefore(errMsg, saveButton);
        console.log("Error, no exerName");
        return;
    }

    try {
        const { data } = await axios.post("/submit-exercise", exerData);
        console.log("data after /submit-exercise: ", data);

        if (data == "success") {
            // render feedback message
            const goodMsg = document.createElement("div");
            goodMsg.classList.add("success-save");
            goodMsg.innerHTML = "Exercise data has been saved!";
            parent.insertBefore(goodMsg, saveButton);
        } else if (data == "error") {
            const errMsg = document.createElement("div");
            errMsg.classList.add("success-save");
            errMsg.classList.add("error-save");
            errMsg.innerHTML =
                "Error: please make sure your exercise has a name and at least one filled out set";
            // console.log("saveButton: ", saveButton);
            parent.insertBefore(errMsg, saveButton);
        }
    } catch (e) {
        console.log("ERROR in POST /submit-exercise: ", e);
    }
};

export const createTagsDiv = () => {
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

//export this (and import in other create-workout) when editing hardcoded html
export const addWoTag = (e) => {
    console.log("addWoTag is running");

    const parent = e.target.parentElement;
    const newTagDiv = document.createElement("div");
    const tagInp = document.createElement("input");

    const delTag = document.createElement("button");
    delTag.innerHTML = "- Tag";
    delTag.addEventListener("click", (e) => delEl(e, "tag"));
    delTag.classList.add("del-button");
    delTag.classList.add("tag-del");

    newTagDiv.classList.add("tag");
    tagInp.classList.add("tag-input");
    tagInp.type = "text";
    tagInp.setAttribute("placeholder", "Tag Name");

    newTagDiv.appendChild(tagInp);
    newTagDiv.appendChild(delTag);
    parent.appendChild(newTagDiv);

    if (parent.getElementsByClassName("tag").length == 10) {
        const tagAdd = parent.getElementsByClassName("tag-add")[0];
        tagAdd.style.display = "none";
    }
};

export const addExercise = (e, location) => {
    const p = e.target.parentElement;
    const parent = p.parentNode;

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
    delExer.addEventListener("click", (e) => delParent(e));
    delExer.innerHTML = "Remove";

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
    submitExer.addEventListener("click", (e) => submitExercise(e));
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
    console.log("parent: ", parent);
    const submitWo = parent.getElementsByClassName(location)[0];
    parent.insertBefore(exerDiv, submitWo);
};

export const renderChosenExer = async (e, location, submitExText) => {
    const exerName = e.target.innerHTML;

    const p = e.target.parentElement;
    const parent = p.parentNode.parentNode.parentNode;

    try {
        const { data } = await axios.get(`/get-ex-data/${exerName}`);

        const exerDiv = document.createElement("div");
        exerDiv.classList.add("exer-div");

        const exerNav = document.createElement("div");
        exerNav.classList.add("exer-nav");

        const exerInp = document.createElement("input");
        exerInp.classList.add("exer-name-input");
        exerInp.setAttribute("placeholder", "Exercise Name");
        exerInp.setAttribute("value", exerName);

        const tagsDiv = createTagsDiv();
        const tagsInsert = tagsDiv.getElementsByClassName("tags")[0];

        const tagsArr = data.tagsArr;
        for (let i = 0; i < tagsArr.length; i++) {
            const newTagDiv = document.createElement("div");
            const tagInp = document.createElement("input");

            const delTag = document.createElement("button");
            delTag.innerHTML = "- Tag";
            delTag.addEventListener("click", (e) => delEl(e, "tag"));
            delTag.classList.add("del-button");
            delTag.classList.add("tag-del");

            newTagDiv.classList.add("tag");
            tagInp.classList.add("tag-input");
            tagInp.type = "text";
            tagInp.setAttribute("placeholder", "Tag Name");

            tagInp.setAttribute("value", tagsArr[i]);

            newTagDiv.appendChild(tagInp);
            newTagDiv.appendChild(delTag);
            tagsInsert.appendChild(newTagDiv);
        }

        const delExer = document.createElement("button");
        delExer.classList.add("exer-del");
        delExer.addEventListener("click", (e) => delParent(e));
        delExer.innerHTML = "Remove";

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
        submitExer.addEventListener("click", (e) => submitExercise(e));
        submitExer.innerHTML = submitExText;

        setsDiv.appendChild(setAdd);
        setsDiv.appendChild(submitExer);

        const setsArr = data.setsArr;
        for (let i = 0; i < setsArr.length; i++) {
            const setDiv = document.createElement("div");
            setDiv.classList.add("set-div");

            const repsInp = document.createElement("input");
            repsInp.classList.add("reps-inp");
            repsInp.setAttribute("placeholder", "reps");
            repsInp.setAttribute("value", setsArr[i].reps);

            const pr = document.createElement("p");
            pr.classList.add("reps-label");
            pr.innerHTML = "r";

            const unitsDiv = document.createElement("div");
            unitsDiv.classList.add("units-div");

            let unitsData = [];
            if (setsArr[i].units1) {
                let unitJ1 = [];
                unitJ1.push(setsArr[i].units1);
                unitJ1.push(setsArr[i].val1);
                unitsData.push(unitJ1);

                if (setsArr[i].units2) {
                    let unitJ2 = [];
                    unitJ2.push(setsArr[i].units2);
                    unitJ2.push(setsArr[i].val2);
                    unitsData.push(unitJ2);
                }
            }

            for (let j = 0; j < unitsData.length; j++) {
                const untDiv = returnUnitDiv();
                const val = untDiv.getElementsByClassName("unit-val-inp")[0];
                val.setAttribute("value", unitsData[j][1]);
                const meas = untDiv.getElementsByClassName(
                    "unit-measure-inp"
                )[0];
                meas.setAttribute("value", unitsData[j][0]);
                unitsDiv.appendChild(untDiv);
            }

            const addUnits = document.createElement("button");
            addUnits.classList.add("set-unit-add");
            addUnits.innerHTML = "+ Unit";
            addUnits.addEventListener("click", (e) => addUnit(e));

            if (unitsData.length >= 2) {
                addUnits.style.display = "none";
            }

            const copySet = document.createElement("button");
            copySet.classList.add("set-copy");
            copySet.innerHTML = "x2";
            copySet.addEventListener("click", (e) => duplicateSet(e));
            const delSet = document.createElement("button");
            delSet.classList.add("set-del");
            delSet.addEventListener("click", (e) => delEl(e, "set"));
            delSet.innerHTML = "- Set";

            setDiv.appendChild(repsInp);
            setDiv.appendChild(pr);
            setDiv.appendChild(unitsDiv);
            setDiv.appendChild(addUnits);
            setDiv.appendChild(copySet);
            setDiv.appendChild(delSet);

            setsDiv.insertBefore(setDiv, submitExer);
        }

        exerNav.appendChild(exerInp);
        exerNav.appendChild(tagsDiv);
        exerNav.appendChild(delExer);

        exerDiv.appendChild(exerNav);
        exerDiv.appendChild(toggleSets);
        exerDiv.appendChild(setsDiv);
        setSetNumbers(setsDiv);

        parent.appendChild(exerDiv);
        const submitWo = parent.getElementsByClassName(location)[0];
        parent.insertBefore(exerDiv, submitWo);

        // console.log("parent in renderChosenExer: ", parent);
        const chButton = parent.getElementsByClassName("exer-choose")[0];
        const chDiv = parent.getElementsByClassName("exerchoices-div")[0];

        chButton.classList.remove("active");
        chDiv.style.display = "none";
    } catch (e) {
        console.log("ERROR in renderChosenExer: ", e);
    }
};

export const getExNames = async (e, location, submitExText) => {
    const p = e.target.parentElement;
    const { data } = await axios.get("/get-ex-names");

    const exerList = p.getElementsByClassName("exer-choices")[0];

    while (exerList.firstChild) {
        exerList.removeChild(exerList.lastChild);
    }

    let docFrag = document.createDocumentFragment();
    for (const exer of data) {
        const exLi = document.createElement("p");
        exLi.classList.add("exer-choice");
        exLi.addEventListener("click", (e) =>
            renderChosenExer(e, location, submitExText)
        );
        exLi.innerHTML = exer.exercise_name;
        docFrag.appendChild(exLi);
    }

    exerList.appendChild(docFrag);
};

//only exported for editing hardcoded html
export const addSet = (e) => {
    const parent = e.target.parentElement;
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
    delSet.addEventListener("click", (e) => delEl(e, "set"));
    delSet.innerHTML = "- Set";

    setDiv.appendChild(repsInp);
    setDiv.appendChild(pr);
    setDiv.appendChild(unitsDiv);

    setDiv.appendChild(addUnits);
    setDiv.appendChild(copySet);
    setDiv.appendChild(delSet);

    const submitExer = parent.getElementsByClassName("submit-exer")[0];
    parent.insertBefore(setDiv, submitExer);

    setSetNumbers(parent);
};

//only exported for editing hardcoded html
export const duplicateSet = (e) => {
    const parent = e.target.parentElement;
    const grandparent = parent.parentNode;

    const clone = parent.cloneNode(true);

    const addUnitClone = clone.getElementsByClassName("set-unit-add")[0];
    const copySetClone = clone.getElementsByClassName("set-copy")[0];
    const delSetClone = clone.getElementsByClassName("set-del")[0];
    const delUnitClone = clone.getElementsByClassName("unit-del");

    addUnitClone.addEventListener("click", (e) => addUnit(e));
    copySetClone.addEventListener("click", (e) => duplicateSet(e));
    delSetClone.addEventListener("click", (e) => delEl(e, "set"));
    if (delUnitClone) {
        for (let i = 0; i < delUnitClone.length; i++) {
            delUnitClone[i].addEventListener("click", (e) => delUnit(e));
        }
    }

    grandparent.insertBefore(clone, parent.nextSibling);

    console.log("grandparent in duplicate set: ", grandparent);
    console.log("parent: ", parent);
    console.log("clone: ", clone);

    setSetNumbers(grandparent);
};

//only exported for editing hardcoded html
export const addUnit = (e) => {
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
    unitsList.id = "units";
    unitsList.setAttribute("name", "units");

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
    unitDel.addEventListener("click", (e) => delUnit(e));
    unitDel.innerHTML = "- Unit";

    unitDiv.appendChild(valInp);
    unitDiv.appendChild(measureInp);
    unitDiv.appendChild(unitsList);
    unitDiv.appendChild(unitDel);

    unitDiv.classList.add("unit-div");

    prevSib.appendChild(unitDiv);

    if (parent.getElementsByClassName("unit-div").length >= 2) {
        const addUnit = parent.getElementsByClassName("set-unit-add")[0];
        addUnit.style.display = "none";
    }
};

export const returnUnitDiv = () => {
    const unitDiv = document.createElement("div");

    const valInp = document.createElement("input");
    valInp.classList.add("unit-val-inp");
    valInp.setAttribute("placeholder", "value");
    valInp.type = "text";

    const measureInp = document.createElement("input");
    measureInp.classList.add("unit-measure-inp");
    measureInp.setAttribute("placeholder", "units");
    measureInp.setAttribute("list", "units");
    measureInp.type = "text";

    const unitsList = document.createElement("datalist");
    unitsList.id = "units";
    unitsList.setAttribute("name", "units");

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
    unitDel.addEventListener("click", (e) => delUnit(e));
    unitDel.innerHTML = "- Unit";

    unitDiv.appendChild(valInp);
    unitDiv.appendChild(measureInp);
    unitDiv.appendChild(unitsList);
    unitDiv.appendChild(unitDel);

    unitDiv.classList.add("unit-div");

    return unitDiv;

    // if (parent.getElementsByClassName("unit-div").length == 2) {
    //     const addUnit = parent.getElementsByClassName("set-unit-add")[0];
    //     addUnit.style.display = "none";
    // }
};

const setSetNumbers = (setsDiv) => {
    const sets = setsDiv.getElementsByClassName("set-div");
    for (let i = 0; i < sets.length; i++) {
        const currentSet = sets[i];
        const firstEl = currentSet.getElementsByClassName("reps-inp")[0];
        const setNumbIs = currentSet.getElementsByClassName("set-number")[0];

        if (setNumbIs) {
            setNumbIs.innerHTML = `${i + 1}.`;
        } else {
            const setNumb = document.createElement("p");
            setNumb.classList.add("set-number");
            setNumb.innerHTML = `${i + 1}.`;
            currentSet.insertBefore(setNumb, firstEl);
        }
    }
};

export const removeErrMsgs = () => {
    const eMsgs = document.getElementsByClassName("error-save");
    if (eMsgs) {
        for (let i = 0; i < eMsgs.length; i++) {
            eMsgs[i].remove();
        }
    }
};
export const removeSuccessMsgs = () => {
    const successMsgs = document.getElementsByClassName("success-save");
    if (successMsgs) {
        for (let i = 0; i < successMsgs.length; i++) {
            successMsgs[i].remove();
        }
    }
};
export const removeMsgs = () => {
    const eMsgs = document.getElementsByClassName("error-save");
    if (eMsgs) {
        for (let i = 0; i < eMsgs.length; i++) {
            eMsgs[i].remove();
        }
    }
    const successMsgs = document.getElementsByClassName("success-save");
    if (successMsgs) {
        for (let i = 0; i < successMsgs.length; i++) {
            successMsgs[i].remove();
        }
    }
};
