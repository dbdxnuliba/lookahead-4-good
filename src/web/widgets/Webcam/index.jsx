import classNames from 'classnames';
import React, { Component, PropTypes } from 'react';
import shallowCompare from 'react-addons-shallow-compare';
import Widget from '../../components/Widget';
import i18n from '../../lib/i18n';
import store from '../../store';
import Webcam from './Webcam';
import * as Settings from './Settings';
import styles from './index.styl';
import {
    MEDIA_SOURCE_LOCAL
} from './constants';

class WebcamWidget extends Component {
    static propTypes = {
        widgetId: PropTypes.string.isRequired,
        onFork: PropTypes.func.isRequired,
        onRemove: PropTypes.func.isRequired,
        sortable: PropTypes.object
    };

    state = this.getInitialState();
    actions = {
        toggleFullscreen: () => {
            const { isFullscreen } = this.state;
            this.setState({ isFullscreen: !isFullscreen });
        },
        toggleMinimized: () => {
            const { minimized } = this.state;
            this.setState({ minimized: !minimized });
        },
        changeImageScale: (value) => {
            this.setState({ scale: value });
        },
        rotateLeft: () => {
            const { flipHorizontally, flipVertically, rotation } = this.state;
            const rotateLeft = (flipHorizontally && flipVertically) || (!flipHorizontally && !flipVertically);
            const modulus = 4;
            const i = rotateLeft ? -1 : 1;
            this.setState({ rotation: (Math.abs(Number(rotation || 0)) + modulus + i) % modulus });
        },
        rotateRight: () => {
            const { flipHorizontally, flipVertically, rotation } = this.state;
            const rotateRight = (flipHorizontally && flipVertically) || (!flipHorizontally && !flipVertically);
            const modulus = 4;
            const i = rotateRight ? 1 : -1;
            this.setState({ rotation: (Math.abs(Number(rotation || 0)) + modulus + i) % modulus });
        },
        toggleFlipHorizontally: () => {
            const { flipHorizontally } = this.state;
            this.setState({ flipHorizontally: !flipHorizontally });
        },
        toggleFlipVertically: () => {
            const { flipVertically } = this.state;
            this.setState({ flipVertically: !flipVertically });
        },
        toggleCrosshair: () => {
            const { crosshair } = this.state;
            this.setState({ crosshair: !crosshair });
        },
        toggleMute: () => {
            const { muted } = this.state;
            this.setState({ muted: !muted });
        }
    };

