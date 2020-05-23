// @flow

import React, { Component } from "react";

import Toolbar from "./Toolbar";

/**
 * The timeout in ms for hiding the toolbar.
 */
const TOOLBAR_TIMEOUT = 4000;

/**
 * Represents the always on top page.
 *
 * @class AlwaysOnTop
 * @extends Component
 */
export default class ToolbarHover extends Component<*, State> {
    _hovered: boolean;

    constructor(props: *) {
        super(props);

        this.state = {
            visible: true
        };

        this._mouseMove = this._mouseMove.bind(this);
        this._onMouseOut = this._onMouseOut.bind(this);
        this._onMouseOver = this._onMouseOver.bind(this);
    }

    /**
     * Hides the toolbar after a timeout.
     *
     * @returns {void}
     */
    _hideToolbarAfterTimeout() {
        setTimeout(() => {
            if (this._hovered) {
                this._hideToolbarAfterTimeout();
            } else {
                this.setState({ visible: false });
            }
        }, TOOLBAR_TIMEOUT);
    }

    _mouseMove: () => void;

    /**
     * Handles mouse move events.
     *
     * @returns {void}
     */
    _mouseMove() {
        this.state.visible || this.setState({ visible: true });
    }

    _onMouseOut: () => void;

    /**
     * Toolbar mouse out handler.
     *
     * @returns {void}
     */
    _onMouseOut() {
        this._hovered = false;
        this.setState({ visible: false });
    }

    _onMouseOver: () => void;

    /**
     * Toolbar mouse over handler.
     *
     * @returns {void}
     */
    _onMouseOver() {
        this._hovered = true;
    }

    /**
     * Sets mouse move listener and initial toolbar timeout.
     *
     * @inheritdoc
     * @returns {void}
     */
    componentDidMount() {
        window.addEventListener("mousemove", this._mouseMove);
        window.addEventListener("mouseout", this._onMouseOut);

        this._hideToolbarAfterTimeout();
    }

    /**
     * Sets a timeout to hide the toolbar when the toolbar is shown.
     *
     * @inheritdoc
     * @returns {void}
     */
    componentDidUpdate(prevProps: *, prevState: State) {
        if (!prevState.visible && this.state.visible) {
            this._hideToolbarAfterTimeout();
        }
    }

    /**
     * Removes all listeners.
     *
     * @inheritdoc
     * @returns {void}
     */
    componentWillUnmount() {
        window.removeEventListener("mousemove", this._mouseMove);
        window.removeEventListener("mouseout", this._onMouseOut);
    }

    /**
     * Implements React's {@link Component#render()}.
     *
     * @inheritdoc
     * @returns {ReactElement}
     */
    render() {
        return (
            <Toolbar className={this.state.visible ? "fadeIn" : "fadeOut"} />
        );
    }
}
