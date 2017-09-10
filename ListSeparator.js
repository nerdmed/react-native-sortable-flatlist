import React from 'react';
import PropTypes from 'prop-types';
import ColorPropType from 'ColorPropType';
import { View, StyleSheet } from 'react-native';

const propTypes = {
    color: ColorPropType.isRequired,
    backgroundColor: ColorPropType.isRequired,
    paddingLeft: PropTypes.number.isRequired,
    highlighted: PropTypes.bool.isRequired,
};

const defaultProps = {
    backgroundColor: 'transparent',
    color: '#333333',
    paddingLeft: 20,
    highlighted: false,
};

const ListSeparator = ({ color, backgroundColor, paddingLeft, highlighted }) => {
    if (highlighted) return null;
    return (
      <View style={{ height: StyleSheet.hairlineWidth, backgroundColor, paddingLeft }} >
        <View style={{ height: StyleSheet.hairlineWidth, backgroundColor: color }} />
      </View>
    );
};


ListSeparator.defaultProps = defaultProps;
ListSeparator.propTypes = propTypes;
export default ListSeparator;
