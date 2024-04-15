
'use strict';
import React, { Component } from 'react';

import {
  View,
  StyleSheet,
  TextInput,
  NativeModules,
  ScrollView,
  Dimensions,
  Platform,
  Alert,
  Image,
} from 'react-native';
import PropTypes from 'prop-types';

import Toolbar from '../Toolbar';
import KeyboardSpacer from '../KeyboardSpacer.js';
import UploadableImage from '../UploadableImage.js';
import Text from '../Text';
import Icon from '../Icon';
import { BLACK, GRAY, LIST_BG, PICBORDERCOLOR, DOCBKGCOLOR, ADDICONCOLOR } from '../../styles/color.js';
import NetworkImage from '../NetworkImage';
import TouchFeedback from '../TouchFeedback.js';
import PrivilegePanel from '../PrivilegePanel.js';
import NetworkDocumentCard from '../NetworkDocumentCard.js';
import Immutable from 'immutable';

import { checkFileNameIsImage } from '../../utils/fileHelper.js';

import { listenToKeyboardEvents } from 'react-native-keyboard-aware-scroll-view'
const KeyboardAwareScrollView = listenToKeyboardEvents(ScrollView);

export default class FeedBackView extends Component {
  constructor(props) {
    super(props);
    var { width } = Dimensions.get('window');
    var picWid = parseInt((width - 46) / 4.0);
    this.state = { imageWidth: picWid, imageHeight: picWid, autoFocus: false };
  }
  _logChanged(type, text) {
    this.setState({ autoFocus: true });
    this.props.dataChanged(type, null, text);
  }
  _showAuth() {
    return this.props.checkAuth();
  }
  _openImagePicker() {

    this.props.openImagePicker();
  }
  _goToDetail(items, itemObj) {
    var arrImages = [];
    items.map((item, index) => {
      if (checkFileNameIsImage(item.get('FileName'))) {
        arrImages.push(item);
      }
    });
    var newIndex = arrImages.findIndex((item) => item === itemObj);
    this.props.gotoDetail(Immutable.fromJS(arrImages), newIndex, { width: this.state.imageWidth, height: this.state.imageHeight });
  }
  _deleteImage(item) {
    if (!this._showAuth()) {
      return;
    }
    Alert.alert(
      '',
      checkFileNameIsImage(item.get('FileName')) ? '删除这张图片吗？' : '删除这个文件吗？',
      [
        { text: '取消', onPress: () => console.log('Cancel Pressed'), style: 'cancel' },
        {
          text: '删除', onPress: () => {
            this.props.dataChanged('image', 'delete', item);
            // AliyunOSS.delete(appInfo.get().ossBucket,item.get('PictureId'));
            // this.props.deleteImage([item.get('PictureId')]);
          }
        }
      ]
    )
  }
  _imageLoadComplete(item) {
    this.props.dataChanged('image', 'uploaded', item);
  }
  _saveLog() {
    if (!this._showAuth()) {
      return;
    }
    this.props.save();
  }
  _getSection(text) {
    if (!text) return null;
    return (
      <View style={{
        paddingTop: 19,
        paddingLeft: 16,
        paddingBottom: 10,
        backgroundColor: LIST_BG,
      }}>
        <Text style={{
          fontSize: 14,
          color: GRAY,
        }}>{text}</Text>
      </View>

    );
  }
  _getAddButton(index) {
    return (
      <View key={index} style={{ padding: 3 }}>
        <View style={{ borderWidth: 1, borderColor: ADDICONCOLOR }}
          width={this.state.imageWidth}
          height={this.state.imageHeight}>
          <TouchFeedback
            style={{ flex: 1, backgroundColor: 'transparent' }}
            key={index}
            onPress={() => this._openImagePicker()}>
            <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
              <Icon type='icon_add' size={36} color={ADDICONCOLOR} />
            </View>
          </TouchFeedback>
        </View>
      </View>
    );
  }
  _getImageView() {
    // console.warn("pics",this.props.log.get('Pictures'));
    var images = this.props.log.get('Pictures').map((item, index) => {
      if (!checkFileNameIsImage(item.get('FileName'))) {
        return (
          <View key={index} style={{
            margin: 3,
            borderWidth: 1,
            borderColor: PICBORDERCOLOR,
            backgroundColor: DOCBKGCOLOR,
            width: this.state.imageWidth,
            height: this.state.imageHeight
          }}>
            <NetworkDocumentCard
              imageWidth={this.state.imageWidth}
              imageHeight={this.state.imageHeight}
              item={item}
              index={index}
              numberOfLines={3}
              forceStoped={false}
              onLongPress={() => this._deleteImage(item)}>
            </NetworkDocumentCard>
          </View>
        );
      }
      else if (item.get('uri')) {
        // console.warn('loaded',item);
        return (
          <View key={index} style={{
            margin: 3,
            borderWidth: 1,
            borderColor: PICBORDERCOLOR,
            width: this.state.imageWidth,
            height: this.state.imageHeight
          }}>
            <UploadableImage
              name={item.get('PictureId')}
              uri={item.get('uri')}
              loaded={item.get('loaded')}
              resizeMode="cover"
              height={this.state.imageHeight} width={this.state.imageWidth}
              loadComplete={() => this._imageLoadComplete(item)}>
              <TouchFeedback
                style={{ flex: 1, backgroundColor: 'transparent' }}
                key={index}
                onPress={() => this._goToDetail(this.props.log.get('Pictures'), item)}
                onLongPress={() => this._deleteImage(item)}>
                <View style={{ flex: 1 }}></View>
              </TouchFeedback>
            </UploadableImage>
          </View>
        )
      }
      else {
        return (
          <View style={{
            margin: 3,
            borderWidth: 1,
            borderColor: PICBORDERCOLOR,
            backgroundColor: 'gray',
            width: this.state.imageWidth,
            height: this.state.imageHeight
          }}>
            <NetworkImage
              name={item.get('PictureId')}
              resizeMode="cover"
              width={this.state.imageWidth}
              height={this.state.imageHeight}>
              <TouchFeedback
                style={{ flex: 1, backgroundColor: 'transparent' }}
                key={String(index)}
                onPress={() => this._goToDetail(this.props.log.get('Pictures'), item)}
                onLongPress={() => this._deleteImage(item)}>
                <View style={{ flex: 1 }}></View>
              </TouchFeedback>
            </NetworkImage>
          </View>
        );
      }
    });
    if (this.props.canEdit) {// && this.props.log.get('Pictures').size < 9
      images = images.push(this._getAddButton(images.size));
    }
    if (images && images.size > 0) {
      return (
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', padding: 3 }}>
          {images}
        </View>
      );
    }
    return null;

  }
  _getButton() {
    if (!this.props.canEdit) {
      return null;
    }
    return (
      <PrivilegePanel hasAuth={true}>
        <TouchFeedback style={{ height: 48, }} onPress={() => this._openImagePicker()}>
          <View
            style={{ flexDirection: 'row', height: 48, justifyContent: 'center', alignItems: 'center' }}>
            <Icon type="photo" color={BLACK} size={18} />
            <Text style={{ fontSize: 15, color: BLACK, marginLeft: 16 }}>
              添加照片
            </Text>
          </View>
        </TouchFeedback>
      </PrivilegePanel>
    );
  }
  _getToolbar() {
    var actions = actions = [{ title: '提交', show: 'always' }];

    var content = this.props.log.get('Content');
    var images = this.props.log.get('Pictures');
    var { log } = this.props;
    return (
      <Toolbar
        title={'用户反馈'}
        navIcon="back"
        actions={actions}
        onIconClicked={this.props.onBack}
        onActionSelected={[() => {

          if (content || images.size > 0) {
            this._saveLog();
          } else {
            Alert.alert('', '请输入您的问题或建议');
          }
        }]} />
    );
  }
  _getContactEditView(lines, contact) {
    return (
      <TextInput
        key={'ContactsEdit'}
        style={[styles.input, { margin: 10, height: 20 }]}
        autoFocus={false}
        underlineColorAndroid={'transparent'}
        textAlign={'left'}
        editable={true}
        multiline={false}
        numberOfLines={1}
        placeholderTextColor={GRAY}
        textAlignVertical={'top'}
        placeholder={'电话或邮箱，便于我们和您取得联系'}
        onChangeText={(text) => this._logChanged('contacts', text)}
        value={contact} />
    );
  }
  _getTextEditView(lines, content, inputStyle) {
    if (this.props.canEdit) {
      return (
        <TextInput
          key={lines}
          //ref={(input)=>this._input=input}
          style={[styles.input, inputStyle]}
          autoFocus={this.state.autoFocus}
          underlineColorAndroid={'transparent'}
          textAlign={'left'}
          editable={Platform.OS === 'ios' ? this.props.canEdit : true}
          multiline={true}
          numberOfLines={lines}
          placeholderTextColor={GRAY}
          textAlignVertical={'top'}
          placeholder={this.props.canEdit ? this.props.inputPlaceholder : ''}
          onChangeText={(text) => this._logChanged('content', text)}
          value={content} />
      );
    } else {
      var textStyle = { height: 142 };
      if (lines >= 8) {
        textStyle = {};
      }
      return (
        <View style={textStyle}>
          <Text style={[styles.input]}>
            {content}
          </Text>
        </View>
      )
    }
  }
  render() {
    var { log } = this.props;
    if (!log) {
      return (
        <View style={{ flex: 1 }}>
        </View>
      )
    }

    var lines = 0;
    var content = this.props.log.get('Content');
    content.split('\n').forEach((item) => {
      lines++;
    });
    var contact = this.props.log.get('Contract');

    var imagesView = this._getImageView();
    var contentContainerStyle = {};
    var inputStyle = {};
    if (!imagesView) {
      contentContainerStyle = { flex: 1 };
      inputStyle = { flex: 1 }
    }
    else {
      inputStyle = { height: 142 }
    }
    // console.warn('lines',lines,content);
    return (
      <View style={{ flex: 1, backgroundColor: LIST_BG }}>
        {this._getToolbar()}
        <KeyboardAwareScrollView
          style={{ flex: 1, }}
          contentContainerStyle={[contentContainerStyle, { backgroundColor: 'white' }]}>
          {this._getSection('您对EnergyHub数字运维服务平台的建议:')}
          <View style={{ flex: 1 }}>
            {this._getTextEditView(lines, content, inputStyle)}
          </View>
          <View style={{ marginHorizontal: 8 }}>
            {imagesView}
          </View>
          {this._getSection('您的联系方式（选填）')}
          <View style={{ flex: 1 }}>
            {this._getContactEditView(lines, contact)}
          </View>
        </KeyboardAwareScrollView>
        <KeyboardSpacer />
      </View>
    );
  }
}


FeedBackView.propTypes = {
  log: PropTypes.object,
  user: PropTypes.object,
  onBack: PropTypes.func.isRequired,
  checkAuth: PropTypes.func,
  canEdit: PropTypes.bool,
  dataChanged: PropTypes.func.isRequired,
  deleteImage: PropTypes.func.isRequired,
  gotoDetail: PropTypes.func.isRequired,
  openImagePicker: PropTypes.func.isRequired,
  inputPlaceholder: PropTypes.string.isRequired,
  save: PropTypes.func.isRequired,
}

var styles = StyleSheet.create({
  input: {
    justifyContent: 'flex-start',
    alignItems: 'flex-start',
    textAlignVertical: 'top',
    fontSize: 14,
    color: BLACK,
    padding: 0,
    margin: 16,
    // backgroundColor:'gray'
  },
  button: {
    // marginTop:20,
    height: 48,
    flex: 1,
    marginHorizontal: 16,
    borderRadius: 6,

  },
});
