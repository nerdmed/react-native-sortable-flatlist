import React from 'react';
import PropTypes from 'prop-types';
import { View } from 'react-native';

const propTypes = {
    item: PropTypes.object.isRequired,
    renderItem: PropTypes.func.isRequired,
    index: PropTypes.number.isRequired,
    itemHeight: PropTypes.number.isRequired,
    showPlaceHolder: PropTypes.bool.isRequired,

};

class ListItem extends React.PureComponent {
    render() {
        const { item, showPlaceHolder, itemHeight, renderItem } = this.props;
        return (
          <View>
            {showPlaceHolder ? <View style={{ height: itemHeight }} /> : renderItem({ item })}
          </View>
        );
    }
}

ListItem.propTypes = propTypes;
export default ListItem;
