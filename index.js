/* eslint-disable no-underscore-dangle */
import React from 'react';
import { FlatList, View, LayoutAnimation, StyleSheet } from 'react-native';
import PropTypes from 'prop-types';
import ColorPropType from 'ColorPropType';

import ListSeparator from './ListSeparator';
import ListItem from './ListItem';
import GhostItemOverlay from './GhostItemOverlay';

const propTypes = {
    wrapperStyle: PropTypes.style,
    sortable: PropTypes.bool.isRequired,
    itemHeight: PropTypes.number.isRequired,
    seperatorBackgroundColor: ColorPropType,
    seperatorColor: ColorPropType,
    seperatorLeftPadding: PropTypes.number,
    ...FlatList.propTypes,
};

const defaultProps = {
    sortable: true,
    keyExtractor: FlatList.defaultProps.keyExtractor,
};

class SortableFlatList extends React.PureComponent {

    constructor(props) {
        super(props);
        this.state = {
            data: props.data,
            selectedItem: null,
            selectedIndex: null,
        };
    }

    _onGhostChangeY = (dy) => {
        if (this.state.selectedItem === null) return;
        // dy: -40, itemHeight: 80 -> -1
        const indexChange = parseInt(dy / (this.props.itemHeight / 2), 10);
        const newIndex = Math.min(
                Math.max(this.state.selectedIndex + indexChange, 0),
                this.props.data.length - 1,
        );

        this._setItemToIndex(this.props.keyExtractor(this.state.selectedItem), newIndex);
    }

    _indexForItem = item => this._indexForItemId(this.props.keyExtractor(item))

    _indexForItemId(itemId) {
        const { keyExtractor } = this.props;
        const { data } = this.state;
        const foundItem = data.find(item => keyExtractor(item) === itemId);
        return data.indexOf(foundItem);
    }

    _removeAtIndex = (arr, index) => {
        const newArr = [...arr];
        if (index > -1) { newArr.splice(index, 1); }
        return newArr;
    }

    _addAtIndex = (arr, index, item) => {
        const newArr = [...arr];
        newArr.splice(index, 0, item);
        return newArr;
    }

    _setItemToIndex = (itemId, index) => {
        const { keyExtractor } = this.props;
        const { data } = this.state;
        const indexOfItem = this._indexForItemId(itemId);
        const item = data[indexOfItem];
        const dataWithoutItem = this._removeAtIndex(data, indexOfItem);
        const newDataArray = this._addAtIndex(dataWithoutItem, index, item);
        if (keyExtractor(data[index]) !== keyExtractor(newDataArray[index])) {
            LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
            this.setState({ data: newDataArray });
        }
    }


    _renderItem = (itemProps) => {
        const { keyExtractor } = this.props;
        const { selectedItem } = this.state;
        const selectedKey = selectedItem && keyExtractor(selectedItem);
        const itemKey = keyExtractor(itemProps.item);
        return (
          <ListItem
            {...itemProps}
            itemHeight={this.props.itemHeight}
            showPlaceHolder={selectedKey === itemKey}
            renderItem={this.props.renderItem}
          />
        );
    };

    _renderListSeperator = ({ highlighted }) => (
      <ListSeparator
        color={this.props.seperatorColor}
        backgroundColor={this.props.seperatorBackgroundColor}
        paddingLeft={this.props.seperatorLeftPadding}
        highlighted={this.state.animating && highlighted}
      />
    )

    _selectItem = ({ item, index }) => {
        this.setState({ selectedItem: item, selectedIndex: index });
    }

    _unselectItem = () => {
        this.setState({ selectedItem: null });
    }

    _getItemLayoutForIndex = (index) => {
        const seperatorHeight = StyleSheet.hairlineWidth;
        const itemHeight = this.props.itemHeight + seperatorHeight;

        return { length: itemHeight, offset: itemHeight * index, index };
    }

    _calculateItemsLayoutDetails = items => items.map((elem, index) => {
        const { length, offset } = this._getItemLayoutForIndex(index);
        return {
            height: length,
            minY: offset,
            midY: offset + (length / 2),
            maxY: offset + length,
        };
    })

    _getItemLayout = (data, index) => this._getItemLayoutForIndex(index)
    renderGhostItem = itemLayoutDetails => (
      <GhostItemOverlay
        itemLayoutDetails={itemLayoutDetails}
        data={this.state.data}
        renderItem={this.props.renderItem}
        onChangeY={this._onGhostChangeY}
        onSelectItem={this._selectItem}
        onUnselectItem={this._unselectItem}
        indexForItem={this._indexForItem}
      />
    )

    render() {
        // we will override renderItem and data with local versions
        const { sortable, wrapperStyle, data, ...remainingProps } = this.props;
        const itemLayoutDetails = this._calculateItemsLayoutDetails(data);
        return (
          <View style={wrapperStyle}>

            <FlatList
              scrollEnabled={!sortable || !!this.state.selectedItem}
              ItemSeparatorComponent={this._renderListSeperator}
              {...remainingProps}
              renderItem={this._renderItem}
              data={this.state.data}
              getItemLayout={this._getItemLayout}
            />

            {sortable && this.renderGhostItem(itemLayoutDetails)}

          </View>
        );
    }

}

SortableFlatList.defaultProps = defaultProps;
SortableFlatList.propTypes = propTypes;

module.exports = SortableFlatList;
