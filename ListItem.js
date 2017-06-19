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
    componentDidMount() {
        // if (this.props.item.title === 'New York') {
        //     this.props.separators.highlight();
        // }
    }
    render() {
        const { item, showPlaceHolder, itemHeight, renderItem } = this.props;
        return (
            <View onLayout={() => console.log('Layout List Item')}>
                {showPlaceHolder ? <View style={{ height: itemHeight }} /> : renderItem({ item })}
            </View>
        );
    }
}

ListItem.propTypes = propTypes;
export default ListItem;
