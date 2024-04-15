import React, { Component } from 'react';
import { View, Text, InteractionManager } from 'react-native';
import { connect } from 'react-redux';
import Toolbar from "../../components/Toolbar";
import { GRAY } from "../../styles/color";
import SchActionSheet from "../../components/actionsheet/SchActionSheet";
import AlertDialog from "../../components/AlertDialog";
import privilegeHelper from "../../utils/privilegeHelper";
import { updateLogbookRoom, delLogbookRoom, loadFloor } from '../../actions/assetsAction';
import AssetNameEdit from "./AssetNameEdit";
import trackApi from "../../utils/trackApi";
import backHelper from "../../utils/backHelper";
import PropTypes from 'prop-types';

class Floor extends Component {

  constructor(props) {
    super(props);
    this.state = { name: props.ownData.get('Name') };
  }

  static contextTypes = {
    showSpinner: PropTypes.func,
    hideHud: PropTypes.func
  };

  componentDidMount() {
    trackApi.onPageBegin(this.props.route.id);
    backHelper.init(this.props.navigator, this.props.route.id);

    trackApi.onTrackEvent('App_ViewAssetDetailTab', {
      asset_type: '楼层',
      switching_room_name: this.state.name,
      asset_tab_name: '楼层信息',
      building_name: this.props.BuildingName || '',
      building_id: String(this.props.BuildingId || ''),
      customer_id: String(this.props.CustomerId || ''),
      customer_name: this.props.CustomerName || '',
    });

    this.props.loadFloor(this.props.ownData.get('Id'));
  }

  componentWillUnmount() {
    trackApi.onPageEnd(this.props.route.id);
    backHelper.destroy(this.props.route.id);
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.isPosting !== this.props.isPosting) {
      if (nextProps.isPosting !== 1) this.context.hideHud();
      //说明删除设备成功，需要返回上一级
      if (nextProps.isPosting === 0) {
        InteractionManager.runAfterInteractions(() => {
          this.props.navigation.pop();
        });
      }
    }
    if (nextProps.isUpdatePosting !== this.props.isUpdatePosting) {
      if (nextProps.isUpdatePosting !== 1) this.context.hideHud();
      if (nextProps.isUpdatePosting === 0) {
        //更新UI
        if (this._name) {
          this.setState({ name: this._name })
        }
      }
    }

  }

  _delFloor(id) {
    this.context.showSpinner('posting');
    this.props.delLogbookRoom(id);
  }
  _updateFloor(id, name) {
    this.context.showSpinner('posting');
    this.props.updateLogbookRoom(id, name);
    this._name = name;
  }

  _editFloorName() {
    this.props.navigation.push('PageWarpper', {
      id: 'asset_name_edit',
      component: AssetNameEdit,
      passProps: {
        type: 'Floor',
        customerId: this.props.CustomerId,
        customerName: this.props.CustomerName,
        hierarchyId: this.props.ownData.get('Id'),
        arrPhotos: this.props.arrPhotos,
        onBack: () => this.props.navigation.pop(),
        title: '编辑楼层',
        hint: '请输入',
        name: this.state.name,
        submit: (text) => this._updateFloor(this.props.ownData.get('Id'), text)
      }
    });
  }

  _onDialogClick(index) {
    this.setState({ modalDialog: false });
    switch (index) {
      case 0:
        break;

      case 1://执行删除接口
        setTimeout(() => {
          this._delFloor(this.props.ownData.get('Id'));
        }, 100);
        break;
    }
  }

  _showAlertDialog() {
    let title = '删除当前楼层？';
    let buttons = [{ text: '取消', textColor: '#007aff' }, { text: '删除', textColor: '#ff4d4d' }]
    if (this.state.modalDialog) {
      return (
        <AlertDialog modalShow={this.state.modalDialog} buttons={buttons}
          title={title} onClick={index => this._onDialogClick(index)} />
      );
    } else {
      return null;
    }
  }

  _showMenu() {
    let label = '编辑楼层';
    let arr = [label, '删除'].map((item, index) => {
      return { title: item, select: true, index }
    });
    this.setState({ 'modalVisible': true, arrActions: arr });
  }

  _menuClick(item) {
    this.setState({ modalVisible: false }, () => {
      //判断是修改还是删除
      if (item.index == 0) {
        //跳转到修改
        this._editFloorName();
      } else {
        setTimeout(() => {
          this.setState({
            modalDialog: true
          })
        }, 20);
      }
    });

  }

  _getActionSheet() {
    var arrActions = this.state.arrActions;
    if (!arrActions) {
      return;
    }
    if (this.state.modalVisible) {
      return (
        <SchActionSheet title={''} arrActions={arrActions} modalVisible={this.state.modalVisible}
          onCancel={() => {
            this.setState({ 'modalVisible': false });
          }}
          onSelect={item => this._menuClick(item)}
        />
      )
    }
  }

  render() {
    let actions = [];
    if (this.props.logbookPermission) {
      actions = [{ title: `&#xf16f;`, show: 'always', isFontIcon: true, type: 'icon_more' }];
    }
    return (
      <View style={{ flex: 1, backgroundColor: 'white' }}>
        <Toolbar
          title={this.state.name}
          navIcon="back"
          noShadow={true}
          onIconClicked={() => this.props.navigation.pop()}
          actions={actions}
          onActionSelected={[() => this._showMenu()]}
        />
        {this._getActionSheet()}
        {this._showAlertDialog()}
      </View>
    );
  }
}

function mapStateToProps(state, ownProps) {
  let hasLogbookPermission = privilegeHelper.hasAuth('RegDeviceFullPrivilegeCode');
  let floor = state.asset.floor;
  if (!floor.get('isLogbook')) hasLogbookPermission = false;
  return {
    logbookPermission: hasLogbookPermission,
    isPosting: state.asset.buildHierarchyData.get('isDelRoomPosting'),
    isUpdatePosting: state.asset.buildHierarchyData.get('isUpdateRoomPosting'),
  }
}

export default connect(mapStateToProps, { updateLogbookRoom, delLogbookRoom, loadFloor })(Floor);
