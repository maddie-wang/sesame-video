import React, { useReducer, useEffect, useRef } from "react";
import firebase from "firebase/app";
import equal from "deep-equal";
// https://pragli.com/blog/firebase-as-a-react-hook/

// useDbDatum loads a single datum at a single path (use this one a lot)
// useDbData loads multiple paths at the same time, returning an object
// where the keys are the paths and values are data (only needed once or twice... sorting)

// Usage:
// const SortedStudentNames = ({classUid}) => {
//     let students = useDbDatum(`classes/${classUid}/students`);
//     let uids = Object.keys(students || {});
//     let paths = uids.map(id => `students/${id}/name`);
//     let nameValues = useDbData(paths);
//     let names = Object.values(nameValues || {});
//     names.sort();
//     return <p>{names.join(', ')}</p>
//   }
// then in the return function have <SortedStudentNames/> to display that
// We load the list of student IDs from the class, using useDbDatum,
// then load all of the students' names using useDbData

function filterKeys(raw, allowed) {
    if (!raw) {
        return raw;
    }
    let s = new Set(allowed);
    return Object.keys(raw)
        .filter(key => s.has(key))
        .reduce((obj, key) => {
            obj[key] = raw[key];
            return obj;
        }, {});
}

export const useDbData = paths => {
    let unsubscribes = useRef({});
    let [data, dispatch] = useReducer((d, action) => {
        let { type, path, payload } = action;
        switch (type) {
            case "upsert":
                if (payload) {
                    return Object.assign({}, d, { [path]: payload });
                } else {
                    let newData = Object.assign({}, d);
                    delete newData[path];
                    return newData;
                }
            default:
                throw new Error("bad type to reducer", type);
        }
    }, {});
    useEffect(() => {
        for (let path of Object.keys(paths)) {
            if (unsubscribes.current.hasOwnProperty(path)) {
                continue;
            }
            let ref = firebase.database().ref(path);
            let lastVal = undefined;
            let f = ref.on("value", snap => {
                let val = snap.val();
                val = paths[path] ? filterKeys(val, paths[path]) : val;
                if (!equal(val, lastVal)) {
                    dispatch({ type: "upsert", payload: val, path });
                    lastVal = val;
                }
            });
            unsubscribes.current[path] = () => ref.off("value", f);
        }
        let pathSet = new Set(Object.keys(paths));
        for (let path of Object.keys(unsubscribes.current)) {
            if (!pathSet.has(path)) {
                unsubscribes.current[path]();
                delete unsubscribes.current[path];
                dispatch({ type: "upsert", path });
            }
        }
    });
    useEffect(() => {
        return () => {
            for (let unsubscribe of Object.values(unsubscribes.current)) {
                unsubscribe();
            }
        };
    }, []);
    return data;
};

export const useDbDatum = (path, allowed = null) => {
    let datum = useDbData(path ? { [path]: allowed } : {});
    if (datum[path]) {
        return datum[path];
    }
    return null;
};
