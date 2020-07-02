// @flow

import React, { Component } from "react";
import Spinner from "@atlaskit/spinner";

// We need to reference these files directly to avoid loading things that are not available
// in this environment (e.g. JitsiMeetJS or interfaceConfig)
import StatelessAvatar from "../base/avatar/components/web/StatelessAvatar";
import { getAvatarColor, getInitials } from "../base/avatar/functions";

import ToolbarHoverWithScreenShare from "./ToolbarHoverWithScreenShare";
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
            callID: null,
            loaded: false
        };
        this.shouldSetAudio = true;
    }

    // load screen if someone joins
    loadScreen = () => {
        // checks firebase to see if user's audio needs to be unmuted.
        // these users have 'true' in the audio field of callID/ database
        let that = this;
        firebase
            .database()
            .ref(
                `callID/${window.alwaysOnTop.callID}/${window.alwaysOnTop.uid}/audio`
            )
            .once("value", snapshot => {
                if (snapshot.val() && this.shouldSetAudio) {
                    console.log("audio!");
                    api.executeCommand("toggleAudio");
                    that.shouldSetAudio = false;
                    console.log("should be false", that.shouldSetAudio);
                }
            });
        console.log("loadScreen");
        console.log("api", api);
        let jitsiUid = api._myUserID;
        // if your jitsiUid is defined, and you haven't already loaded the screen..
        if (jitsiUid && !this.state.loaded) {
            console.log(
                `Loaded! Participants ${api._participants} , you are, ${api._participants[jitsiUid]} and jitsi uid ${jitsiUid}`
            );
            let uid = window.alwaysOnTop.uid;
            let callID = window.alwaysOnTop.callID;
            firebase
                .database()
                .ref(`callID/${callID}/${uid}/jitsiUid`)
                .set(jitsiUid);
            this.setState({
                loaded: true
            });
        }
    };

    // attempts to load screen every second until it does!
    attemptToLoadScreenUntilLoaded = () => {
        console.log("attempt to load screen");
        if (api._myUserID && !this.state.loaded) {
            console.log("SUCESSFULLY LOADED!!");
            this.loadScreen();
        } else {
            console.log("Retry to load screen");
            if (this.state.loaded) {
                console.log("Already loaded");
                return;
            }
            window.setTimeout(this.attemptToLoadScreenUntilLoaded, 200); // keep checking if pVideo is ready
        }
    };

    // get Call ID once.
    // give your conversation object your UserId from Jitsi
    // useful for finding participant video given UserId later on
    componentDidMount() {
        this.attemptToLoadScreenUntilLoaded();
    }

    render() {
        console.log(
            "rerendered",
            window.alwaysOnTop.uid,
            window.alwaysOnTop.displayName,
            window.alwaysOnTop.callID
        );
        if (this.state.loaded) {
            return (
                <div id="alwaysOnTop">
                    <ToolbarHoverWithScreenShare />
                    <Participants
                        callID={window.alwaysOnTop.callID}
                        uid={window.alwaysOnTop.uid}
                    />
                </div>
            );
        }
        return (
            <div id="alwaysOnTop">
                <div
                    style={{
                        position: "relative",
                        width: "100%",
                        background: "black",
                        height: "56px",
                        borderBottom: "1px solid #272727"
                    }}
                >
                    <div
                        style={{
                            marginLeft: "5px",
                            top: "50%",
                            transform: "translateY(-50%)",
                            position: "absolute",
                            fontSize: 14
                        }}
                    >
                        <Spinner
                            size="small"
                            invertColor
                            isCompleting={this.state.loaded}
                        />{" "}
                        {window.alwaysOnTop.displayName}
                    </div>
                </div>
            </div>
        );
    }
}
