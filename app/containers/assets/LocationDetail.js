import React, { Component } from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { connect } from 'react-redux';
import Toolbar from "../../components/Toolbar";
import { GRAY, GREEN, LINE } from "../../styles/color";
import SchActionSheet from "../../components/actionsheet/SchActionSheet";
import AlertDialog from "../../components/AlertDialog";
import privilegeHelper from "../../utils/privilegeHelper";
import Icon from "../../components/Icon";
import { isPhoneX } from '../../utils'
import TouchFeedback from "../../components/TouchFeedback";
import NetworkImage from "../../components/NetworkImage";
import PhotoShow from "./PhotoShow";
import immutable from 'immutable';
import trackApi from "../../utils/trackApi";
import backHelper from "../../utils/backHelper";

let bottom = 0;
if (isPhoneX()) bottom = 34;

class LocationDetail extends Component {

  constructor(props) {
    super(props);
    this.state = {};
  }

  componentDidMount() {
    trackApi.onPageBegin(this.props.route.id);
    backHelper.init(this.props.navigator, this.props.route.id);
  }

  componentWillUnmount() {
    trackApi.onPageEnd(this.props.route.id);
    backHelper.destroy(this.props.route.id);
  }

  _renderImages() {
    let images = this.props.images;
    if (!images || images.size === 0) {
      if (isPhoneX()) {
        return <View style={{ marginBottom: bottom }} />
      }
      return null;
    }

    //这里开始显示图片
    let items = images.map((item, index) => {
      let defaultUri = null;
      if (item) {
        defaultUri = { uri: item };
      } else {
        defaultUri = require('../../images/building_default/building.png');
      }
      return (
        <TouchFeedback key={item} onPress={() => this.imageClick(index)}>
          <View style={{
            width: 120, height: 120, borderColor: '#e8e8e8', borderWidth: 1, alignItems: 'center',
            borderRadius: 6, marginRight: 16, justifyContent: 'center', overflow: 'hidden'
          }}>
            <NetworkImage
              style={{}}
              imgType='jpg'
              defaultSource={defaultUri}
              width={120} height={120}
              name={item} />
          </View>
        </TouchFeedback>
      )
    });
    return (
      <View style={{ marginBottom: 16 + bottom }}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View style={{ width: 16 }} />
          {items}
        </ScrollView>
      </View>
    )
  }

  imageClick(index) {
    let items = this.props.images.map(item => {
      return immutable.fromJS({ PictureId: item });
    });
    items = immutable.fromJS(items);
    this.props.navigation.push('PageWarpper', {
      id: 'photo_show',
      component: PhotoShow,
      passProps: {
        index: index,
        arrPhotos: items,
        thumbImageInfo: { width: 156, height: 156 },
        canEdit: false,
      }
    });
  }

  render() {
    let lat = this.props.rowData.getIn(['building', 'Location', 'Latitude']);
    let lon = this.props.rowData.getIn(['building', 'Location', 'Longitude']);
    return (
      <View style={{ flex: 1, backgroundColor: 'white' }}>
        <Toolbar
          title={'位置详情'}
          navIcon="back"
          noShadow={true}
          onIconClicked={() => this.props.navigation.pop()}
        />
        {true ? null :
          <View pointerEvents={'auto'} focusable={true}
            style={{ flex: 1, backgroundColor: '#abcabc', justifyContent: 'center', alignItems: 'center' }}>

          </View>
        }
        <View style={{
          backgroundColor: '#fff', borderTopLeftRadius: 12,
          borderTopRightRadius: 12, left: 0, right: 0, bottom: 0
        }}>
          <View style={{ margin: 16 }}>
            <Text style={{ fontSize: 17, color: '#333' }}>
              <Icon type={'icon_asset_location'} color={'#000'} size={17} />
              <Text style={{ fontWeight: '600' }}>{'  ' + this.props.rowData.getIn(['building', 'Name'])}</Text>
            </Text>
            <Text style={{ fontSize: 14, color: '#888', lineHeight: 23, marginTop: 10 }}>
              {this.props.rowData.getIn(['boxLocation'])}
            </Text>
          </View>
          {this._renderImages()}
        </View>
      </View>
    );
  }
}

function mapStateToProps(state, ownProps) {
  return {
  }
}

export default connect(mapStateToProps, {})(LocationDetail);
