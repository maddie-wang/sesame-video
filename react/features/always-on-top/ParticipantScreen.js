// @flow

import React, { Component } from "react";
import { Icon, IconMicDisabled, IconMicrophone } from "../base/icons";
import Spinner from "@atlaskit/spinner";
import firebase from "firebase/app";
import "firebase/database";
const { api } = window.alwaysOnTop;

export default class ParticipantScreen extends Component<*, State> {
    constructor(props: *) {
        super(props);

        this.state = {
            participantObj: props.participantObj,
            participantsUid: props.participantsUid
        };
        this.shortClick = true;
    }

    handleMouseDown = event => {
        this.shortClick = true;
        window.setTimeout(this.markLongClick, 200); //
        console.log(`MouseDown`);
    };
    markLongClick = () => {
        this.shortClick = false;
        console.log(`ShortClick=False`);
    };

    turnOnVideoUntilDisplayed = () => {
        console.log("turnOnVideoUntilDisplayed");
        let pVideo = api._getParticipantVideo(
            this.state.participantObj.jitsiUid
        );
        var video = document.getElementById(this.state.participantObj.jitsiUid);
        if (
            video &&
            pVideo &&
            pVideo.srcObject &&
            pVideo.srcObject.active &&
            this.state.participantObj.video
        ) {
            // pVideo is ready for your video to be displayed
            console.log(
                "DONE DISPLAYING VIDEO FOR ",
                this.state.participantObj.displayName,
                this.state.participantObj
            );
            video.srcObject = pVideo.srcObject; // play your webcam video in the <video> tag
            video.onloadedmetadata = function(e) {
                video.play();
                console.log("PLAY onloadedmetadata", e);
            };
            video.addEventListener("loadeddata", function(e) {
                video.play();
                console.log("PLAY loadeddata", e);
            });
        } else {
            console.log("Video not ready");
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
        document.addEventListener("mousedown", this.handleMouseDown);
        // document.addEventListener("mouseup", this.handleMouseUp);
        console.log("componentDidMount", this.state);
        let videoOn = this.state.participantObj.video;
        if (videoOn) {
            this.turnOnVideoUntilDisplayed();
            window.setTimeout(this.turnOnVideoUntilDisplayed(), 2000);
        }
    };

    componentWillUnmount() {
        document.removeEventListener("mousedown", this.handleMouseDown);
        // document.removeEventListener("mouseup", this.handleMouseUp);
    }

    // run code after each update of component state
    // update video when the component rerenders (eg: partcipant object got updated, they are muted/video on off)

    componentDidUpdate(prevProps) {
        console.log("componentDidUpdate", this.state);

        if (prevProps.participantObj !== this.props.participantObj) {
            this.setState({
                participantObj: this.props.participantObj,
                participantsUid: this.props.participantsUid
            });
        }

        let videoOn = this.state.participantObj.video;
        if (videoOn) {
            this.turnOnVideoUntilDisplayed();
        }
    }

    expandVideo = isScreenshare => {
        console.log(`expandVideo, ${this.shortClick}`);

        if (this.shortClick) {
            firebase
                .database()
                .ref(`expand-video/${window.alwaysOnTop.uid}`)
                .set({
                    jitsiUid: this.state.participantObj.jitsiUid,
                    screenshare: isScreenshare
                });
        }
    };

    render() {
        let pObject; // persons' screen object to return
        let videoOn = this.state.participantObj.video;
        console.log("videoOn?", videoOn);
        let screenshareOn = this.state.participantObj.screenshare === "on";
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
        if (videoOn && !screenshareOn) {
            pObject = (
                <div
                    id="video-screen"
                    className="sesame-video"
                    onClick={() => {
                        this.expandVideo(screenshareOn);
                    }}
                >
                    <video
                        autoplay
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
        } else if (videoOn && screenshareOn) {
            pObject = (
                <div
                    id="video-screen"
                    className="sesame-video"
                    onClick={() => {
                        this.expandVideo(screenshareOn);
                    }}
                >
                    <video
                        autoplay
                        autoPlay="true"
                        autoplay="true"
                        muted="muted"
                        id={this.state.participantObj.jitsiUid}
                        style={{ height: "auto" }}
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
                            isCompleting={
                                this.state.participantObj.jitsiUid
                                    ? true
                                    : false
                            }
                        />{" "}
                        {this.state.participantObj.jitsiUid ? audioIcon : ""}
                        {this.state.participantObj.jitsiUid ? " " : ""}
                        {this.state.participantObj.displayName}
                    </div>
                </div>
            );
        }
        return pObject;
    }
}
