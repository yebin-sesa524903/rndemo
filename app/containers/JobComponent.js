import React,{Component,PureComponent} from 'react';
import {Platform, View} from 'react-native';
import BackgroundJob from "react-native-background-job";

if(Platform.OS === 'android'){
  const backgroundJob = {
    jobKey: "backgroundDownloadTask",
    job: () => {}
  };
  BackgroundJob.register(backgroundJob);
}

export class JobComponent extends PureComponent {

  componentDidMount() {
    BackgroundJob.schedule({
      jobKey: "backgroundDownloadTask",//后台运行任务的key
      period: 500,                     //任务执行周期
      exact: true,                     //安排一个作业在提供的时间段内准确执行
      allowWhileIdle: true,            //允许计划作业在睡眠模式下执行
      allowExecutionInForeground: true,//允许任务在前台执行
    });
  }

  render() {
    return (
      <View/>
    )
  }
}
