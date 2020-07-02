// @flow

// We need to reference these files directly to avoid loading things that are not available
// in this environment (e.g. JitsiMeetJS or interfaceConfig)
import React, { Component } from "react";
import { Icon, IconShareDesktop } from "../base/icons";
import firebase from "firebase/app";
import Spinner from "@atlaskit/spinner";

const { api } = window.alwaysOnTop;

/**
 * Share screen button actions
 */
export default class ShareScreenButtonActions extends Component<Props> {
    accessibilityLabel = "ShareScreen";
    constructor(props: *) {
        super(props);
    }

    componentDidMount() {
        api.on("screenSharingStatusChanged", this.screenSharingStatusChanged);
    }

    componentWillUnmount() {
        api.removeListener(
            "screenSharingStatusChanged",
            this.screenSharingStatusChanged
        );
    }

    // changes status in database
    screenSharingStatusChanged = eve => {
        // on = true or on = null (when you explicitly go from screenshare to no screenshare)
        if (eve.on) {
            // when we finish submitting in the screenshare window, turns it on!
            firebase
                .database()
                .ref(
                    `callID/${window.alwaysOnTop.callID}/${window.alwaysOnTop.uid}/screenshare`
                )
                .set("on");
        }
        // else {
        //     firebase
        //         .database()
        //         .ref(`callID/${callID}/${uid}/screenshare`)
        //         .set("off");
        // }
        console.log("SCREENSHARE!!!", eve);
    };

    turnOnScreenShare = () => {
        api.executeCommand("toggleShareScreen");
        firebase
            .database()
            .ref(
                `callID/${window.alwaysOnTop.callID}/${window.alwaysOnTop.uid}/screenshare`
            )
            .set("pending");
    };

    turnOffScreenShare = () => {
        api.executeCommand("toggleShareScreen");
        firebase
            .database()
            .ref(
                `callID/${window.alwaysOnTop.callID}/${window.alwaysOnTop.uid}/screenshare`
            )
            .set("off");
    };

    render() {
        if (this.props.screenshare === "on") {
            return (
                <div>
                    <Icon
                        onClick={this.turnOffScreenShare}
                        size={24}
                        src={IconShareDesktop}
                        style={{
                            display: "inline-block",
                            padding: "7px",
                            backgroundColor: "#165ecc"
                        }}
                    />
                </div>
            );
        } else if (this.props.screenshare === "pending") {
            return (
                <div
                    style={{
                        padding: "7px"
                    }}
                    onClick={this.turnOffScreenShare}
                >
                    <Spinner
                        size="medium"
                        invertColor
                        isCompleting={this.props.screenshare === "pending"}
                    />
                </div>
            );
        } else {
            // off
            return (
                <div>
                    <Icon
                        onClick={this.turnOnScreenShare}
                        size={24}
                        src={IconShareDesktop}
                        style={{ display: "inline-block", padding: "7px" }}
                    />
                </div>
            );
        }
    }
}
