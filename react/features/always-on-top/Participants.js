// @flow

import React, { Component } from "react";

import { useDbDatum } from "./firebase-hook";
import ParticipantScreen from "./ParticipantScreen";
import firebase from "firebase/app";

export default class Participants extends Component<*, State> {
    constructor(props: *) {
        super(props);
        console.log("participants", this.props.callID);
    }

    getAllVideos = friendsInCall => {
        console.log("friendsInCall", friendsInCall);
        let screens = [];
        for (let u in friendsInCall) {
            // If we have a cached copy of participants userobj data...
            if (u === "buttsack") {
                console.log("BYE");
                continue;
            }

            let screen = (
                <ParticipantScreen
                    participantObj={friendsInCall[u]}
                    participantsUid={u}
                    uid={this.props.uid}
                />
            );
            if (u !== this.props.uid) {
                screens.push(screen);
            } else {
                screens.unshift(screen);
            }
        }
        console.log("screens!~", screens);
        return screens;
    };

    render() {
        const PeoplesScreens = () => {
            let friendsInCall = useDbDatum(`callID/${this.props.callID}`);
            if (!friendsInCall) {
                return <div />;
            }
            console.log(this.getAllVideos(friendsInCall));
            return this.getAllVideos(friendsInCall);
        };
        console.log("PeoplesScreens", PeoplesScreens);
        return (
            <div>
                <PeoplesScreens />
            </div>
        );
    }
}
