// @flow

import React, { Component } from "react";

// We need to reference these files directly to avoid loading things that are not available
// in this environment (e.g. JitsiMeetJS or interfaceConfig)
import StatelessAvatar from "../base/avatar/components/web/StatelessAvatar";
import { getAvatarColor, getInitials } from "../base/avatar/functions";

import ToolbarHover from "./ToolbarHover";
import firebase from "firebase/app";
import "firebase/database";
import Participants from "./Participants";

const { api } = window.alwaysOnTop;

const config = {
    apiKey: "AIzaSyA3SvUxoN7vXxSaWonI_SQzByTrQkMCBHo",
    authDomain: "meetupmaddie.firebaseapp.com",
    databaseURL: "https://meetupmaddie.firebaseio.com",
    projectId: "meetupmaddie",
    storageBucket: "meetupmaddie.appspot.com",
    messagingSenderId: "866748950106",
    appId: "1:866748950106:web:149026c14f1af319dbda63",
    measurementId: "G-HD91W5866L"
};

firebase.initializeApp(config);

/**
 * The type of the React {@code Component} state of {@link AlwaysOnTop}.
 */
type State = {
    avatarURL: string,
    displayName: string,
    formattedDisplayName: string,
    isVideoDisplayed: boolean,
    userID: string,
    visible: boolean
};

/**
 * Represents the always on top page.
 *
 * @class AlwaysOnTop
 * @extends Component
 */
export default class AlwaysOnTop extends Component<*, State> {
    _hovered: boolean;

    /**
     * Initializes a new {@code AlwaysOnTop} instance.
     *
     * @param {*} props - The read-only properties with which the new instance
     * is to be initialized.
     */
    constructor(props: *) {
        super(props);

        this.state = {
            uid: null,
            callID: null
        };
    }

    // get Call ID once.
    // give your conversation object your UserId from Jitsi
    // useful for finding participant video given UserId later on
    componentDidMount() {
        api.on("videoMuteStatusChanged", this._videoMutedListener);
        api.on("audioMuteStatusChanged", this._audioMutedListener);
        console.log("api", api);
        let jitsiUid = api._myUserID;
        let uid = api._participants[jitsiUid].displayName;
        let that = this;
        firebase
            .database()
            .ref(`calls/${uid}/callID`)
            .once("value", function(snapshot) {
                var callID = snapshot.val();
                if (callID) {
                    firebase
                        .database()
                        .ref(`callID/${callID}/${uid}/jitsiUid`)
                        .set(jitsiUid);
                    that.setState({
                        callID: callID,
                        uid: uid
                    });
                }
            });
    }

    _videoMutedListener = obj => {
        console.log("video available", !obj.muted);
        if (this.state.uid) {
            firebase
                .database()
                .ref(`callID/${this.state.callID}/${this.state.uid}/video`)
                .set(!obj.muted);
        }
    };

    _audioMutedListener = obj => {
        console.log("muted", obj.muted);
        if (this.state.uid) {
            firebase
                .database()
                .ref(`callID/${this.state.callID}/${this.state.uid}/audio`)
                .set(!obj.muted);
        }
    };

    componentWillUnmount() {
        api.removeListener("videoMuteStatusChanged", this._videoMutedListener);
        api.removeListener("audioMuteStatusChanged", this._audioMutedListener);
    }

    render() {
        console.log("rerendered");
        if (this.state.callID && this.state.uid) {
            return (
                <div id="alwaysOnTop">
                    <ToolbarHover />
                    <Participants
                        callID={this.state.callID}
                        uid={this.state.uid}
                    />
                </div>
            );
        }
        return (
            <div id="alwaysOnTop">
                <ToolbarHover />
                <p>loading</p>
            </div>
        );
    }
}
