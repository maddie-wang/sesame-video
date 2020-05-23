// @flow

import React, { Component } from "react";
import { Icon, IconMicDisabled, IconMicrophone } from "../base/icons";

import "firebase/database";
const { api } = window.alwaysOnTop;

export default class ParticipantScreen extends Component<*, State> {
    constructor(props: *) {
        super(props);

        this.state = {
            participantObj: props.participantObj,
            participantsUid: props.participantsUid
        };
        console.log("participantScreen", this.state);
    }

    turnOnVideoUntilDisplayed = () => {
        console.log("turnOnVideoUntilDisplayed");
        let pVideo = api._getParticipantVideo(
            this.props.participantObj.jitsiUid
        );
        if (
            pVideo &&
            pVideo.srcObject &&
            pVideo.srcObject.active &&
            this.state.participantObj.video
        ) {
            // pVideo is ready for your video to be displayed
            console.log("Done!");
            var video = document.getElementById(
                this.props.participantObj.jitsiUid
            );
            video.srcObject = pVideo.srcObject; // play your webcam video in the <video> tag
            video.onloadedmetadata = function(e) {
                video.play();
            };
        } else {
            console.log("Not ready");
            if (!this.state.participantObj.video) {
                console.log("detected you turned off the video");
                return;
            } else {
                window.setTimeout(this.turnOnVideoUntilDisplayed, 100); // keep checking if pVideo is ready
            }
        }
    };

    // run code after initial render
    componentDidMount = () => {
        console.log("componentDidMount ParticipantScreen", this.state);
        let videoOn = this.state.participantObj.video;

        console.log("videoOn?", this.props.participantObj.displayName, videoOn);
        if (videoOn) {
            this.turnOnVideoUntilDisplayed();
        }
    };

    // run code after each update of component state
    // update video when the component rerenders (eg: partcipant object got updated, they are muted/video on off)

    componentDidUpdate(prevProps) {
        console.log("componentDidUpdate ParticipantScreen", this.state);

        if (prevProps.participantObj !== this.props.participantObj) {
            this.setState({
                participantObj: this.props.participantObj,
                participantsUid: this.props.participantsUid
            });
        }

        let videoOn = this.state.participantObj.video;

        console.log("videoOn?", this.props.participantObj.displayName, videoOn);
        if (videoOn) {
            this.turnOnVideoUntilDisplayed();
        }
    }
    toggleScreenShare = () => {
        console.log("toggleScreenShare");
        api.executeCommand("toggleShareScreen");
    };

    render() {
        let pObject; // persons' screen object to return
        let pVideo = api._getParticipantVideo(
            this.state.participantObj.jitsiUid
        );
        let videoOn = this.state.participantObj.video;
        console.log(
            "Rerender screen",
            this.state.participantObj.jitsiUid,
            videoOn,
            "audio?",
            this.state.participantObj.audio
        );
        let audioIcon = this.state.participantObj.audio ? (
            <Icon
                size={14}
                src={IconMicrophone}
                style={{ display: "inline-block" }}
            />
        ) : (
            <Icon
                size={14}
                src={IconMicDisabled}
                style={{ display: "inline-block", color: "red" }}
            />
        );
        if (videoOn) {
            pObject = (
                <div style={{ position: "relative" }}>
                    <video
                        autoPlay="true"
                        autoplay="true"
                        muted="muted"
                        id={this.state.participantObj.jitsiUid}
                        style={{ transform: "scaleX(-1)", height: "auto" }}
                    ></video>

                    <div
                        style={{
                            position: "absolute",
                            background: "#000000ab",
                            bottom: 0,
                            fontSize: 12
                        }}
                    >
                        {audioIcon} {this.state.participantObj.displayName}
                    </div>
                </div>
            );
        } else {
            pObject = (
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
                        id={this.state.participantObj.jitsiUid}
                        style={{
                            marginLeft: "5px",
                            top: "50%",
                            transform: "translateY(-50%)",
                            position: "absolute",
                            fontSize: 14
                        }}
                    >
                        {audioIcon} {this.state.participantObj.displayName}
                    </div>
                </div>
            );
        }
        return pObject;
    }
}
