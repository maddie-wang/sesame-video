import ToolbarHover from "./ToolbarHover";
// @flow

// We need to reference these files directly to avoid loading things that are not available
// in this environment (e.g. JitsiMeetJS or interfaceConfig)
import React, { Component } from "react";
import { Icon, IconShareDesktop } from "../base/icons";
import { useDbDatum } from "./firebase-hook";
import ShareScreenButtonActions from "./ShareScreenButtonActions";

const { api } = window.alwaysOnTop;

/**
 * Pass screenshare status to sharescreenbutton actions
 */
export default class ToolbarHoverWithScreenShare extends Component<Props> {
    constructor(props: *) {
        super(props);
    }
    render() {
        const ToolbarWithProps = () => {
            let screenshare = useDbDatum(
                `callID/${window.alwaysOnTop.callID}/${window.alwaysOnTop.uid}/screenshare`
            );
            console.log("rerendered screenshare", screenshare);
            return <ToolbarHover screenshare={screenshare} />;
        };

        return (
            <div>
                <ToolbarWithProps />
            </div>
        );
    }
}