    shouldComponentUpdate(nextProps, nextState) {
        return shallowCompare(this, nextProps, nextState);
    }
    componentDidUpdate(prevProps, prevState) {
        const { widgetId } = this.props;
        const {
            minimized,
            disabled,
            mediaSource,
            url,
            scale,
            rotation,
            flipHorizontally,
            flipVertically,
            crosshair,
            muted
        } = this.state;

        store.set(`widgets["${widgetId}"].minimized`, minimized);
        store.set(`widgets["${widgetId}"].disabled`, disabled);
        store.set(`widgets["${widgetId}"].mediaSource`, mediaSource);
        store.set(`widgets["${widgetId}"].url`, url);
        store.set(`widgets["${widgetId}"].geometry.scale`, scale);
        store.set(`widgets["${widgetId}"].geometry.rotation`, rotation);
        store.set(`widgets["${widgetId}"].geometry.flipHorizontally`, flipHorizontally);
        store.set(`widgets["${widgetId}"].geometry.flipVertically`, flipVertically);
        store.set(`widgets["${widgetId}"].crosshair`, crosshair);
        store.set(`widgets["${widgetId}"].muted`, muted);
    }
    getInitialState() {
        const { widgetId } = this.props;

        return {
            minimized: store.get(`widgets["${widgetId}"].minimized`, false),
            isFullscreen: false,
            disabled: store.get(`widgets["${widgetId}"].disabled`, true),
            mediaSource: store.get(`widgets["${widgetId}"].mediaSource`, MEDIA_SOURCE_LOCAL),
            url: store.get(`widgets["${widgetId}"].url`, ''),
            scale: store.get(`widgets["${widgetId}"].geometry.scale`, 1.0),
            rotation: store.get(`widgets["${widgetId}"].geometry.rotation`, 0),
            flipHorizontally: store.get(`widgets["${widgetId}"].geometry.flipHorizontally`, false),
            flipVertically: store.get(`widgets["${widgetId}"].geometry.flipVertically`, false),
            crosshair: store.get(`widgets["${widgetId}"].crosshair`, false),
            muted: store.get(`widgets["${widgetId}"].muted`, false)
        };
    }
    render() {
        const { disabled, minimized, isFullscreen } = this.state;
        const classes = {
            webcamOnOff: classNames(
                'fa',
                { 'fa-toggle-on': !disabled },
                { 'fa-toggle-off': disabled }
            )
        };

        const state = {
            ...this.state
        };
        const actions = {
            ...this.actions
        };

        return (
            <Widget fullscreen={isFullscreen}>
                <Widget.Header>
                    <Widget.Title>
                        <Widget.Sortable className={this.props.sortable.handleClassName}>
                            <i className="fa fa-bars" />
                            <span className="space" />
                        </Widget.Sortable>
                        {i18n._('Webcam')}
                    </Widget.Title>
                    <Widget.Controls className={this.props.sortable.filterClassName}>
                        <Widget.Button
                            title={i18n._('Edit')}
                            onClick={(event) => {
                                const options = {
                                    mediaSource: this.state.mediaSource,
                                    url: this.state.url
                                };

                                Settings.show(options)
                                    .then(data => {
                                        const { mediaSource, url } = data;
                                        this.setState({ mediaSource, url });
                                    });
                            }}
                        >
                            <i className="fa fa-cog" />
                        </Widget.Button>
                        <Widget.Button
                            title={i18n._('Refresh')}
                            onClick={(event) => this.webcam.refresh()}
                        >
                            <i className="fa fa-refresh" />
                        </Widget.Button>
                        <Widget.Button
                            title={minimized ? i18n._('Open') : i18n._('Close')}
                            onClick={actions.toggleMinimized}
                        >
                            <i
                                className={classNames(
                                    'fa',
                                    { 'fa-chevron-up': !minimized },
                                    { 'fa-chevron-down': minimized }
                                )}
                            />
                        </Widget.Button>
                        <Widget.Button
                            title={i18n._('Fullscreen')}
                            onClick={actions.toggleFullscreen}
                        >
                            <i
                                className={classNames(
                                    'fa',
                                    { 'fa-expand': !isFullscreen },
                                    { 'fa-compress': isFullscreen }
                                )}
                            />
                        </Widget.Button>
                        <Widget.Button
                            title={i18n._('Fork widget')}
                            onClick={this.props.onFork}
                        >
                            <i className="fa fa-code-fork" />
                        </Widget.Button>
                        <Widget.Button
                            title={i18n._('Remove widget')}
                            onClick={this.props.onRemove}
                        >
                            <i className="fa fa-times" />
                        </Widget.Button>
                    </Widget.Controls>
                    <Widget.Toolbar>
                        <Widget.Button
                            title={disabled ? i18n._('Enable') : i18n._('Disable')}
                            type="default"
                            onClick={(event) => this.setState({ disabled: !disabled })}
                        >
                            <i className={classes.webcamOnOff} />
                        </Widget.Button>
                    </Widget.Toolbar>
                </Widget.Header>
                <Widget.Content
                    className={classNames(
                        styles['widget-content'],
                        { [styles.hidden]: minimized },
                        { [styles.fullscreen]: isFullscreen }
                    )}
                >
                    <Webcam
                        ref={node => {
                            this.webcam = node;
                        }}
                        state={state}
                        actions={actions}
                    />
                </Widget.Content>
            </Widget>
        );
    }
}

export default WebcamWidget;
