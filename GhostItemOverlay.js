import React from 'react';
import PropTypes from 'prop-types';
import { View, Animated, TouchableWithoutFeedback, StyleSheet, PanResponder } from 'react-native';

const propTypes = {
    onChangeY: PropTypes.func.isRequired,
    onSelectItem: PropTypes.func.isRequired,
    renderItem: PropTypes.func.isRequired,
    data: PropTypes.arrayOf(PropTypes.object),
    getItemLayoutForIndex: PropTypes.func.isRequired,
    onUnselectItem: PropTypes.func.isRequired,
};

class GhostItemOverLay extends React.Component {
    constructor(props) {
        super(props);

        this.itemLayoutDetails = [];
        this.yOffset = new Animated.Value(0);
        this.state = { visible: false, selectedItem: null, selectedIndex: null };
        this.calculateItemsLayoutDetails(props.data);
        this.yOffset.addListener((e) => {
            this.props.onChangeY(e.value);
        });
    }

    componentWillMount() {
        this._panResponder = PanResponder.create({
            onStartShouldSetResponderCapture: () => this.state.visible,
            onMoveShouldSetResponderCapture: () => this.state.visible,
            onMoveShouldSetPanResponderCapture: () => this.state.visible,
            onPanResponderGrant: () => { this.yOffset.setValue(0); },
            onPanResponderMove: Animated.event([null, { dy: this.yOffset }]),
            onPanResponderRelease: (e, { vx, vy }) => {
                this.unselectItem();
            },
        });
    }

    componentWillReceiveProps(nextProps) {
        if (this.props.data !== nextProps.data) {
            this.calculateItemsLayoutDetails(nextProps.data);
        }
    }

    onLongPress = ({ nativeEvent: { locationY } }) => {
        const index = this.getIndexForYLocation(locationY);
        const item = this.props.data[index];
        this.setState({ visible: true, selectedItem: item, selectedIndex: index });
        this.props.onSelectItem({ item, index });
    }

    unselectItem() {
        this.setState({
            selectedItem: null,
            selectedIndex: null,
            visible: false,
        });
        this.props.onUnselectItem();
    }

    getIndexForYLocation = (yLocation) => {
        let resultIndex = null;
        this.itemLayoutDetails.forEach(({ minY, maxY }, index) => {
            if (yLocation > minY && yLocation < maxY) {
                resultIndex = index;
            }
        });
        return resultIndex;
    }

    getItemTransForm() {
        return { transform: [{ translateY: this.yOffset }] };
    }

    calculateItemsLayoutDetails = (items) => {
        this.itemLayoutDetails = items.map((elem, index) => {
            const { length, offset } = this.props.getItemLayoutForIndex(index);
            return {
                height: length,
                minY: offset,
                midY: offset + (length / 2),
                maxY: offset + length,
            };
        });
    }

    render() {
        const { renderItem } = this.props;
        const { selectedIndex } = this.state;
        const selectedLayoutDetails = this.itemLayoutDetails[selectedIndex] || {};
        const invisibleStyles = [StyleSheet.absoluteFill, { backgroundColor: 'rgba(255, 0, 0, 0.1)', zIndex: 2 }];
        const visibleStyles = [{ position: 'absolute', top: selectedLayoutDetails.minY, height: selectedLayoutDetails.height, width: '100%', zIndex: 2 }];
        return (

            <Animated.View
                {...this._panResponder.panHandlers}
                style={[this.state.visible ? visibleStyles : invisibleStyles, this.state.visible && this.getItemTransForm()]}
            >
                <TouchableWithoutFeedback onLongPress={this.onLongPress}>
                    <View style={StyleSheet.absoluteFill}>
                        {this.state.visible && this.state.selectedItem &&
                          renderItem({ item: this.state.selectedItem, isGhost: true })
                        }
                    </View>
                </TouchableWithoutFeedback>
            </Animated.View>

        );
    }
}

GhostItemOverLay.propTypes = propTypes;
export default GhostItemOverLay;
