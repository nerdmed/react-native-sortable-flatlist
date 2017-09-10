import React from 'react';
import PropTypes from 'prop-types';
import { View, Animated, StyleSheet, PanResponder } from 'react-native';


const propTypes = {
    onChangeY: PropTypes.func.isRequired,
    onSelectItem: PropTypes.func.isRequired,
    renderItem: PropTypes.func.isRequired,
    data: PropTypes.arrayOf(PropTypes.object),
    indexForItem: PropTypes.func.isRequired,
    itemLayoutDetails: PropTypes.arrayOf(PropTypes.shape({
        height: PropTypes.number,
        minY: PropTypes.number,
        midY: PropTypes.number,
        maxY: PropTypes.number,
    }).isRequired).isRequired,
    onUnselectItem: PropTypes.func.isRequired,
};

class GhostItemOverLay extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            yOffset: new Animated.Value(0),
            visible: false,
            selectedItem: null,
            selectedIndex: null,
            animatingToEndPosition: false,
        };
        this.state.yOffset.addListener((e) => {
            if (!this.state.animatingToEndPosition) {
                this.props.onChangeY(e.value);
            }
        });
    }

    componentWillMount() {
        this._panResponder = PanResponder.create({
            onStartShouldSetResponderCapture: () => true,
            onStartShouldSetPanResponderCapture: () => true,
            onMoveShouldSetResponderCapture: () => this.state.visible,
            onMoveShouldSetPanResponderCapture: () => this.state.visible,
            onPanResponderGrant: (e) => {
                this.onLongPress(e);
                this.state.yOffset.setValue(0);
            },
            onPanResponderMove: Animated.event([null, { dy: this.state.yOffset }]),
            onPanResponderRelease: this.unselectItem,
            onPanResponderTerminationRequest: this.unselectItem,
            onPanResponderTerminate: this.unselectItem,
        });
    }


    onLongPress = ({ nativeEvent: { locationY } }) => {
        const index = this.getIndexForYLocation(locationY);
        const item = this.props.data[index];
        this.setState({ visible: true, selectedItem: item, selectedIndex: index });
        this.props.onSelectItem({ item, index });
    }

    unselectItem = () => {
        if (this.state.selectedItem === null) return;

        const newIndex = this.props.indexForItem(this.state.selectedItem);
        const initalLayout = this.props.itemLayoutDetails[this.state.selectedIndex];
        const targetItem = this.props.itemLayoutDetails[newIndex];
        const targetY = targetItem.minY - initalLayout.minY;
        this.setState({ animatingToEndPosition: true });

        Animated.timing(this.state.yOffset, {
            toValue: targetY,
            duration: 190,
            useNativeDriver: true,
        })
         .start(() => {
             this.setState({ animatingToEndPosition: false });
             this.setState({
                 selectedItem: null,
                 selectedIndex: null,
                 visible: false,
             });
             this.props.onUnselectItem();
         });

        return true;
    }

    getIndexForYLocation = (yLocation) => {
        let resultIndex = null;
        this.props.itemLayoutDetails.forEach(({ minY, maxY }, index) => {
            if (yLocation > minY && yLocation < maxY) {
                resultIndex = index;
            }
        });
        return resultIndex;
    }

    getItemTransForm() {
        return { transform: [{ translateY: this.state.yOffset }] };
    }


    render() {
        const { renderItem } = this.props;
        const { selectedIndex } = this.state;
        const selectedLayoutDetails = this.props.itemLayoutDetails[selectedIndex] || {};
        const invisibleStyles = [StyleSheet.absoluteFill, { backgroundColor: 'rgba(0, 0, 0, 0.1)', zIndex: 2 }];
        const visibleStyles = [{ position: 'absolute', top: selectedLayoutDetails.minY, height: selectedLayoutDetails.height, width: '100%', zIndex: 2 }];
        return (

            <Animated.View
                {...this._panResponder.panHandlers}
                style={this.state.visible ? [visibleStyles, this.getItemTransForm()] : invisibleStyles}
            >

                <View style={StyleSheet.absoluteFill}>
                    {this.state.visible && this.state.selectedItem &&
                        renderItem({ item: this.state.selectedItem, isGhost: true })
                    }
                </View>

            </Animated.View>

        );
    }
}

GhostItemOverLay.propTypes = propTypes;
export default GhostItemOverLay;
