import React from 'react';
import { View, FlatList, Animated } from 'react-native';

const propTypes = {
    ...FlatList.propTypes,
};

class SortableFlatList extends React.PureComponent {
    state = { isSortable: false };

    _getTranslationForIndex = (index) => {
        let translate = 0;

        if (index === 0) translate = 80;
        if (index === 1) translate = -80;

        return {
            transform: [
                {
                    translateY: translate,
                },
            ],
        };
    }


    _renderPlaceHolderItem = ({ item, index }) => (
        <Animated.View style={this._getTranslationForIndex(index)}>
            <View style={{ backgroundColor: 'gray', height: 80 }} />
        </Animated.View>
    )

    _renderAnimatedItem = ({ item, index }) => (
        <Animated.View style={this._getTranslationForIndex(index)}>
            {this.props.renderItem({ item })}
        </Animated.View>
    )

    _renderItem = ({ item, index }) => {
        if (index === 1) return this._renderPlaceHolderItem({ item, index });
        return this._renderAnimatedItem({ item, index });
    }

    render() {
        const { renderItem, ...remainingProps } = this.props;
        return (
            <FlatList
                {...remainingProps}
                renderItem={this._renderItem}
            />
        );
    }

}

SortableFlatList.propTypes = propTypes;

module.exports = SortableFlatList;
