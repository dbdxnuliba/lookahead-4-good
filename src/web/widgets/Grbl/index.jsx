import classNames from 'classnames';
import PropTypes from 'prop-types';
import React, { PureComponent } from 'react';
import Widget from '../../components/Widget';
import i18n from '../../lib/i18n';
import controller from '../../lib/controller';
import store from '../../store';
import Grbl from './Grbl';
import {
    GRBL
} from '../../constants';
import {
    MODAL_NONE
} from './constants';
import styles from './index.styl';

class GrblWidget extends PureComponent {
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
        openModal: (name = MODAL_NONE, params = {}) => {
            this.setState({
                modal: {
                    name: name,
                    params: params
                }
            });
        },
        closeModal: () => {
            this.setState({
                modal: {
                    name: MODAL_NONE,
                    params: {}
                }
            });
        },
        updateModalParams: (params = {}) => {
            this.setState({
                modal: {
                    ...this.state.modal,
                    params: {
                        ...this.state.modal.params,
                        ...params
                    }
                }
            });
        },
        toggleQueueReports: () => {
            const expanded = this.state.panel.queueReports.expanded;

            this.setState({
                panel: {
                    ...this.state.panel,
                    queueReports: {
                        ...this.state.panel.queueReports,
                        expanded: !expanded
                    }
                }
            });
        },
        toggleStatusReports: () => {
            const expanded = this.state.panel.statusReports.expanded;

            this.setState({
                panel: {
                    ...this.state.panel,
                    statusReports: {
                        ...this.state.panel.statusReports,
                        expanded: !expanded
                    }
                }
            });
        },
        toggleModalGroups: () => {
            const expanded = this.state.panel.modalGroups.expanded;

            this.setState({
                panel: {
                    ...this.state.panel,
                    modalGroups: {
                        ...this.state.panel.modalGroups,
                        expanded: !expanded
                    }
                }
            });
        }
    };
    controllerEvents = {
        'serialport:open': (options) => {
            const { port, controllerType } = options;
            this.setState({
                isReady: controllerType === GRBL,
                port: port
            });
        },
        'serialport:close': (options) => {
            const initialState = this.getInitialState();
            this.setState({ ...initialState });
        },
        'Grbl:state': (state) => {
            this.setState({
                controller: {
                    ...this.state.controller,
                    type: GRBL,
                    state: state
                }
            });
        },
        'Grbl:settings': (settings) => {
            this.setState({
                controller: {
                    ...this.state.controller,
                    type: GRBL,
                    settings: settings
                }
            });
        }
    };

    componentDidMount() {
        this.addControllerEvents();
    }
    componentWillUnmount() {
        this.removeControllerEvents();
    }
    componentDidUpdate(prevProps, prevState) {
        const {
            minimized,
            panel
        } = this.state;

        store.set('widgets.grbl.minimized', minimized);
        store.set('widgets.grbl.panel.queueReports.expanded', panel.queueReports.expanded);
        store.set('widgets.grbl.panel.statusReports.expanded', panel.statusReports.expanded);
        store.set('widgets.grbl.panel.modalGroups.expanded', panel.modalGroups.expanded);
    }
    getInitialState() {
        return {
            minimized: store.get('widgets.grbl.minimized', false),
            isFullscreen: false,
            isReady: (controller.loadedControllers.length === 1) || (controller.type === GRBL),
            canClick: true, // Defaults to true
            port: controller.port,
            controller: {
                type: controller.type,
                state: controller.state,
                settings: controller.settings
            },
            modal: {
                name: MODAL_NONE,
                params: {}
            },
            panel: {
                queueReports: {
                    expanded: store.get('widgets.grbl.panel.queueReports.expanded')
                },
                statusReports: {
                    expanded: store.get('widgets.grbl.panel.statusReports.expanded')
                },
                modalGroups: {
                    expanded: store.get('widgets.grbl.panel.modalGroups.expanded')
                }
            }
        };
    }
    addControllerEvents() {
        Object.keys(this.controllerEvents).forEach(eventName => {
            const callback = this.controllerEvents[eventName];
            controller.on(eventName, callback);
        });
    }
    removeControllerEvents() {
        Object.keys(this.controllerEvents).forEach(eventName => {
            const callback = this.controllerEvents[eventName];
            controller.off(eventName, callback);
        });
    }
    canClick() {
        const { port } = this.state;
        const { type } = this.state.controller;

        if (!port) {
            return false;
        }
        if (type !== GRBL) {
            return false;
        }

        return true;
    }
    render() {
        const { minimized, isFullscreen, isReady } = this.state;
        const state = {
            ...this.state,
            canClick: this.canClick()
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
                        Grbl
                    </Widget.Title>
                    <Widget.Controls className={this.props.sortable.filterClassName}>
                        {isReady &&
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
                        }
                        {isReady &&
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
                        }
                        <Widget.Button
                            title={i18n._('Remove widget')}
                            onClick={this.props.onRemove}
                        >
                            <i className="fa fa-times" />
                        </Widget.Button>
                    </Widget.Controls>
                </Widget.Header>
                {isReady &&
                <Widget.Content
                    className={classNames(
                        styles['widget-content'],
                        { [styles.hidden]: minimized }
                    )}
                >
                    <Grbl
                        state={state}
                        actions={actions}
                    />
                </Widget.Content>
                }
            </Widget>
        );
    }
}

export default GrblWidget;
