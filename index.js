/**
 * @format
 */

import React,{Component} from 'react';
import {View,Text,AppRegistry} from 'react-native';
import {name as appName} from './app.json';

AppRegistry.registerComponent(appName, () => App);

class App extends Component {

    render() {
        return (
            <View style={{flex:1,justifyContent:'center',alignItems:'center'}}>
                <Text>RN-0.71</Text>
            </View>
        )
    }
}

