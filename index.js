/**
 * @format
 */

import React,{Component} from 'react';
import {View,Text,AppRegistry} from 'react-native';
import {name as appName} from './app.json';

AppRegistry.registerComponent(appName, () => App);

class App extends Component {

    getVersion() {
        return isConnected()?'1':'0'
    }

    render() {
        return (
            <View style={{flex:1,justifyContent:'center',alignItems:'center'}}>
                <Text>RN-0.71-hello sonar tow branch</Text>
                <Text>add three branch hello</Text>
                <Text>{'version:'+this.getVersion()}</Text>
            </View>
        )
    }
}

