
'use strict';
import React, { Component } from 'react';
import {
  Alert,

  InteractionManager,
  Platform,
  View,
} from 'react-native';
import PropTypes from 'prop-types';
import ListView from 'deprecated-react-native-listview';
import { connect } from 'react-redux';
import backHelper from '../../utils/backHelper';
import BuildingHealthyView from '../../components/assets/BuildingHealthy.js';
import DeviceHealthy from './DeviceHealthy.js';
import privilegeHelper from '../../utils/privilegeHelper.js';
import { loadBuildingHealthy, loadBuildingTransformer, resetHealthyData } from '../../actions/assetsAction.js';
import trackApi from '../../utils/trackApi.js';
import { Navigator } from 'react-native-deprecated-custom-components';

var Orientation = require('react-native-orientation');
var _startToExit = false;

class BuildingHealthy extends Component {
  constructor(props) {
    super(props);
    this.state = {
      startAnim: false,
      stopAnimat: false,
    };
  }
  _loadHealthyData() {
    this.props.loadBuildingHealthy(this.props.hierarchyId);
    this.props.loadBuildingTransformer(this.props.hierarchyId);
  }
  _gotoDetail(data) {
    trackApi.onTrackEvent('App_SysOperation', {
      customer_id: String(this.props.customer_id || ''),
      customer_name: this.props.customer_name,
      building_id: String(this.props.building_id || ''),
      building_name: this.props.building_name
    })
    var sceneConfig = Navigator.SceneConfigs.FloatFromBottom;
    // sceneConfig.gestures={};
    this.props.navigation.push('PageWarpper', {
      id: 'device_healthy',
      component: DeviceHealthy,
      sceneConfig: sceneConfig,
      passProps: {
        devicesDatas: data,
      },
    });
  }
  _orientationDidChange(orientation) {
    if (Platform.OS === 'android' || _startToExit) {
      // Orientation.lockToPortrait();
      return;
    }
    if (orientation === 'LANDSCAPE') {
      //do something with landscape layout
    } else {
      //do something with portrait layout
      console.warn('history..._orientationDidChange');
      Orientation.lockToLandscape();
    }
  }
  componentDidMount() {
    trackApi.onPageBegin('sys_overview', this.props.customer_id, this.props.customer_name);
    // backHelper.init(this.props.navigator,this.props.route.id);

    Orientation.lockToLandscape();//ios is here
    Orientation.addOrientationListener(this._orientationDidChange);
    // StatusBar.setHidden(true);

    // InteractionManager.runAfterInteractions(()=>{
    this._loadHealthyData();
    this.setState({ startAnim: true });
    // backHelper.init(this.props.navigator,this.props.route.id,()=>{
    //   console.warn('1');
    //   // this.setState({startAnim:false});
    //   Orientation.lockToPortrait();//when hardware back
    //   this.props.resetHealthyData();
    //   this.props.navigation.pop();
    // });
    // });

    this._gestureHandlers = {
      onStartShouldSetResponder: () => true,
      onResponderGrant: () => {
        // console.warn('onResponderGrant');
        // this._healthyView.willExitView(()=>{
        // });
      },
      onResponderTerminate: () => {
        console.warn('onResponderTerminate');
        // _startToExit=true;
        //
        // console.warn('2222');
        // Orientation.removeOrientationListener(this._orientationDidChange);
        // Orientation.lockToPortrait();
        // this.props.resetHealthyData();
        //
        // InteractionManager.runAfterInteractions(()=>{
        //   this.props.navigation.pop();
        // });
      },
      // onResponderRelease: () => {
      //   console.warn('onResponderRelease');
      //   // Orientation.lockToPortrait();
      //   // InteractionManager.runAfterInteractions(()=>{
      //   //   this.props.navigation.pop();
      //   // });
      // },
    };

  }
  componentWillReceiveProps(nextProps) {
    // console.warn('3333',this.props.healthyDatas,nextProps.healthyDatas);
    // if(this.props.healthyDatas && !nextProps.healthyDatas){
    // InteractionManager.runAfterInteractions(() => {
    // this._loadHealthyData();
    // });
    // return ;
    // }
  }
  componentWillUnmount() {
    trackApi.onPageEnd('sys_overview');
    // backHelper.destroy(this.props.route.id);
    Orientation.removeOrientationListener(this._orientationDidChange);
  }
  render() {
    return (
      <View style={{ flex: 1 }}>
        <BuildingHealthyView
          ref={(obj) => {
            this._healthyView = obj;
          }}
          title={'健康状况'}
          healthyDatas={this.props.healthyDatas}
          dataTransformer={this.props.dataTransformer}
          isFetching={this.props.isFetching}
          startAnim={this.state.startAnim}
          stopAnimat={this.state.stopAnimat}
          onRefresh={() => this._loadHealthyData()}
          onRowClick={(rowData) => this._gotoDetail(rowData)}
          onBack={() => {
            _startToExit = true;
            Orientation.removeOrientationListener(this._orientationDidChange);
            Orientation.lockToPortrait();//when left top button back
            this.props.resetHealthyData();
            this.setState({ stopAnimat: true });
            InteractionManager.runAfterInteractions(() => {
              // this.setState({startAnim:false});
              this.props.navigation.pop();
            });

          }}
        />
      </View>

    );
  }
}

BuildingHealthy.propTypes = {
  navigator: PropTypes.object,
  route: PropTypes.object,
  user: PropTypes.object,
  isFetching: PropTypes.bool,
  loadBuildingHealthy: PropTypes.func,
  loadBuildingTransformer: PropTypes.func,
  resetHealthyData: PropTypes.func,
  hierarchyId: PropTypes.number,
  healthyDatas: PropTypes.object,//immutable
  dataTransformer: PropTypes.object,
}

function mapStateToProps(state, ownProps) {
  var id = ownProps.hierarchyId;
  var healthy = state.asset.buildingHealthy;
  var healthyDatas = null;
  var dataTransformer = null;
  // console.warn('mapStateToProps',Math.random(),healthy.get('hierarchyId'),id);
  if (healthy.get('hierarchyId') === id) {
    healthyDatas = healthy.get('dataHealthy');
    dataTransformer = healthy.get('dataTransformer');
  }
  return {
    user: state.user.get('user'),
    healthyDatas: healthyDatas,
    dataTransformer: dataTransformer,
    isFetching: healthy.get('isFetching')
  };
}

export default connect(mapStateToProps, { loadBuildingHealthy, loadBuildingTransformer, resetHealthyData })(BuildingHealthy);
